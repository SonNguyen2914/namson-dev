// A LIVE READ THAT EITHER ANSWERS OR SAYS IT DID NOT.
//
// The shape this exists to stop, written out once because the tree has
// now paid for it in four separate files: a spec reads the shared shadow
// backend with no bound, the backend is slow, the read eats the whole
// per-test budget, and the runner reports a failure of a SUBJECT THE
// TEST NEVER REACHED — "absences are only claimed once an XI exists"
// red because a match payload did not arrive, "the proxy route exists"
// red because the route it exists at was busy. A failed read rendered
// as a finding is the one thing this suite is built to refuse, and it
// was doing it to itself.
//
// `e2e/lineups.spec.ts` line 18 worked this out on 2026-09-09 and wrote
// it inline; the identical read forty lines below it stayed unbounded
// and went red on 2026-09-22. Two more did the same thing in the run
// after that. So it is a function now, and the reasoning lives with it.
//
// WHAT IT DOES NOT DO. It does not retry, and it does not decide. The
// CALLER says what an unanswered read means for its own claim — a skip
// with the reason named where the claim cannot be evaluated without the
// payload, a `continue` where the read was one candidate in a scan —
// because those are different sentences and only the spec knows which
// one it is making. What is removed is the third possibility, the one
// nobody chose: the test dying mid-read and its name being printed
// under "failed". (Not a .spec.ts, so the runner does not collect it.)
import type { APIRequestContext, APIResponse } from "@playwright/test";

/** Well inside the suite's 45s per-test default, so the caller's skip
 *  happens rather than the runner killing the test around it. */
export const LIVE_READ_MS = 20_000;

/** The read, or `null` if it did not answer in the time it was given.
 *  Never throws for a slow or unreachable backend — a transport failure
 *  and a slow one are the same fact here, and neither is an answer. */
export async function liveGet(
  request: APIRequestContext, url: string, ms: number = LIVE_READ_MS,
): Promise<APIResponse | null> {
  try {
    return await request.get(url, { timeout: ms });
  } catch {
    return null;
  }
}

/** The sentence a spec skips with. Kept here so every one of them names
 *  the same two facts — what did not answer, and that the claim is
 *  therefore unevaluated rather than disproved. */
export function unanswered(url: string, ms: number = LIVE_READ_MS): string {
  return `the shadow backend did not answer ${url} within ${ms / 1000}s. `
    + `The claim below is read off that payload, so there is nothing to `
    + `evaluate it against — this is an unread backend, not a defect in `
    + `the thing being read. e2e/global-setup.ts prints what the live `
    + `routes cost at the top of the run.`;
}
