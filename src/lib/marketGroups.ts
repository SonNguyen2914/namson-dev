// Canonical market grouping — ONE definition shared by the match page's
// markets table and the live read, so both boards read in the same order.
// A market matching no test lands in "Other" (visible, never dropped).
export type MarketGroup = {
  id: string;
  label: string;
  test: (k: string | null | undefined) => boolean;
};

export const MARKET_GROUPS: MarketGroup[] = [
  { id: "winner", label: "Winner · 90 min",
    test: (k) => k === "home_win" || k === "away_win" || k === "draw" },
  { id: "advance", label: "To advance",
    test: (k) => k === "home_advance" || k === "away_advance" },
  { id: "goals", label: "Goals · totals, BTTS, first goal",
    test: (k) => !!k && (/^over_|^under_/.test(k) || k === "btts" || /_first_goal$|^no_goal$/.test(k)) },
  { id: "margin", label: "Margin of victory",
    test: (k) => !!k && /margin/.test(k) },
  { id: "etpens", label: "Extra time / penalties",
    test: (k) => !!k && /_win_(et|pens)$/.test(k) },
  { id: "score", label: "Exact score",
    test: (k) => !!k && /^score_/.test(k) },
];

// Split rows into the canonical groups (plus Other), preserving the given
// in-group ordering of `rows`.
export function groupMarkets<T>(rows: T[], key: (r: T) => string | null | undefined):
    { label: string; rows: T[] }[] {
  const used = new Set<T>();
  const out: { label: string; rows: T[] }[] = [];
  for (const g of MARKET_GROUPS) {
    const hit = rows.filter((r) => g.test(key(r)));
    hit.forEach((r) => used.add(r));
    if (hit.length) out.push({ label: g.label, rows: hit });
  }
  const rest = rows.filter((r) => !used.has(r));
  if (rest.length) out.push({ label: "Other", rows: rest });
  return out;
}
