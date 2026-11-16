import { expect, test } from "@playwright/test";
import { loadMatch } from "../src/lib/analyst/analyst";
import previewHandler from "../src/pages/api/analyst/preview";
import watchedStrip from "../src/pages/api/bet-suggester/watched-strip";
import tapeNow from "../src/pages/api/bet-suggester/tape-now";
import liveWatchlist from "../src/pages/api/bet-suggester/live-watchlist/index";
import resolveWatchlist from "../src/pages/api/bet-suggester/live-watchlist/resolve";
import syncPositions from "../src/pages/api/bet-suggester/live-watchlist/sync-positions";

// AUDIT W5-FE-03 and W5-FE-07 (2026-11-15). Hermetic: the routes are
// called as functions and `fetch` is replaced for every test, so no
// request leaves this process. The stub records what the code TRIED to
// read, which is the point of the W5-FE-03 half.

type Res = {
  statusCode: number; body: unknown; headers: Record<string, string>;
  status(c: number): Res; json(b: unknown): Res; send(b: unknown): Res;
  setHeader(k: string, v: string): void;
};
function mockRes(): Res {
  const r: Res = {
    statusCode: 200, body: undefined, headers: {},
    status(c) { r.statusCode = c; return r; },
    json(b) { r.body = b; return r; },
    send(b) { r.body = b; return r; },
    setHeader(k, v) { r.headers[k.toLowerCase()] = v; },
  };
  return r;
}
const req = (o: { method: string; query?: Record<string, string>; body?: unknown }) =>
  ({ method: o.method, query: o.query ?? {}, body: o.body,
    headers: { "x-forwarded-for": "203.0.113.9", "x-admin-token": "test-token" }, socket: {} }) as never;

const realFetch = globalThis.fetch;
let fetched: string[] = [];
let answer: () => Promise<Response> = async () => { throw new TypeError("fetch failed"); };
test.beforeEach(() => {
  fetched = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    fetched.push(String(url));
    return answer();
  }) as typeof fetch;
});
test.afterEach(() => { globalThis.fetch = realFetch; });

// ---- W5-FE-03: one match, one id ---------------------------------------
test.describe("W5-FE-03: a zero-padded match id is not a second cache key", () => {
  for (const id of ["0401878768", "00401878768", "0"]) {
    test(`loadMatch refuses ${id} as a bad match id, reading nothing`, async () => {
      await expect(loadMatch("epl", id)).rejects.toMatchObject({ status: 400, message: "bad match id" });
      expect(fetched).toEqual([]);
    });
  }

  test("the preview route answers 400 for a padded id, with no backend read", async () => {
    process.env.ANALYST_ENABLED = "true";
    try {
      const res = mockRes();
      await previewHandler(req({ method: "GET", query: { league: "epl", id: "0401878768" } }), res as never);
      expect(res.statusCode).toBe(400);
      expect(fetched).toEqual([]);
    } finally { delete process.env.ANALYST_ENABLED; }
  });

  test("a canonical id still reaches the backend", async () => {
    // the stub refuses the fetch, so the read fails, but it was attempted
    await expect(loadMatch("epl", "401878768")).rejects.toBeTruthy();
    expect(fetched.some((u) => u.endsWith("/api/epl/match/401878768"))).toBe(true);
  });
});

// ---- W5-FE-07: operator relays are never cacheable -----------------------
type Handler = (req: never, res: never) => Promise<unknown>;
const ROUTES: { name: string; handler: Handler; method: string; wrong: string; query?: Record<string, string>; body?: unknown }[] = [
  { name: "watched-strip", handler: watchedStrip as Handler, method: "GET", wrong: "POST" },
  { name: "live-watchlist GET", handler: liveWatchlist as Handler, method: "GET", wrong: "DELETE" },
  { name: "live-watchlist POST", handler: liveWatchlist as Handler, method: "POST", wrong: "PUT",
    query: { event_id: "401878768", action: "add", actor: "web" } },
  { name: "live-watchlist/resolve", handler: resolveWatchlist as Handler, method: "POST", wrong: "GET",
    body: { event_ids: ["401878768"] } },
  { name: "sync-positions", handler: syncPositions as Handler, method: "POST", wrong: "GET" },
  { name: "tape-now", handler: tapeNow as Handler, method: "POST", wrong: "GET" },
];

test.describe("W5-FE-07: token-relaying routes send Cache-Control: private, no-store", () => {
  for (const r of ROUTES) {
    test(`${r.name}: on a relayed answer, an unreachable backend and a wrong verb`, async () => {
      const call = async (method: string) => {
        const res = mockRes();
        await r.handler(req({ method, query: r.query, body: r.body }), res as never);
        return res;
      };
      // a backend refusal relayed as-is (the operator gate's 403)
      answer = async () => new Response(JSON.stringify({ detail: "forbidden" }),
        { status: 403, headers: { "content-type": "application/json" } });
      const relayed = await call(r.method);
      expect(fetched.length, "the route read its backend").toBeGreaterThan(0);
      expect(relayed.headers["cache-control"]).toBe("private, no-store");
      // the backend never reached
      answer = async () => { throw new TypeError("fetch failed"); };
      const down = await call(r.method);
      expect(down.statusCode).toBe(502);
      expect(down.headers["cache-control"]).toBe("private, no-store");
      // a verb the route does not have
      const wrong = await call(r.wrong);
      expect(wrong.statusCode).toBe(405);
      expect(wrong.headers["cache-control"]).toBe("private, no-store");
    });
  }
});
