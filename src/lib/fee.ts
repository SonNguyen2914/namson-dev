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
// Everything below therefore runs on INTEGER centicents ($0.0001), which
// is the precision Kalshi quotes and settles fees at. All intermediate
// products stay far inside Number.MAX_SAFE_INTEGER for any order size
// this UI can express.
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
