/** The three card sources the one-card rule is checked against
 *  (AGENTS.md §8) — real recordings, shared by e2e/one-match-card.spec.ts. */
import { CUPS_CLOCK } from "./cups-board";
import { CHAMP_CLOCK } from "./championships-recorded";
import { LEAGUE_RECORDED, LEAGUE_RECORDED_CLOCK } from "./league-recorded";

export type Source = { name: string; mode: string; clock: string; board?: unknown;
                event?: string };
export const SOURCES: Source[] = [
  { name: "league", mode: "leagues", clock: LEAGUE_RECORDED_CLOCK, board: LEAGUE_RECORDED },
  { name: "cross-league cup", mode: "cups", clock: CUPS_CLOCK, event: "401915418" },
  { name: "nations", mode: "nations", clock: CHAMP_CLOCK },
];

