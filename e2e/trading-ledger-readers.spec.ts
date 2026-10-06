import { expect, test } from "@playwright/test";
import {
  LEDGER_CSV_COLUMNS, LEDGER_LIMIT_MAX, LEDGER_PARAMS, composeWhy, ledgerCsv,
  ledgerQuery, parseLedger,
} from "../src/lib/tradingLedger";

// THE LEDGER'S READERS, WITHOUT A BROWSER (2026-10-06).
//
// src/lib/tradingLedger.ts is the one place the "Trades & grounds"
// payload is read, its query is checked and its CSV is written. These are
// its rules, held to account directly (the page's behaviour is
// e2e/ops-trading-ledger.spec.ts):
//
//   - the proxy's query is REBUILT from the named filters only, in a fixed
//     order; a bad value is refused naming its parameter;
//   - units: a stated `units` block wins; a price is read by magnitude
//     (below 1 is dollars); an edge, fee and threshold take the unit of
//     the block's own prices; money is dollars;
//   - missing stays null — never 0 — and a row with no ticker is counted
//     as unreadable, not dropped silently;
//   - the composed why reads like the brief's example, from recorded
//     values only;
//   - the CSV writes null as an EMPTY cell, quotes what needs quoting, and
//     defuses a text cell a spreadsheet would run as a formula.
//
// EXPERIMENTAL, UNPROVEN.

const now = Date.now();
const iso = (minutes: number) => new Date(now + minutes * 60_000).toISOString();

const BRIEF_ROW = {
  placed_at: iso(-60), competition: "epl",
  fixture: { home: "Arsenal", away: "West Ham", kickoff_utc: iso(60) },
  ticker: "KXEPLGAME-SYNTH01ARSWHU-ARS", family: "GAME", outcome_key: "ARS",
  contract: "Arsenal to win", side: "yes", price: 44, count: 4, cost: 1.79,
  phase: "pre_match", strategy_version: "consensus-v2",
  grounds: { fair: 0.472, consensus: { prob: 0.46, age_s: 10800, books: 3 },
    model: { prob: 0.49, source: "served", run_age_s: 2400 }, w: 0.25,
    threshold: 2, maker_price: 44, fee: 0.4, edge: 2.8,
    guards: { news: "clear" }, risk: { passed: ["per_order_cap"] },
    inplay: null },
  why: null, fills: { count: 4, avg_price: 44, fees: 0.03, last_at: iso(-50) },
  status: "filled", cancel_reason: null, result: "yes", pnl: 2.21,
};

test.describe("the ledger's query", () => {
  test("is rebuilt from the named filters only, in a fixed order", () => {
    const q = ledgerQuery({ limit: "50", cursor: "c2.page-2",
      phase: "pre_match", competition: "epl",
      since: "2026-01-02T00:00:00Z", until: "2026-01-03" });
    expect(q).toEqual({ ok: true, search: "since=2026-01-02T00%3A00%3A00Z"
      + "&until=2026-01-03&competition=epl&phase=pre_match&cursor=c2.page-2"
      + "&limit=50" });
    expect(LEDGER_PARAMS).toEqual(["since", "until", "competition", "phase",
      "cursor", "limit"]);
    // nothing, or empty values, is no filter at all
    expect(ledgerQuery({})).toEqual({ ok: true, search: "" });
    expect(ledgerQuery({ competition: "", phase: undefined }))
      .toEqual({ ok: true, search: "" });
  });

  test("refuses a bad value, naming its parameter", () => {
    const cases: [string, unknown][] = [
      ["since", "yesterday"], ["since", "2026-13-45"], ["until", "../x"],
      ["competition", "../mls/risk"], ["competition", "EPL"],
      ["competition", ["epl", "mls"]], ["phase", "pre match"],
      ["phase", "_x"], ["cursor", "../../admin"], ["cursor", "a/b"],
      ["cursor", "x#y"], ["cursor", "x".repeat(257)], ["limit", "0"],
      ["limit", String(LEDGER_LIMIT_MAX + 1)], ["limit", "1.5"],
      ["limit", "-3"], ["limit", 5],
    ];
    for (const [k, v] of cases) {
      const q = ledgerQuery({ [k]: v });
      expect(q.ok, `${k}=${String(v)}`).toBe(false);
      if (!q.ok) {
        expect(q.parameter).toBe(k);
        expect(q.detail).toContain("no backend was contacted");
      }
    }
    // the bounds themselves are admitted
    expect(ledgerQuery({ limit: "1" }).ok).toBe(true);
    expect(ledgerQuery({ limit: String(LEDGER_LIMIT_MAX) }).ok).toBe(true);
    expect(ledgerQuery({ cursor: "2026-10-06T12:00:00+00:00|8812" }).ok).toBe(true);
  });
});

test.describe("the ledger's payload", () => {
  test("cents, as the console's other routes send them", () => {
    const l = parseLedger({ rows: [BRIEF_ROW], next_cursor: "c2" });
    const r = l.rows[0];
    expect(r.price).toBe(44);
    expect(r.grounds!.maker_price).toBe(44);
    expect(r.grounds!.edge).toBe(2.8);
    expect(r.grounds!.fee).toBe(0.4);
    expect(r.grounds!.threshold).toBe(2);
    expect(r.cost).toBe(1.79);
    expect(r.fills!.avg_price).toBe(44);
    expect(r.result).toBe("yes");
    expect(r.kind).toBe("order");
    expect(l.next_cursor).toBe("c2");
  });

  test("the journal's decimal dollars read the same", () => {
    const r = parseLedger({ rows: [{ ...BRIEF_ROW, price: "0.44",
      grounds: { ...BRIEF_ROW.grounds, maker_price: "0.44", edge: "0.028",
        fee: "0.004", threshold: "0.02" },
      fills: { ...BRIEF_ROW.fills, avg_price: "0.44" } }] }).rows[0];
    expect(r.price).toBe(44);
    expect(r.grounds!.maker_price).toBe(44);
    expect(r.grounds!.edge).toBe(2.8);
    expect(r.grounds!.fee).toBe(0.4);
    expect(r.grounds!.threshold).toBe(2);
    expect(r.fills!.avg_price).toBe(44);
  });

  test("with no price on the row, a threshold under half a cent says dollars", () => {
    const r = parseLedger({ rows: [{ ...BRIEF_ROW, price: null,
      grounds: { ...BRIEF_ROW.grounds, maker_price: null, edge: "0.03",
        threshold: "0.02", fee: null } }] }).rows[0];
    expect(r.grounds!.threshold).toBe(2);
    expect(r.grounds!.edge).toBe(3);
  });

  test("a stated units block wins over magnitude", () => {
    const r = parseLedger({ units: { prices: "cents", edges: "cents",
      money: "cents" }, rows: [{ ...BRIEF_ROW, cost: 179, pnl: -80,
      grounds: { ...BRIEF_ROW.grounds, edge: 0.5, threshold: 0.4 } }] }).rows[0];
    expect(r.grounds!.edge).toBe(0.5);
    expect(r.grounds!.threshold).toBe(0.4);
    expect(r.cost).toBe(1.79);
    expect(r.pnl).toBe(-0.8);
  });

  test("missing stays null, never 0; a row with no ticker is counted", () => {
    const l = parseLedger({ rows: [
      { ticker: "KXOLD-1", placed_at: iso(-999) },
      { placed_at: iso(-1) }, "nonsense", null,
    ] });
    expect(l.unreadable).toBe(3);
    const r = l.rows[0];
    for (const k of ["price", "count", "cost", "pnl", "grounds", "fills",
      "why", "phase", "result", "contract", "strategy_version"] as const) {
      expect(r[k], k).toBeNull();
    }
    expect(l.summary).toBeNull();
    expect(l.next_cursor).toBeNull();
  });

  test("a handed-over contract is its own kind, however the backend says it", () => {
    for (const extra of [{ kind: "handover" }, { row_type: "handed_over" },
      { phase: "handed_over" }, { status: "handed_over" }]) {
      const r = parseLedger({ rows: [{ ...BRIEF_ROW, ...extra }] }).rows[0];
      expect(r.kind, JSON.stringify(extra)).toBe("handover");
    }
  });

  test("rows come out newest first, and two identical rows stay two", () => {
    const l = parseLedger({ rows: [
      { ...BRIEF_ROW, placed_at: iso(-300), ticker: "B" },
      { ...BRIEF_ROW, placed_at: iso(-10), ticker: "A" },
      { ...BRIEF_ROW, placed_at: iso(-300), ticker: "B" },
      { ...BRIEF_ROW, placed_at: null, ticker: "Z" },
    ] });
    expect(l.rows.map((r) => r.ticker)).toEqual(["A", "B", "B", "Z"]);
    expect(new Set(l.rows.map((r) => r.key)).size).toBe(4);
  });

  test("the summary reads breakdowns as objects or lists, and the limit as a "
    + "number or a block", () => {
      const s = parseLedger({ rows: [], summary: {
        by_day: [{ day: "2026-01-01", pnl: 1 }, { day: "2026-01-03", pnl: -2 }],
        by_competition: { epl: { placed: 2, pnl: "1.5" } },
        by_family: [{ family: "GAME", orders: 3, pnl: null }],
        daily_limit: { dollars: "10.00" },
      } }).summary!;
      expect(s.by_day!.map((d) => d.day)).toEqual(["2026-01-03", "2026-01-01"]);
      expect(s.by_competition).toEqual([{ key: "epl", placed: 2, filled: null,
        wins: null, losses: null, unsettled: null, cost: null, pnl: 1.5 }]);
      expect(s.by_family![0].key).toBe("GAME");
      expect(s.by_family![0].placed).toBe(3);
      expect(s.by_family![0].pnl).toBeNull();
      expect(s.daily_limit).toBe(10);
      expect(s.by_phase).toBeNull();
      expect(s.totals).toBeNull();
    });
});

test.describe("the composed why", () => {
  test("reads like the brief's example, from the recorded values", () => {
    const r = parseLedger({ rows: [BRIEF_ROW] }).rows[0];
    expect(composeWhy(r)).toBe("Fair 47.2% (books 46.0% 3h old, model 49.0% "
      + "w=0.25) vs our YES bid 44¢ + 0.4¢ fee = edge 2.8¢ ≥ threshold 2¢");
  });

  test("says below the bar when it was, and leaves out what was not recorded", () => {
    const r = parseLedger({ rows: [{ ...BRIEF_ROW, side: "no",
      grounds: { fair: 0.4, w: null, threshold: 3, maker_price: 31,
        fee: null, edge: 1.2 } }] }).rows[0];
    expect(composeWhy(r)).toBe("Fair 40.0% vs our NO bid 31¢ = edge 1.2¢ < "
      + "threshold 3¢");
  });

  test("is null when nothing was recorded", () => {
    const r = parseLedger({ rows: [{ ticker: "KXOLD-1" }] }).rows[0];
    expect(composeWhy(r)).toBeNull();
    const bare = parseLedger({ rows: [{ ticker: "KXOLD-2", grounds: {} }] }).rows[0];
    expect(composeWhy(bare)).toBeNull();
  });
});

test.describe("the CSV", () => {
  test("a null is an empty cell; quoting and formula cells are handled", () => {
    const rows = parseLedger({ rows: [
      { ...BRIEF_ROW, contract: "=HYPERLINK(\"x\")",
        why: "fair, \"books\"\nand model", pnl: -0.8 },
      { ticker: "KXOLD-1", placed_at: iso(-500), result: "no" },
    ] }).rows;
    const csv = ledgerCsv(rows);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe(LEDGER_CSV_COLUMNS.join(","));
    const col = (name: string) => LEDGER_CSV_COLUMNS.indexOf(name as never);
    // the first row: a formula-looking text cell is defused, a field with a
    // comma, quote or newline is quoted, a negative NUMBER stays a number
    expect(csv).toContain("\"'=HYPERLINK(\"\"x\"\")\"");
    expect(csv).toContain("\"fair, \"\"books\"\"\nand model\"");
    expect(csv).toContain(",-0.8");
    // the old row: every value it did not record is EMPTY — not 0
    const old = csv.split("\r\n").find((l) => l.includes("KXOLD-1"))!.split(",");
    for (const c of ["price_yes_cents", "count", "cost_dollars", "fair",
      "edge_cents", "fills_count", "pnl_dollars", "why", "why_source"]) {
      expect(old[col(c)], c).toBe("");
    }
    expect(old[col("result")]).toBe("no");
    expect(old[col("kind")]).toBe("order");
  });
});
