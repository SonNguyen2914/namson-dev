// Kalshi's trading fee, as the backend's canonical policy defines it.
//
// The authority is `FEE_POLICY` / `order_fee_dollars` in the backend's
// src/live/paper.py:
//
//     fee_dollars = ceil_to_centicent(0.07 * C * P * (1 - P))
//
// charged ONCE on the whole order, in exact decimal arithmetic. Two
// details are load-bearing and were both wrong in the scenario engine:
//
//  1. It is a WHOLE-ORDER fee with a ceiling, not a per-contract fee.
//  2. It must not be evaluated in binary floating point. The backend
//     learned this the expensive way (V9.1 eval F3): the float ceil
//     overcharged by a cent at some prices — 100 contracts at $0.10 is
//     63.00c exactly, but `0.07*100*0.10*0.90` is 0.6300000000000001 in
//     IEEE-754, so a naive ceil bills 63.01c (and, in cents, 64c).
//
// Everything below therefore runs on INTEGER centicents ($0.0001) — the
// granularity this repo's IMPLEMENTED policy rounds to. All intermediate
// products stay far inside Number.MAX_SAFE_INTEGER for any order size
// this UI can express.
//
// THAT GRANULARITY IS AN OPEN QUESTION, AND THIS FILE STATED IT AS A
// FACT until 2026-09-07 ("the precision Kalshi quotes and settles fees
// at" — a sentence with no source, contradicted by the one capture
// there is). See FEE_ROUNDING_OPEN below.
//
// This is a SCENARIO calculator: pure execution arithmetic against a
// displayed ask. It is not the paper ledger, it places no orders, and it
// models the general taker fee only — series/event overrides, maker
// fees, exit fees and the per-order rebate accumulator are NOT modelled,
// exactly as FEE_POLICY.not_modeled states.

export const FEE_RATE = 0.07;
export const FEE_POLICY_VERSION = "kalshi-fee-2026-07-general";
export const FEE_NOT_MODELED =
  "series/event overrides, maker fees, exit fees, per-order rebate " +
  "accumulator — general taker only";

/** THE BOUND ON EVERY FIGURE THIS MODULE RETURNS, registered.
 *
 *  Not a hole in this file's arithmetic — the arithmetic matches the
 *  backend's implemented policy exactly. A hole in what that policy is
 *  KNOWN to be, which the backend registers
 *  (`paper.ROUNDING_GRANULARITY_OPEN`, ridden on every hashed card as
 *  `card.CARD_ABSENCES["rounding_granularity"]`) and which had crossed
 *  to no frontend file, although the frontend keeps its own copy of the
 *  same arithmetic and is where a person actually reads the number.
 *  That is the shape this repo keeps paying for: the caveat closed at
 *  the site it was found and the same figure went on being printed one
 *  layer over with nothing attached.
 *
 *  It is EXPORTED so a surface that prints a fee can print the bound
 *  beside it, as real text — a fee shown without it is a figure whose
 *  own repo says it may be an order of magnitude low. Nothing here
 *  policies that: this module cannot see its own callers, and pretending
 *  an export is a wall would be the lie one generation on. It is a
 *  record with a closing condition, and the record is the honest half.
 *
 *  `bound` is quoted from the backend's measured sweep, not restated:
 *  cent rounding costs a MINIMUM of 2.2857x the raw headline fee at one
 *  contract, and that minimum is AT p=0.50 (p(1-p) peaks there, so it
 *  is the cheapest place the round-up can bite), rising to 57.72x at
 *  p=0.01 and p=0.99 — against the centicent this repo charges, 2.27x
 *  to 50.00x. */
export const FEE_ROUNDING_OPEN = {
  finding:
    "ROUNDING GRANULARITY IS AN OPEN QUESTION. orderFeeDollars rounds "
    + "up once per order to the CENTICENT ($0.0001), this repo's "
    + "implemented policy (paper.FEE_POLICY, V9.1 eval F3), while the "
    + "archived venue capture (research_archive/rn1/venue_fee_params."
    + "json) states the form as ceil to the next CENT, 100x coarser. If "
    + "the venue rounds to the cent, every fee this module returns is "
    + "UNDERSTATED — by 2.27x to 50.00x on a small clip, worst at the "
    + "price extremes and least bad at p=0.50. Partly, not wholly, "
    + "defused by the maker rounding reimbursement the venue states, "
    + "which is a monthly threshold a small clip may never reach.",
  closes_when:
    "a real fill receipt at a SMALL clip settles which granularity the "
    + "venue charges — no argument decides between the two, only a "
    + "receipt. paper.FEE_POLICY then states the measured form, this "
    + "module follows it, and this record retires. Retiring it without "
    + "a receipt is the failure it exists to prevent.",
} as const;

const CENTICENTS_PER_DOLLAR = 10_000;

/** A dollar price -> integer centicents, rounded half-up. */
function toCenticents(dollars: number): number {
  return Math.round(dollars * CENTICENTS_PER_DOLLAR);
}

/**
 * Whole-order taker fee in DOLLARS: ceil_to_centicent(0.07·C·P·(1−P)).
 * Returns 0 for a price outside (0,1) or a non-positive size, matching
 * the backend's guard.
 */
export function orderFeeDollars(price: number, contracts: number): number {
  if (!Number.isFinite(price) || !Number.isFinite(contracts)) return 0;
  if (contracts <= 0 || price <= 0 || price >= 1) return 0;
  const p = toCenticents(price);                       // 0 < p < 10000
  if (p <= 0 || p >= CENTICENTS_PER_DOLLAR) return 0;
  const c = Math.floor(contracts);
  // 0.07·C·P·(1−P) dollars, expressed in centicents:
  //   = 7·C·p·(10000−p) / 1e6      (exact integer division with ceiling)
  const numerator = 7 * c * p * (CENTICENTS_PER_DOLLAR - p);
  const feeCenticents = Math.ceil(numerator / 1_000_000);
  return feeCenticents / CENTICENTS_PER_DOLLAR;
}

/**
 * The UNQUANTIZED per-contract fee the backend's net-edge gate uses
 * (paper.py: `unit_fee = FEE_RATE * ask * (1 - ask)`). Deliberately NOT
 * the ceiling version: the edge gate compares a probability to a price,
 * and rounding the fee up per contract would bias that comparison.
 */
export function unitFeeDollars(price: number): number {
  if (!Number.isFinite(price) || price <= 0 || price >= 1) return 0;
  return FEE_RATE * price * (1 - price);
}

/** Total cash outlay for `contracts` at `price`, fee included. */
export function orderCostDollars(price: number, contracts: number): number {
  if (contracts <= 0) return 0;
  const c = Math.floor(contracts);
  return c * price + orderFeeDollars(price, c);
}

/**
 * The largest whole number of contracts whose all-in cost fits `stake`.
 *
 * Solved against the EXACT cost function rather than dividing by a
 * per-contract estimate: `stake / (price + unitFee)` is a float division
 * that lands a hair under a whole contract and silently drops it —
 * $10.63 at 10c buys 100 contracts (10.00 + 0.63), but the estimate
 * returns 99.999999… and floors to 99.
 */
export function maxContractsForStake(price: number, stake: number): number {
  if (!Number.isFinite(price) || !Number.isFinite(stake)) return 0;
  if (price <= 0 || price >= 1 || stake <= 0) return 0;
  const budget = toCenticents(stake);
  const fits = (c: number) => toCenticents(orderCostDollars(price, c)) <= budget;
  let c = Math.max(0, Math.floor(stake / (price + unitFeeDollars(price))));
  while (c > 0 && !fits(c)) c -= 1;
  while (fits(c + 1)) c += 1;
  return c;
}
