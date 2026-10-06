import { expect, test } from "@playwright/test";
import {
  LEDGER_CSV_COLUMNS, LEDGER_LIMIT_MAX, LEDGER_OFFSET_MAX, LEDGER_PARAMS,
  LEDGER_PHASES, edgeWords, fillWords, ledgerCsv, ledgerQuery, parseLedger,
  pnlWords, resultWords,
} from "../src/lib/tradingLedger";
import {
  LEDGER_PAGE_1, LEDGER_PAGE_2, LEDGER_RECORDED,
} from "./trading-ledger-recorded";

// THE LEDGER'S READERS, WITHOUT A BROWSER (2026-10-06).
//
// src/lib/tradingLedger.ts is the one place the "Trades & grounds"
// payload is read, its query is checked and its CSV is written. These are
// its rules, held to account directly against payloads RECORDED from the
// backend's own route (e2e/trading-ledger-recorded.ts) — the page's
// behaviour is e2e/ops-trading-ledger.spec.ts and
// e2e/ops-trading-ledger-contract.spec.ts:
//
//   - the proxy's query is REBUILT from the named filters only, in a fixed
//     order, each held to the backend's own rule (limit 1..200, offset
//     0..5000, its phase keys, its competition pattern); a bad value is
//     refused naming its parameter;
//   - every recorded row reads, with its nested market, money, edge,
//     lifecycle and outcome; nothing is converted (cents stay cents);
//   - missing stays null — never 0 — and a thing that is not a ledger row
//     is counted, not dropped silently;
//   - the next page is the next OFFSET while page.has_more;
//   - the CSV writes null as an EMPTY cell, quotes what needs quoting, and
//     defuses a text cell a spreadsheet would run as a formula.
//
// EXPERIMENTAL, UNPROVEN.

type Obj = Record<string, unknown>;
const RAW = LEDGER_RECORDED as unknown as Obj;
const L = parseLedger(RAW);
const row = (oid: string) => L.rows.find((r) => r.order_id === oid)!;

test.describe("the ledger's query", () => {
  test("is rebuilt from the named filters only, in a fixed order", () => {
    const q = ledgerQuery({ limit: "50", offset: "100", phase: "handover",
      competition: "ligue_1", since: "2026-01-02T00:00:00Z", until: "2026-01-03" });
    expect(q).toEqual({ ok: true, search: "since=2026-01-02T00%3A00%3A00Z"
      + "&until=2026-01-03&competition=ligue_1&phase=handover&offset=100"
      + "&limit=50" });
    expect(LEDGER_PARAMS).toEqual(["since", "until", "competition", "phase",
      "offset", "limit"]);
    expect(ledgerQuery({})).toEqual({ ok: true, search: "" });
    expect(ledgerQuery({ competition: "", phase: undefined }))
      .toEqual({ ok: true, search: "" });
  });

  test("holds each value to the backend's own rule, naming the parameter", () => {
    const cases: [string, unknown][] = [
      ["since", "yesterday"], ["since", "2026-13-45"], ["until", "../x"],
      ["competition", "../mls/risk"], ["competition", "EPL"],
      ["competition", "a".repeat(17)], ["competition", ["epl", "mls"]],
      ["phase", "handed_over"], ["phase", "pre match"], ["phase", "entry"],
      ["offset", "-1"], ["offset", String(LEDGER_OFFSET_MAX + 1)], ["offset", "1.5"],
      ["limit", "0"], ["limit", String(LEDGER_LIMIT_MAX + 1)], ["limit", "1.5"],
      ["limit", 5],
    ];
    for (const [k, v] of cases) {
      const q = ledgerQuery({ [k]: v });
      expect(q.ok, `${k}=${String(v)}`).toBe(false);
      if (!q.ok) {
        expect(q.parameter).toBe(k);
        expect(q.detail).toContain("no backend was contacted");
      }
    }
    // the bounds themselves, and every backend phase, are admitted
    for (const ok of [{ limit: "1" }, { limit: "200" }, { offset: "0" },
      { offset: "5000" }, { competition: "a".repeat(16) }, { competition: "a_b-c" },
      ...LEDGER_PHASES.map((phase) => ({ phase }))]) {
      expect(ledgerQuery(ok).ok, JSON.stringify(ok)).toBe(true);
    }
    expect(LEDGER_PHASES).toEqual(expect.arrayContaining(
      Object.keys(LEDGER_RECORDED.vocab.phases)));
    expect(LEDGER_PHASES).toHaveLength(Object.keys(LEDGER_RECORDED.vocab.phases).length);
  });
});

test.describe("the recorded payload", () => {
  test("every row reads, in the order sent, none unreadable", () => {
    expect(L.version).toBe("trading-ledger-v1");
    expect(L.unreadable).toBe(0);
    expect(L.rows.map((r) => r.id)).toEqual(LEDGER_RECORDED.rows.map((r) => r.id));
    for (const r of L.rows) expect(r.market.ticker, String(r.id)).toBeTruthy();
  });

  test("the won order's numbers are the backend's, in its units", () => {
    const r = row("ord-1");
    expect(r.row_type).toBe("order");
    expect(r.market.contract).toBe("Synthetic Home to win");
    expect(r.market.family).toBe("GAME");
    expect(r.price_cents).toBe(41);
    expect(r.yes_book_price_cents).toBe(41);
    expect(r.cost_dollars).toBe(4.98);
    expect(r.fee_dollars).toBe(0.06);
    expect(r.lifecycle.filled_count).toBe(12);
    expect(r.outcome.status).toBe("won");
    expect(r.outcome.pnl_dollars).toBe(7.02);
    expect(r.edge.threshold_cents).toBe(3);
    expect(resultWords(r)).toBe("YES · won");
    expect(pnlWords(r)).toBe("+$7.02");
    expect(edgeWords(r)).toBe("+6.9¢ vs 3¢");
    expect(fillWords(r)).toBe("filled 12/12 @ 41¢");
  });

  test("unsettled, not filled, a handover, an old row: each says so", () => {
    const v2 = row("v2-1");
    expect(v2.outcome.pnl_dollars).toBeNull();
    expect(pnlWords(v2)).toBe("unsettled");
    expect(v2.grounds.blend!.arm).toEqual(["0.25", "0.02"]);
    expect(v2.grounds.consensus!.books).toEqual(["Pinnacle", "Bet365", "Unibet"]);

    const c = row("tie-1");
    expect(resultWords(c)).toBe("not filled");
    expect(pnlWords(c)).toBe("$0.00 · not filled");
    expect(c.lifecycle.cancels.map((x) => x.reason)).toEqual(["edge_gone"]);

    const h = L.rows.find((r) => r.row_type === "handover")!;
    expect(edgeWords(h)).toBe("not applicable");
    expect(h.grounds.handover!.mark_cents).toBe(40);
    expect(pnlWords(h)).toBe("+$3.71");

    const old = row("old-2");
    expect(old.grounds.fair!.side).toBeNull();
    expect(old.edge.cents).toBeNull();
    expect(edgeWords(old)).toBe("not recorded");
    expect(old.not_recorded).toContain("grounds.fair");
  });

  test("the summary reads its money and the backend's day flag", () => {
    const s = L.summary!;
    expect(s.totals!.settled_pnl_dollars).toBe(LEDGER_RECORDED.summary.totals.settled_pnl_dollars);
    expect(s.totals!.open_cost_dollars).toBe(LEDGER_RECORDED.summary.totals.open_cost_dollars);
    expect(s.daily_loss_limit_dollars).toBe(10);
    expect(s.complete).toBe(true);
    expect(s.by_day!.map((d) => d.key)).toEqual(LEDGER_RECORDED.summary.by_day.map((d) => d.key));
    expect(s.by_day!.filter((d) => d.over_daily_limit).map((d) => d.settled_pnl_dollars))
      .toEqual([-11.1]);
    expect(s.by_phase!.map((b) => b.key)).toContain("handover");
  });

  test("a row whose P&L is unknown makes the totals incomplete", () => {
    const sum = { ...LEDGER_RECORDED.summary,
      totals: { ...LEDGER_RECORDED.summary.totals, unknown: 1 } };
    expect(parseLedger({ ...RAW, summary: sum }).summary!.complete).toBe(false);
    const said = { ...LEDGER_RECORDED.summary,
      totals: { ...LEDGER_RECORDED.summary.totals, complete: false } };
    expect(parseLedger({ ...RAW, summary: said }).summary!.complete).toBe(false);
  });

  test("the next page is the next offset, while the backend has more", () => {
    expect(L.next_offset).toBeNull();
    expect(parseLedger(LEDGER_PAGE_1 as unknown as Obj).next_offset).toBe(3);
    expect(parseLedger(LEDGER_PAGE_2 as unknown as Obj).next_offset).toBe(6);
  });

  test("missing stays null, never 0; what is not a ledger row is counted", () => {
    const l = parseLedger({ rows: [
      { id: 1, row_type: "order" }, { row_type: "order" },
      { id: 2, row_type: "something_else" }, "nonsense", null,
    ] });
    expect(l.unreadable).toBe(4);
    const r = l.rows[0];
    for (const v of [r.price_cents, r.count, r.cost_dollars, r.outcome.pnl_dollars,
      r.edge.cents, r.lifecycle.filled_count, r.why, r.phase, r.market.ticker]) {
      expect(v).toBeNull();
    }
    expect(edgeWords(r)).toBe("not recorded");
    expect(pnlWords(r)).toBe("not recorded");
    expect(l.summary).toBeNull();
    expect(l.next_offset).toBeNull();
  });
});

test.describe("the CSV", () => {
  test("a null is an empty cell; quoting and formula cells are handled", () => {
    const first = LEDGER_RECORDED.rows[0];
    const rows = parseLedger({ ...RAW, rows: [
      { ...first, market: { ...first.market, contract: "=HYPERLINK(\"x\")" },
        why: "fair, \"books\"\nand model" },
      ...LEDGER_RECORDED.rows.slice(1),
    ] }).rows;
    const csv = ledgerCsv(rows);
    const lines = csv.split("\r\n");
    expect(lines[0]).toBe(LEDGER_CSV_COLUMNS.join(","));
    expect(csv).toContain("\"'=HYPERLINK(\"\"x\"\")\"");
    expect(csv).toContain("\"fair, \"\"books\"\"\nand model\"");
    const col = (name: string) => LEDGER_CSV_COLUMNS.indexOf(name as never);
    const table = parseCsv(csv);
    expect(table).toHaveLength(LEDGER_RECORDED.rows.length + 1);
    const cells = (oid: string) => {
      const id = String(LEDGER_RECORDED.rows.find((r) => r.order_id === oid)!.id);
      return table.find((r) => r[0] === id)!;
    };
    // the old row: every value it did not record is EMPTY — not 0
    const old = cells("old-2");
    for (const c of ["fair_side", "edge_cents", "threshold_cents", "consensus_age_s",
      "news_guard", "risk_checks", "cancel_reasons"]) {
      expect(old[col(c)], c).toBe("");
    }
    // the unsettled order: its P&L is EMPTY, not 0
    expect(cells("v2-1")[col("pnl_dollars")]).toBe("");
    expect(cells("v2-1")[col("outcome")]).toBe("unsettled");
    expect(cells("mls-1")[col("pnl_dollars")]).toBe("-11.1");
  });
});

/** A small RFC 4180 reader: quoted fields, doubled quotes, newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let out: string[] = [], field = "", q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i += 1;
      out.push(field); rows.push(out); out = []; field = "";
    } else field += c;
  }
  if (field !== "" || out.length) { out.push(field); rows.push(out); }
  return rows;
}
