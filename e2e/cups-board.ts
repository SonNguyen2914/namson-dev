/* THE CUPS TAB'S BOARD, COMPOSED FROM RECORDINGS. Nothing here was
 * fetched for this file, and no production route was called.
 *
 * The Cups tab asks `GET /api/picker/board?leagues=ucl,leaguescup,
 * campeones,eflcup` (and the same on /api/picker/review). No recording of
 * that exact ask exists, and taking one would freeze snapshot rows in
 * production (e2e/board-holdout.mjs). So the payload is assembled from
 * the recordings this repo already holds, each used for what it really is:
 *
 *   - eflcup: e2e/efl-cup-recorded.ts, verbatim (rows, meta, field notes).
 *     A real cross-tier cup card.
 *   - campeones: e2e/campeones-board.ts. Its one refusal and its `folded`
 *     meta are verbatim, with the wire's `columns: ["mls","ligamx"]`. That
 *     stamp is the fold the Cups tab has to undo. The kickoff is put back
 *     to the real 2026-09-17T00:00Z, which that file moved to December.
 *   - leaguescup: the competition is finished, so it is under `folded`
 *     with no fixture. That is how the backend answers a cup with no row
 *     in the window ("drop a cup column nobody lands in").
 *   - ucl: STAND-IN ROWS. These are the recorded EPL and La Liga rows of
 *     e2e/eight-columns.ts relabelled `league: "ucl"`, so the column draws
 *     full cards (model and market lines, tiers, form). The club names
 *     are therefore league fixtures. Assertions here must never read a
 *     club name as a Champions League tie.
 *
 * The clock is BOARD_EIGHT's own `generated_at` (CUPS_CLOCK), which puts
 * every kickoff inside the 8-day window. */
import type { Page } from "@playwright/test";
import { BOARD_EIGHT, REVIEW_EIGHT } from "./eight-columns";
import { RECORDED as EFL } from "./efl-cup-recorded";
import { CAMPEONES_BOARD } from "./campeones-board";

export const CUPS_ASK = ["ucl", "leaguescup", "campeones", "eflcup"];
export const CUPS_CLOCK = "2026-09-15T12:00:00Z";

type Obj = Record<string, unknown>;
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

const asUcl = (r: Obj): Obj => ({
  ...r, league: "ucl", column: "ucl", columns: ["ucl"],
  event_id: `ucl-${String(r.event_id)}`,
});

function build(): Obj {
  const eight = clone(BOARD_EIGHT) as unknown as Obj;
  const efl = clone(EFL) as unknown as Obj;
  const camp = clone(CAMPEONES_BOARD) as unknown as Obj;
  const eightRows = eight.rows as Obj[];
  const uclRows = eightRows
    .filter((r) => r.league === "epl" || r.league === "laliga")
    .map(asUcl);
  const campRefusals = (camp.refusals as Obj[])
    .filter((r) => r.league === "campeones")
    .map((r) => ({ ...r, kickoff: "2026-09-17T00:00Z" }));
  const campFolded = (camp.folded as Obj).campeones as Obj;
  const eflMeta = (efl.leagues as Obj).eflcup as Obj;
  return {
    generated_at: "2026-09-15T11:32:12.122555+00:00",
    date: "20260915",
    days: 8,
    leagues: {
      ucl: { src: "prior", min_current_gp: 4, clubs: 36, kind: "cup",
             rated_on: ["epl", "laliga"] },
      eflcup: eflMeta,
    },
    rows: [...uclRows, ...(efl.rows as Obj[])],
    refusals: [...campRefusals, ...((efl.refusals as Obj[]) ?? [])],
    off_board: efl.off_board ?? [],
    off_board_counts: efl.off_board_counts ?? {},
    folded: {
      campeones: { ...campFolded, fixtures: 0, refusals: 1, off_board: 0 },
      leaguescup: { src: "current", min_current_gp: 20, clubs: 36,
                    kind: "cup", rated_on: ["mls", "ligamx"],
                    folded_into: [], fixtures: 0, refusals: 0,
                    off_board: 0 },
    },
    field_unit_notes: efl.field_unit_notes,
    field_floor_note: efl.field_floor_note,
    narrowed_to: CUPS_ASK,
  };
}

export const CUPS_BOARD = build();

/** The finished tail: two recorded EPL/La Liga finished rows as UCL
 *  stand-ins, the other cups read with nothing finished. */
function buildReview(): Obj {
  const rv = clone(REVIEW_EIGHT) as unknown as Obj;
  const fin = (rv.finished as Obj[])
    .filter((r) => r.league === "epl" || r.league === "laliga")
    .map(asUcl);
  const read = (n: number) => ({ finished: n, captured: 0, reconstructed: 0,
    unavailable: n, error: null, captured_by_lead_band: {}, corrected: 0,
    kind: "cup" });
  return {
    ...rv,
    leagues: { ucl: read(fin.length), leaguescup: read(0), eflcup: read(0) },
    folded: { campeones: { ...read(0), folded_into: ["ligamx", "mls"] } },
    finished: fin,
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
export async function routeCups(page: Page) {
  await page.route("**/api/picker/board**", (r) => {
    const asked = new URL(r.request().url()).searchParams.get("leagues");
    return r.fulfill(json(asked ? CUPS_BOARD : BOARD_EIGHT));
  });
  await page.route("**/api/picker/review**", (r) => {
    const asked = new URL(r.request().url()).searchParams.get("leagues");
    return r.fulfill(json(asked ? CUPS_REVIEW : REVIEW_EIGHT));
  });
}
