/** THE CARD'S MODEL-VS-MARKET BLOCK, AS RECORDED PAYLOADS CARRY IT.
 *
 *  The recorded boards (eight-columns.ts, championships-recorded.ts) were
 *  captured before the backend served `model_vs_market` (backend
 *  src/picker/model_market.py, 2026-10-07). These helpers dress them in
 *  the block's EXACT wire shape — probabilities as fractions, `top` the
 *  backend's own argmax — so a spec exercises the card on the shape the
 *  route emits. Every state the card can be in is here by name. */

type Triple = { h: number; d: number; a: number };
type Leg = { ticker: string | null; ask_c: number | null; bid_c: number | null;
  spread_c: number | null; ask_size: number | null; bid_size: number | null };

const topOf = (p: Triple | null) => {
  if (!p) return [] as string[];
  const best = Math.max(p.h, p.d, p.a);
  return (["h", "d", "a"] as const).filter((k) => p[k] === best);
};

const leg = (ask: number, bid = ask - 1, size = 421736): Leg => ({
  ticker: null, ask_c: ask, bid_c: bid, spread_c: ask - bid,
  ask_size: size, bid_size: size,
});

/** The block, built the way the backend builds it. */
export function block(opts: {
  model?: Triple | null; market?: Triple | null; tested?: boolean;
  flag?: "WIDE" | "THIN" | null; flagLeg?: "h" | "d" | "a";
  codes?: { h: string | null; a: string | null };
  modelWhy?: string; marketWhy?: string;
}) {
  const model = opts.model === undefined ? DERBY.model : opts.model;
  const market = opts.market === undefined ? DERBY.market : opts.market;
  const verdict = !model ? "no_model" : !market ? "no_market"
    : topOf(model).some((k) => topOf(market).includes(k)) ? "agree" : "conflict";
  const legs = {
    h: leg(28), d: leg(25), a: leg(50),
  };
  if (opts.flag === "WIDE") legs[opts.flagLeg ?? "a"] = leg(52, 45);
  if (opts.flag === "THIN") legs[opts.flagLeg ?? "a"] = leg(50, 49, 6);
  return {
    model, market, verdict,
    model_meta: model ? {
      name: "unified-nb-v1",
      status: opts.tested === false ? "untested" : "tested",
      read_at: "2026-09-20T14:04:00+00:00", source: "unified_model",
      test_verdict: opts.tested === false ? null : "NOT_WORSE" } : null,
    book_flag: market ? (opts.flag ?? null) : null,
    top: { model: topOf(model), market: topOf(market) },
    codes: opts.codes ?? { h: null, a: null },
    model_why: model ? null : (opts.modelWhy ?? "fixture_not_keyed"),
    market_why: market ? null : (opts.marketWhy ?? "no_three_way_book"),
    market_meta: market ? {
      basis: "Kalshi's three GAME legs, YES asks, overround removed",
      overround: 1.03, legs,
      book_flag_leg: opts.flag ? (opts.flagLeg ?? "a") : null,
      stale: null } : null,
  };
}

/** The spec's real numbers: Atlético v Real Madrid, 20 Sep 2026. */
export const DERBY = {
  model: { h: 0.422, d: 0.241, a: 0.337 },
  market: { h: 0.272, d: 0.243, a: 0.485 },
};

/** Every state the card can be in, by name, in a fixed rotation. */
export const STATES = {
  conflict: () => block({}),
  agree: () => block({ model: { h: 0.301, d: 0.250, a: 0.449 } }),
  untested: () => block({ model: { h: 0.310, d: 0.262, a: 0.428 },
                          tested: false }),
  no_model: () => block({ model: null }),
  no_market: () => block({ market: null }),
  wide: () => block({ model: { h: 0.301, d: 0.250, a: 0.449 },
                      flag: "WIDE" }),
  thin: () => block({ model: { h: 0.301, d: 0.250, a: 0.449 },
                      flag: "THIN", flagLeg: "h" }),
} as const;
export type StateName = keyof typeof STATES;
const ROTATION = Object.keys(STATES) as StateName[];

/** A copy of `board` whose every row and refusal carries a block, the
 *  states rotating so every column shows several. `pick` overrides by
 *  event id. */
export function withModelMarket<B extends { rows: readonly unknown[]; refusals: readonly unknown[] }>(
  board: B, pick: Record<string, StateName> = {}): B {
  const copy = JSON.parse(JSON.stringify(board)) as B;
  let i = 0;
  for (const r of [...copy.rows, ...copy.refusals] as unknown as Array<Record<string, unknown>>) {
    const name = pick[String(r.event_id)] ?? ROTATION[i % ROTATION.length];
    r.model_vs_market = STATES[name]();
    i += 1;
  }
  return copy;
}

/** A board row's `live` block, the shape `live_state` attaches: under way
 *  (`match_state: "in"`) or at full time (`"post"`). */
export function liveBlock(state: "in" | "post" = "in") {
  const ft = state === "post";
  return {
    in_play: true, read_at: "2026-09-15T21:16:00Z", window_seconds: 600,
    row_age_seconds: 42.0,
    clock: {
      minute: ft ? 90 : 61, clock_display: ft ? "90'+4'" : "61'",
      score_home: 2, score_away: 1,
      status_detail: ft ? "FT" : "61'", period: ft ? "stopped" : "second_half",
      period_basis: ft ? "the tape's status detail is 'FT'"
        : "the tape's status detail is a running clock",
      match_state: state, captured_at: "2026-09-15T21:15:18Z",
    },
    absent: null,
    basis: "WHERE THE MATCH IS, off the live plane's state tape. "
      + "THE MATCH IS LIVE; THE NUMBERS ARE NOT.",
  };
}
