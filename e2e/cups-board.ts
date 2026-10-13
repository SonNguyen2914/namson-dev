/* THE CUPS TAB'S BOARD — RECORDINGS ONLY, no relabelled league rows
 * (AGENTS.md §8; the Oct 12 version of this file relabelled EPL rows as
 * UCL and so never exercised the cross-league card).
 *
 *   - ucl: e2e/cups-recorded.ts, the real in-process assembly of the
 *     Cups tab's own ask — cross-league ties (Lens v Sporting CP, Sabah FK
 *     v Slavia Prague, …) with their field, league gap, h2h and book.
 *     Its `folded` (eflcup, leaguescup, campeones) is the wire's.
 *   - eflcup: the one row of e2e/efl-cup-recorded.ts, verbatim except its
 *     kickoff, moved from 2026-09-17T18:30Z to 2026-10-14T18:30Z so it
 *     sits in the same window.
 *   - campeones: the refusal of e2e/campeones-board.ts, verbatim except
 *     its kickoff, moved to 2026-10-15T00:00Z for the same reason. It
 *     keeps the wire's `columns: ["mls","ligamx"]` — the stamp the Cups
 *     tab has to undo.
 *
 * The clock is the recording's morning, so every kickoff is ahead. */
import type { Page } from "@playwright/test";
import { BOARD_EIGHT, REVIEW_EIGHT } from "./eight-columns";
import { RECORDED as EFL } from "./efl-cup-recorded";
import { CAMPEONES_BOARD } from "./campeones-board";
import { CUPS_RECORDED, CUPS_RECORDED_CLOCK } from "./cups-recorded";

export const CUPS_ASK = ["ucl", "leaguescup", "campeones", "eflcup"];
export const CUPS_CLOCK = CUPS_RECORDED_CLOCK;

type Obj = Record<string, unknown>;
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

function build(): Obj {
  const b = clone(CUPS_RECORDED) as unknown as Obj;
  const efl = clone(EFL) as unknown as Obj;
  const camp = clone(CAMPEONES_BOARD) as unknown as Obj;
  const eflRows = (efl.rows as Obj[]).map((r) => ({ ...r, kickoff: "2026-10-14T18:30Z" }));
  const campRefusals = (camp.refusals as Obj[])
    .filter((r) => r.league === "campeones")
    .map((r) => ({ ...r, kickoff: "2026-10-15T00:00Z" }));
  return {
    ...b,
    rows: [...(b.rows as Obj[]), ...eflRows],
    refusals: [...(b.refusals as Obj[]), ...campRefusals],
  };
}

export const CUPS_BOARD = build();

/** A copy of the recorded cups board with `edit` applied — for the
 *  season-rule specs, which remove a cup's fixtures or set its meta. */
export function cupsBoardWith(edit: (b: Obj) => void): Obj {
  const b = clone(CUPS_BOARD);
  edit(b);
  return b;
}

/** The finished tail: every cup read, nothing finished in the window —
 *  an honest empty read rather than relabelled league results. */
function buildReview(): Obj {
  const rv = clone(REVIEW_EIGHT) as unknown as Obj;
  const read = () => ({ finished: 0, captured: 0, reconstructed: 0,
    unavailable: 0, error: null, captured_by_lead_band: {}, corrected: 0,
    kind: "cup" });
  return {
    ...rv,
    leagues: { ucl: read(), leaguescup: read(), eflcup: read() },
    folded: { campeones: { ...read(), folded_into: ["ligamx", "mls"] } },
    finished: [],
    refusals: [],
    narrowed_to: CUPS_ASK,
  };
}

export const CUPS_REVIEW = buildReview();

const json = (body: unknown) => ({
  status: 200, contentType: "application/json", body: JSON.stringify(body),
});

/** Serve the cups board and review for a `?leagues=` ask, and the
 *  recorded eight-column board for the declared one. */
export async function routeCups(page: Page, board: unknown = CUPS_BOARD) {
  await page.route("**/api/picker/board**", (r) => {
    const asked = new URL(r.request().url()).searchParams.get("leagues");
    return r.fulfill(json(asked ? board : BOARD_EIGHT));
  });
  await page.route("**/api/picker/review**", (r) => {
    const asked = new URL(r.request().url()).searchParams.get("leagues");
    return r.fulfill(json(asked ? CUPS_REVIEW : REVIEW_EIGHT));
  });
}
