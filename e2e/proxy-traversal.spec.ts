import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { test, expect, type APIRequestContext } from "@playwright/test";
import { HOLDOUT_URL, LIVE, STANDIN_URL } from "./backend";
import { confinementBreach, queryBreach } from "../src/lib/suggesterProxy";

// NO PROXY ROUTE CAN BE WALKED OUT OF ITS OWN PREFIX (2026-09-25, audit F1).
//
// Fifteen legacy WC26 routes interpolated query and path values straight
// into backend paths, and undici normalises `..` before it sends — so
// `/api/bet-suggester/prediction?match_id=../mls/risk%23` arrived at the
// backend as GET /api/mls/risk, and the same trick reached the operator's
// journal, the quota-spending `comp/*/drift` and the board, the one GET
// that WRITES.
//
// THE CLAIM IS READ OFF THE BACKEND'S OWN SOCKET, not off the proxy's
// answer. Every route file under src/pages/api is enumerated from the
// filesystem (a route added tomorrow is covered without anybody listing
// it), each is fired every payload below in every value it interpolates
// — its dynamic segments and every `req.query` key its source reads —
// and then the stand-in backend's request log (e2e/stand-in-backend.mjs,
// `/__standin/log`) and the board hold-out's ledger are read back. A
// payload carries a unique canary; no canary may ever appear in a path
// or as a query KEY upstream, and no withheld route may appear at all.
//
// HERMETIC ONLY, AND IT REFUSES TO RUN OTHERWISE: it fires traversal
// payloads, and those must never be pointed at a real backend.

const API = join(__dirname, "..", "src", "pages", "api");

type Route = { file: string; template: string; params: string[] };

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

/** Every API route, with its URL template (`{seg}` for a dynamic segment,
 *  `{...}` for a catch-all) and the `req.query` keys its source reads. */
function routes(): Route[] {
  return walk(API).map((file) => {
    const rel = relative(API, file).replace(/\.ts$/, "").replace(/\/index$/, "");
    const template = "/api/" + rel.split("/").map((s) =>
      s.startsWith("[...") ? "{...}" : s.startsWith("[") ? "{seg}" : s).join("/");
    const src = readFileSync(file, "utf8");
    const keys = new Set<string>();
    for (const m of src.matchAll(/req\.query\.(\w+)/g)) keys.add(m[1]);
    for (const m of src.matchAll(/const \{([^}]*)\}\s*=\s*req\.query/g)) {
      for (const k of m[1].split(",")) keys.add(k.trim().split(":")[0].trim());
    }
    // the path slots are read out of req.query too; they are fired as
    // path segments below, not as query parameters
    for (const m of rel.matchAll(/\[(?:\.\.\.)?(\w+)\]/g)) keys.delete(m[1]);
    return { file: relative(join(API, "..", "..", ".."), file), template,
             params: [...keys].filter(Boolean).sort() };
  });
}

/** Raw payloads — what the server's decoded value will be. `C` is
 *  replaced with that payload's canary. */
const PAYLOADS = [
  "../C#", "../../C#", "../../../C?x=1", "..\\C", "./C",
  "%2e%2e/C", "%2e%2e%2fC", "x/../../C", "..;/C",
  "1&C=1", "1?C=1", "1#C", "1/../C",
  // the audit's own targets, each still carrying a canary
  "../mls/risk?C=1#", "../mls/journal?C=1#", "../comp/ucl/drift?C=1#",
  "../picker/board?days=30&C=1#",
];

/** The routes the proxies must never reach, whatever the payload. */
const WITHHELD = [
  /^\/api\/mls\/(journal|paper|risk|corpus|audit|model-eval|scorer|slate|metrics|stats-coverage)(\/|$)/,
  /^\/api\/mls\/(replay|briefing|decision-sheet)\//,
  /^\/api\/comp\/[^/]+\/(drift|journal)(\/|$)/,
];

test.describe("proxy traversal", () => {
  test.skip(LIVE, "fires traversal payloads — hermetic runs only");

  async function standinLog(request: APIRequestContext) {
    const r = await request.get(`${STANDIN_URL}/__standin/log`);
    expect(r.ok(), "the stand-in backend's log is not readable — this "
      + "guard only runs against the stand-in").toBe(true);
    return (await r.json()) as { requests: { at: string; method: string; url: string }[] };
  }

  test.beforeAll(async ({ request }) => {
    // A HARD STOP, not a skip: a traversal fired at anything but the
    // stand-in is exactly the request this file exists to prevent.
    const r = await request.get(`${STANDIN_URL}/__standin/log`)
      .catch(() => null);
    if (!r || !r.ok()) {
      throw new Error(`no stand-in backend at ${STANDIN_URL}; refusing to `
        + "fire traversal payloads at whatever the app is pointed at");
    }
  });

  test("the confinement rule itself refuses every escape and admits the "
    + "ordinary path", () => {
      const within = "/api/prediction/M1";
      for (const bad of [
        "/api/prediction/../mls/risk", "/api/prediction/M1/../../mls/risk",
        "/api/prediction/%2e%2e/mls", "/api/prediction/M1%2F..",
        "/api/prediction/M1#x", "/api/prediction//M1", "/api/prediction\\..",
        "/api/predictionX", "/api/mls/risk", "api/prediction/M1",
        "/api/prediction/./M1",
      ]) {
        expect(confinementBreach(bad, within), bad).not.toBeNull();
      }
      expect(confinementBreach("/api/prediction/M1?force_refresh=false",
                               within)).toBeNull();
      expect(confinementBreach("/api/mls/schedule?days=7", "/api/mls/"))
        .toBeNull();
      // and the numeric bounds
      expect(queryBreach("mls/schedule", "days=36500")).not.toBeNull();
      expect(queryBreach("mls/schedule", "days=7")).toBeNull();
      expect(queryBreach("picker/review", "back=99999")).not.toBeNull();
      expect(queryBreach("picker/review", "back=7&leagues=mls")).toBeNull();
      expect(queryBreach("mls/schedule", "days=1&days=99")).not.toBeNull();
      expect(queryBreach("comp/ucl/fixtures", "days=3")).toBeNull();
      expect(queryBreach("comp/ucl/fixtures", "days=61")).not.toBeNull();
    });

  test("no payload in any proxy route reaches a path outside its prefix — "
    + "read off the stand-in's own request log", async ({ request }) => {
      test.setTimeout(180_000);
      const all = routes();
      // NON-VACUITY: the enumeration found the routes the audit named
      const templates = all.map((r) => r.template);
      expect(all.length).toBeGreaterThan(35);
      for (const t of ["/api/bet-suggester/prediction",
                       "/api/bet-suggester/team-info/{seg}",
                       "/api/bet-suggester/timing", "/api/mls/{...}",
                       "/api/{seg}/{...}"]) {
        expect(templates).toContain(t);
      }
      expect(all.find((r) => r.template === "/api/bet-suggester/timing")!
        .params).toEqual(["market_id", "match_id"]);

      const run = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      const shots: { method: string; url: string }[] = [];
      let n = 0;
      const canary = () => `__cnry${run}x${(n += 1)}`;
      const enc = encodeURIComponent;
      for (const r of all) {
        const methods = /watchlist\.ts$/.test(r.file) ? ["GET", "DELETE"]
          : /\/live\.ts$/.test(r.file) ? ["POST"] : ["GET"];
        for (const raw of PAYLOADS) {
          // every slot gets the payload, each with its own canary; the
          // generic prefix slot is held at a real prefix here and walked
          // on its own below
          const fill = (tpl: string) => {
            let out = tpl.startsWith("/api/{seg}/")
              ? tpl.replace("{seg}", "mls") : tpl;
            while (out.includes("{seg}")) {
              out = out.replace("{seg}", enc(raw.replace("C", canary())));
            }
            return out.replace("{...}",
              `schedule/${enc(raw.replace("C", canary()))}`);
          };
          const base = r.template.includes("{") ? fill(r.template)
            : r.template;
          for (const method of methods) {
            if (r.template.includes("{")) shots.push({ method, url: base });
            for (const p of r.params) {
              const c = canary();
              const plain = r.template.replaceAll("{seg}", "mls")
                .replace("{...}", "schedule");
              shots.push({ method,
                url: `${plain}?${p}=${enc(raw.replace("C", c))}` });
            }
          }
        }
        // the catch-all's prefix slot, walked too
        if (r.template === "/api/{seg}/{...}") {
          for (const raw of PAYLOADS) {
            const c = canary();
            shots.push({ method: "GET",
              url: `/api/${enc(raw.replace("C", c))}/standings` });
          }
        }
      }
      expect(shots.length).toBeGreaterThan(300);

      // POSITIVE CONTROL: an ordinary value still arrives where it should,
      // so an empty log cannot pass this test by being empty
      const ok = `M${run}`;
      shots.push({ method: "GET",
        url: `/api/bet-suggester/prediction?match_id=${ok}` });
      shots.push({ method: "GET", url: `/api/bet-suggester/team-info/${ok}` });

      const started = new Date().toISOString();
      const statuses = new Map<number, number>();
      for (let i = 0; i < shots.length; i += 12) {
        await Promise.all(shots.slice(i, i + 12).map(async (s) => {
          const res = await request.fetch(s.url,
            { method: s.method, timeout: 30_000, maxRedirects: 0 })
            .catch(() => null);
          const st = res?.status() ?? 0;
          statuses.set(st, (statuses.get(st) ?? 0) + 1);
        }));
      }

      const seen = (await standinLog(request)).requests
        .filter((e) => e.at >= started);
      const ledger = await (await request.get(`${HOLDOUT_URL}/__holdout/ledger`))
        .json() as { refused: { at: string; url: string }[] };

      const breaches: string[] = [];
      for (const e of seen) {
        const u = new URL(e.url, "http://standin.invalid");
        if (u.pathname.includes("__cnry")
            || [...u.searchParams.keys()].some((k) => k.includes("__cnry"))) {
          breaches.push(`canary escaped: ${e.method} ${e.url}`);
        }
        if (!u.pathname.startsWith("/api/")) {
          breaches.push(`left /api entirely: ${e.method} ${e.url}`);
        }
        if (WITHHELD.some((re) => re.test(u.pathname))) {
          breaches.push(`reached a withheld route: ${e.method} ${e.url}`);
        }
      }
      for (const e of ledger.refused.filter((x) => x.at >= started)) {
        if (e.url.includes("__cnry") || e.url.includes("days=30")) {
          breaches.push(`reached the board (held out): ${e.url}`);
        }
      }
      expect(breaches, `${breaches.length} of ${shots.length} requests `
        + `reached the backend outside their route's prefix; statuses `
        + `${JSON.stringify([...statuses])}`).toEqual([]);

      // …and the ordinary value did arrive, verbatim, where it belongs
      const urls = seen.map((e) => e.url);
      expect(urls).toContain(`/api/prediction/${ok}?force_refresh=false`);
      expect(urls).toContain(`/api/team-info/${ok}`);
    });

  test("out-of-range numeric parameters are refused before any backend is "
    + "asked", async ({ request }) => {
      const run = Date.now().toString(36);
      const cases = [
        [`/api/mls/schedule?days=36500&r${run}=1`, 400],
        [`/api/picker/review?back=99999&r${run}=1`, 400],
        [`/api/comp/ucl/fixtures?days=9999&r${run}=1`, 400],
        [`/api/championships/board?days=400&r${run}=1`, 400],
        [`/api/bet-suggester/upcoming?hours_ahead=99999&r${run}=1`, 400],
        // and an in-range one is forwarded (the stand-in answers 503)
        [`/api/mls/schedule?days=7&r${run}=1`, 503],
      ] as const;
      const started = new Date().toISOString();
      for (const [url, status] of cases) {
        const r = await request.get(url);
        expect(r.status(), url).toBe(status);
        if (status === 400) {
          expect((await r.json()).reason).toBe("invalid_parameter");
        }
      }
      const seen = (await standinLog(request)).requests
        .filter((e) => e.at >= started && e.url.includes(`r${run}=1`))
        .map((e) => e.url);
      expect(seen).toEqual([`/api/mls/schedule?days=7&r${run}=1`]);
    });
});
