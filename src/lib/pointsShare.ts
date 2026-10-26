/** The two points-share chips as whole percents that sum to 100 (review
 *  finding 7, 2026-10-25). Rounding each side on its own printed 101%
 *  (0.425 / 0.575 → 43% · 58%); the away chip is the complement of the
 *  printed home chip instead, as long as the two shares are one whole —
 *  a pair that is not (a malformed payload) is printed as it came. */
export function shareChips(home: number, away: number): { home: number; away: number } {
  const h = Math.round(home * 100);
  if (Math.abs(home + away - 1) <= 0.005) return { home: h, away: 100 - h };
  return { home: h, away: Math.round(away * 100) };
}
