import { readFileSync } from "node:fs";
import { expect, test, type Page, type Request } from "@playwright/test";
import { hydrated, view } from "./operator-console";
import { LIVE, STANDIN_URL } from "./backend";
import { LEDGER_PAGE_1, LEDGER_RECORDED } from "./trading-ledger-recorded";

// TRADES & GROUNDS ON THE OPERATOR CONSOLE (2026-10-06).
//
// Son, 2026-10-06: "I need you to work with me on the trader strategy,
// tell me about all of its trade and its ground". What the section
// promises beyond reading the backend's payload (that is
// e2e/ops-trading-ledger-contract.spec.ts, on payloads RECORDED from the
// backend — e2e/trading-ledger-recorded.ts — which every test here serves
// too, so nothing here certifies a shape the backend does not send):
//
//   - filters go to the backend as named parameters — the day as a bare
//     date (the backend reads `until` to that day's end) — and clearing
//     them asks for everything again;
//   - an older page that fails is named, and the rows already read stay;
//   - "Export CSV" downloads the loaded rows with a missing value as an
//     EMPTY cell, never 0, and an unsettled P&L empty, never 0;
//   - with no limit in the summary, the status route's is used and named;
//   - a missing route reads "not available yet"; a refusal, an error, an
//     answer that is not JSON or not an object is named;
//   - honest labels; at 400 px the page does not scroll sideways, the
//     table scrolls in its own box, and an opened row's grounds stay in
//     view;
//   - the proxy passes the named filters only (offset, not a cursor), held
//     to the backend's own rules, refuses a bad value before any backend
//     is asked, and is a read.
//
// Every UI test serves the status, the book, the candidates and the
// ledger with page.route — no backend. EXPERIMENTAL, UNPROVEN.

const STATUS = "**/api/ops/trading-status";
const BOOK = "**/api/ops/trading-book";
const CANDIDATES = "**/api/ops/trading-candidates";
const LEDGER = "**/api/ops/trading-ledger**";
const TOKEN = "ops-ledger-token-typed-by-a-person";

const at = (minutesFromNow: number) =>
  new Date(Date.now() + minutesFromNow * 60_000).toISOString();
/** a UTC calendar day, `offset` days from today */
const day = (offset: number) =>
  new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

const STATUS_PAYLOAD = {
  label: "experimental, unproven", version: "trading-status-v0",
  strategy: "consensus-v2", env: "prod", enabled: true, kill: false,
  halt: { active: false }, balance: "48.12", generated_at: at(0),
  daily_loss: { used: "1.20", limit: "10.00" },
};

const EMPTY_BOOK = {
  version: "trading-book-v1", positions: [], orders: [],
  totals: { positions: 0, orders: 0, managed_contracts: 0, manual_contracts: 0 },
};
const EMPTY_CANDIDATES = { version: "trading-candidates-v1", rows: [] };

type Rec = (typeof LEDGER_RECORDED)["rows"][number];
const REC = LEDGER_RECORDED.rows as readonly Rec[];
const byOrder = (oid: string) => REC.find((r) => r.order_id === oid)!;
const WON = byOrder("ord-1");
const V2 = byOrder("v2-1");
const OLD = byOrder("old-2");

const json = (status: number, body: unknown) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

type Answer = { status: number; body?: unknown; raw?: string };

/** Serve the status, an empty book and candidates, and the ledger (the
 *  answer `ledger` gives for each read's URL); open the console and type
 *  the token. Returns every ledger read, as it left. */
async function openConsole(page: Page,
                           ledger: (url: URL, n: number) => Answer,
                           status: unknown = STATUS_PAYLOAD) {
  const reads: Request[] = [];
  await page.route(STATUS, (r) => r.fulfill(json(200, status)));
  await page.route(BOOK, (r) => r.fulfill(json(200, EMPTY_BOOK)));
  await page.route(CANDIDATES, (r) => r.fulfill(json(200, EMPTY_CANDIDATES)));
  await page.route(LEDGER, (r) => {
    reads.push(r.request());
    const a = ledger(new URL(r.request().url()), reads.length);
    return a.raw !== undefined
      ? r.fulfill({ status: a.status, contentType: "text/plain", body: a.raw })
      : r.fulfill(json(a.status, a.body));
  });
  await page.goto("/ops/trading#trades");
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-ledger")).toBeVisible();
  return reads;
}

const serveOk = (body: unknown = LEDGER_RECORDED) => () => ({ status: 200, body });

const row = (page: Page, r: Rec) =>
  page.locator(`[data-testid="ledger-row"][data-row-id="${r.id}"]`);

async function open(page: Page, r: Rec) {
  await row(page, r).getByTestId("ledger-expand").click();
  const panel = page.locator(
    `[data-testid="ledger-grounds"][data-row-id="${r.id}"]`);
  await expect(panel).toBeVisible();
  return panel;
}

test.describe("trades & grounds on the console", () => {
  test("the read carries the token; a row opens and closes", async ({ page }) => {
    const reads = await openConsole(page, serveOk());
    await expect(page.getByTestId("ledger-row")).toHaveCount(REC.length);
    expect(reads[0].method()).toBe("GET");
    expect(reads[0].headers()["x-admin-token"]).toBe(TOKEN);
    expect(new URL(reads[0].url()).search).toBe("");
    await open(page, WON);
    await expect(row(page, WON).getByTestId("ledger-expand"))
      .toHaveAttribute("aria-expanded", "true");
    await row(page, WON).getByTestId("ledger-expand").click();
    await expect(page.locator(
      `[data-testid="ledger-grounds"][data-row-id="${WON.id}"]`)).toHaveCount(0);
  });

  test("with no limit in the summary, the status route's daily loss limit "
    + "is used and named", async ({ page }) => {
      const summary = { ...LEDGER_RECORDED.summary, daily_loss_limit_dollars: null };
      await openConsole(page, serveOk({ ...LEDGER_RECORDED, summary }));
      await view(page, "#performance");
      await expect(page.getByTestId("ledger-day-limit"))
        .toContainText("daily loss limit $10.00 (from the status route)");
    });

  test("a P&L the backend could not read is said, and the totals say they "
    + "are incomplete", async ({ page }) => {
      const summary = { ...LEDGER_RECORDED.summary,
        totals: { ...LEDGER_RECORDED.summary.totals, unknown: 1 } };
      await openConsole(page, serveOk({ ...LEDGER_RECORDED, summary }));
      await expect(page.getByTestId("ledger-incomplete"))
        .toContainText("incomplete: 1 row had a fill that could not be read");
    });

  test("filters go to the backend as named parameters; clearing them asks "
    + "for everything again", async ({ page }) => {
      const reads = await openConsole(page, (url) => ({ status: 200, body: {
        ...LEDGER_RECORDED,
        rows: REC.filter((r) => (!url.searchParams.get("competition")
          || r.competition === url.searchParams.get("competition"))
          && (!url.searchParams.get("phase")
            || r.phase === url.searchParams.get("phase"))) } }));
      await expect(page.getByTestId("ledger-row")).toHaveCount(REC.length);

      await page.getByTestId("ledger-filter-competition").selectOption("mls");
      await expect(page.getByTestId("ledger-row")).toHaveCount(
        REC.filter((r) => r.competition === "mls").length);
      let last = new URL(reads.at(-1)!.url());
      expect(last.searchParams.get("competition")).toBe("mls");

      await page.getByTestId("ledger-filter-competition").selectOption("epl");
      await page.getByTestId("ledger-filter-phase").selectOption("in_play");
      await expect(page.getByTestId("ledger-row")).toHaveCount(
        REC.filter((r) => r.competition === "epl" && r.phase === "in_play").length);
      last = new URL(reads.at(-1)!.url());
      expect(last.searchParams.get("phase")).toBe("in_play");
      expect(last.searchParams.get("competition")).toBe("epl");

      // THE DAY AS A BARE DATE: the backend reads `until` to its end
      await page.getByTestId("ledger-filter-since").fill(day(-2));
      await expect.poll(() => new URL(reads.at(-1)!.url()).searchParams.get("since"))
        .toBe(day(-2));
      await page.getByTestId("ledger-filter-until").fill(day(-1));
      await expect.poll(() => new URL(reads.at(-1)!.url()).searchParams.get("until"))
        .toBe(day(-1));

      await page.getByTestId("ledger-filter-clear").click();
      await expect.poll(() => new URL(reads.at(-1)!.url()).search).toBe("");
      await expect(page.getByTestId("ledger-row")).toHaveCount(REC.length);
      for (const r of reads) {
        expect(r.headers()["x-admin-token"]).toBe(TOKEN);
        for (const k of new URL(r.url()).searchParams.keys()) {
          expect(["since", "until", "competition", "phase", "offset", "limit"]).toContain(k);
        }
      }
    });

  test("an older page that fails is named, and the rows already read stay",
    async ({ page }) => {
      await openConsole(page, (url) => url.searchParams.get("offset")
        ? { status: 500, body: { detail: "the journal read fell over" } }
        : { status: 200, body: LEDGER_PAGE_1 });
      await expect(page.getByTestId("ledger-row")).toHaveCount(LEDGER_PAGE_1.rows.length);
      await page.getByTestId("ledger-more").click();
      await expect(page.getByTestId("ledger-more-error")).toHaveText(
        "the older page could not be read — HTTP 500 — the journal read fell over");
      await expect(page.getByTestId("ledger-row")).toHaveCount(LEDGER_PAGE_1.rows.length);
      await expect(page.getByTestId("ledger-more")).toBeEnabled();
    });

  test("Export CSV downloads the loaded rows; a missing value is an empty "
    + "cell, never 0", async ({ page }) => {
      await openConsole(page, serveOk());
      await expect(page.getByTestId("ledger-row")).toHaveCount(REC.length);
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByTestId("ledger-export").click(),
      ]);
      expect(download.suggestedFilename()).toMatch(/^trivela-trades-\d{8}-\d{4}Z\.csv$/);
      const text = readFileSync((await download.path())!, "utf8");
      // a BOM first, so a spreadsheet reads the file as UTF-8
      expect(text.charCodeAt(0)).toBe(0xfeff);
      const table = parseCsv(text.slice(1));
      const head = table[0];
      for (const c of ["placed_at", "row_type", "competition", "home", "away",
        "ticker", "contract", "side", "price_cents", "yes_book_price_cents",
        "count", "cost_dollars", "phase", "fair_side", "consensus_p_side",
        "model_p_side", "blend_w", "threshold_cents", "maker_price_cents",
        "fee_per_contract_cents", "edge_cents", "news_guard", "risk_checks",
        "why", "filled_count", "state", "cancel_reasons", "result", "outcome",
        "pnl_dollars"]) {
        expect(head, c).toContain(c);
      }
      const body = table.slice(1);
      expect(body.map((r) => Number(r[head.indexOf("id")]))).toEqual(REC.map((r) => r.id));
      const rec = (r: Rec) => Object.fromEntries(
        body.find((x) => x[head.indexOf("id")] === String(r.id))!.map((v, i) => [head[i], v]));
      const won = rec(WON);
      expect(won.contract).toBe("Synthetic Home to win");
      expect(won.price_cents).toBe("41");
      expect(won.cost_dollars).toBe("4.98");
      expect(won.pnl_dollars).toBe("7.02");
      expect(won.result).toBe("yes");
      expect(won.outcome).toBe("won");
      expect(won.why).toBe(WON.why);
      // UNSETTLED: an empty P&L cell, never 0
      expect(rec(V2).pnl_dollars).toBe("");
      expect(rec(V2).outcome).toBe("unsettled");
      // THE OLD ROW: every missing value is an empty cell — not 0
      const old = rec(OLD);
      for (const c of ["fair_side", "edge_cents", "threshold_cents",
        "consensus_age_s", "news_guard", "risk_checks", "cancel_reasons"]) {
        expect(old[c], c).toBe("");
      }
      await expect(page.getByTestId("ops-ledger"))
        .toContainText("blank cell = not recorded");
    });

  test("an empty window says so; filtered to nothing says that",
    async ({ page }) => {
      await openConsole(page, () => ({ status: 200, body: {
        ...LEDGER_RECORDED, rows: [], summary: null } }));
      await expect(page.getByTestId("ledger-none"))
        .toHaveText("No orders on record in this window.");
      await expect(page.getByTestId("ledger-summary-absent"))
        .toContainText("summary not sent");
      await page.getByTestId("ledger-filter-competition").selectOption("mls");
      await expect(page.getByTestId("ledger-none"))
        .toHaveText("No orders match these filters.");
    });

  for (const [what, answer, words] of [
    ["a refusal", { status: 403, body: { detail: "operator credentials required" } },
      "token rejected — the backend refused it (operator credentials required)"],
    ["a server error", { status: 500, body: { detail: "the journal read fell over" } },
      "the ledger read failed (HTTP 500) — the journal read fell over"],
    ["a 422 on a filter", { status: 422, body: { detail: "phase 'x' is not one of …" } },
      "the ledger read failed (HTTP 422) — phase 'x' is not one of …"],
    ["a 200 that is not JSON", { status: 200, raw: "<html>gateway</html>" },
      "the ledger read failed (HTTP 200) — the answer was not JSON"],
    ["a 200 that is not an object", { status: 200, body: [] },
      "the ledger read failed (HTTP 200) — the answer was not an object"],
    ["a 200 with no rows list", { status: 200, body: { summary: LEDGER_RECORDED.summary } },
      "the ledger read failed (HTTP 200) — the answer carried no rows list"],
  ] as [string, Answer, string][]) {
    test(`${what} is named, never drawn as an empty ledger`, async ({ page }) => {
      await openConsole(page, () => answer);
      await expect(page.getByTestId("ledger-error")).toContainText(words);
      await expect(page.getByTestId("ledger-none")).toHaveCount(0);
      await expect(page.getByTestId("ledger-table")).toHaveCount(0);
      await expect(page.getByTestId("ledger-export")).toHaveCount(0);
    });
  }

  test("a backend without the ledger route: 'not available yet', and the "
    + "console stands", async ({ page }) => {
      await openConsole(page, () => ({ status: 404, body: { available: false } }));
      await expect(page.getByTestId("ledger-unavailable"))
        .toContainText("Trades & grounds not available yet");
      await expect(page.getByTestId("ledger-table")).toHaveCount(0);
      await expect(page.getByTestId("ops-strip")).toBeVisible();
      await view(page, "#portfolio");
      await expect(page.getByTestId("ops-book")).toBeVisible();
    });

  test("honest labels: experimental, unproven; the edge is the trader's own "
    + "estimate; your own bets are not here", async ({ page }) => {
      await openConsole(page, serveOk());
      const s = page.getByTestId("ops-ledger");
      // ONE DISCLAIMER (quiet pass): the header says it; the panel's words
      // are behind its ⓘ
      await expect(page.getByTestId("ops-disclosure")).toContainText("experimental · unproven");
      await expect(s).toContainText("the trader's own estimate at the time");
      await expect(s).toContainText("not evidence of an edge");
      await expect(s).toContainText("your own manual bets are not here");
      await expect(s).not.toContainText(/\bTAKE\b/);
    });

  test("at 400 px the table scrolls in its own box, the page does not "
    + "scroll sideways, and an opened row's grounds stay in view",
    async ({ page }) => {
      await page.setViewportSize({ width: 400, height: 900 });
      await openConsole(page, serveOk());
      await expect(page.getByTestId("ledger-row")).toHaveCount(REC.length);
      await open(page, V2);
      const m = await page.evaluate((id) => {
        const table = document.querySelector('[data-testid="ledger-table"]')!;
        const box = table.parentElement!;
        const panel = document.querySelector(
          `[data-testid="ledger-grounds"][data-row-id="${id}"] [data-testid="ledger-grounds-body"]`)!;
        const b = box.getBoundingClientRect();
        const p = panel.getBoundingClientRect();
        return {
          page: document.documentElement.scrollWidth,
          view: document.documentElement.clientWidth,
          table: table.scrollWidth, box: box.clientWidth,
          panelLeft: p.left, panelRight: p.right, boxLeft: b.left, boxRight: b.right,
        };
      }, V2.id);
      expect(m.page, "no sideways page scroll").toBeLessThanOrEqual(m.view);
      expect(m.table, "the table is wider than its box, so the box scrolls")
        .toBeGreaterThan(m.box);
      expect(m.panelLeft, "the grounds start inside the box").toBeGreaterThanOrEqual(m.boxLeft - 1);
      expect(m.panelRight, "the grounds end inside the box").toBeLessThanOrEqual(m.boxRight + 1);
    });
});

/** A small RFC 4180 reader: quoted fields, doubled quotes, newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let rowOut: string[] = [], field = "", q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { rowOut.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      rowOut.push(field); rows.push(rowOut); rowOut = []; field = "";
    } else field += c;
  }
  if (field !== "" || rowOut.length) { rowOut.push(field); rows.push(rowOut); }
  return rows;
}

// ---------------------------------------------- the proxy itself

test.describe("the ledger proxy", () => {
  test.skip(LIVE, "reads the hermetic stand-in's log — hermetic runs only");

  async function ledgerHits(request: import("@playwright/test").APIRequestContext,
                            since: string) {
    const r = await request.get(`${STANDIN_URL}/__standin/log`);
    expect(r.ok(), "the stand-in's log is readable").toBe(true);
    const log = await r.json() as { requests: { at: string; method: string; url: string }[] };
    // other workers' consoles read the bare path through the shared
    // stand-in; this file's own reads are the ones that carry a query
    return log.requests.filter((e) => e.at >= since
      && e.url.startsWith("/api/admin/trading/ledger?"));
  }

  test("a GET reaches exactly /api/admin/trading/ledger with only the named "
    + "filters, rebuilt — any other key is dropped", async ({ request }) => {
      const started = new Date().toISOString();
      const since = `${day(-7)}T00:00:00Z`;
      const r = await request.get("/api/ops/trading-ledger", {
        params: { phase: "pre_match", competition: "epl", since,
          offset: "50", limit: "50", cursor: "c2.page-2",
          path: "../mls/risk", token: "nope" },
        headers: { "x-admin-token": "proxy-test-token" },
      });
      // the stand-in's named 503, passed through unedited
      expect(r.status()).toBe(503);
      expect(r.headers()["cache-control"]).toBe("private, no-store");
      const hits = await ledgerHits(request, started);
      expect(hits.map((e) => e.method)).toEqual(["GET"]);
      const u = new URL(hits[0].url, "http://standin.invalid");
      expect(u.pathname).toBe("/api/admin/trading/ledger");
      expect([...u.searchParams.entries()]).toEqual([
        ["since", since], ["competition", "epl"], ["phase", "pre_match"],
        ["offset", "50"], ["limit", "50"]]);
    });

  test("a bad filter value is refused 400 invalid_parameter, named, and "
    + "never leaves the proxy", async ({ request }) => {
      const started = new Date().toISOString();
      const bad: [string, string][] = [
        ["since", "yesterday"], ["until", "2026-13-45"],
        ["since", "../mls/risk"], ["competition", "../mls/risk"],
        ["competition", "EPL"], ["competition", "a".repeat(17)],
        ["phase", "pre match"], ["phase", "1x"], ["phase", "handed_over"],
        ["offset", "../../admin"], ["offset", "-1"], ["offset", "5001"],
        ["limit", "0"], ["limit", "201"], ["limit", "1.5"], ["limit", "-3"],
      ];
      for (const [k, v] of bad) {
        const r = await request.get(
          `/api/ops/trading-ledger?${k}=${encodeURIComponent(v)}`,
          { headers: { "x-admin-token": "proxy-test-token" } });
        expect(r.status(), `${k}=${v}`).toBe(400);
        const j = await r.json();
        expect(j.reason, `${k}=${v}`).toBe("invalid_parameter");
        expect(j.parameter, `${k}=${v}`).toBe(k);
        expect(r.headers()["cache-control"]).toBe("private, no-store");
      }
      // a repeated filter is refused rather than half of it chosen
      const twice = await request.get(
        "/api/ops/trading-ledger?competition=epl&competition=mls");
      expect(twice.status()).toBe(400);
      expect((await twice.json()).parameter).toBe("competition");
      expect(await ledgerHits(request, started)).toEqual([]);
    });

  test("the ledger is a read: other verbs are 405, and nothing is cached",
    async ({ request }) => {
      for (const verb of ["post", "put", "delete"] as const) {
        const r = await request[verb]("/api/ops/trading-ledger");
        expect(r.status(), verb).toBe(405);
        expect(r.headers()["allow"], verb).toBe("GET");
        expect(r.headers()["cache-control"], verb).toBe("private, no-store");
      }
    });
});
