import { expect, test } from "@playwright/test";
import {
  NO_STATUS_REASONS, failureSentence, readFailure,
} from "../src/lib/providerFailure";

// MISSING IS NEVER ZERO, AND IT IS NEVER "NO ANSWER" EITHER.
//
// THE DRIFT (found 2026-09-16, by a cross-repo duplicate audit).
// `src/picker/provider_failure.py` names this file in its own header —
// "the vocabulary below is deliberately THAT FILE'S OWN", "word for word
// the frontend's `classify()`" — and it was not word for word. The
// backend's `_NO_STATUS` holds FOUR kinds; `classify()` held three:
//
//   timeout      "no answer in time"              both
//   unreachable  "could not be reached"           here: "THE PROVIDER
//                                                 could not be reached"
//   missing      "nothing was there to read"      here: absent
//   unreadable   "no answer we could read"        both
//
// WHAT THE MISSING BRANCH COST. A frozen artifact that is simply not on
// disk fell through to "no answer we could read" — a sentence that
// ASSERTS the provider answered and that we could not parse what it
// said. The backend rewrote itself for exactly this, in its own words:
// "a frozen artifact that is GONE and a provider that will not answer
// are different facts and lead an operator to different places". It is
// also this repo's own recurring bug — an unrecognised case folded into
// a meaningful one — which is why it gets a guard and not a comment.
//
// WHY THIS IS A GUARD AND NOT A DERIVATION. `classify()` runs precisely
// when the backend's own sentence did NOT survive the prose test, so
// there is no payload left to read the words off; a process boundary and
// two languages sit between the two lists. The copy has to exist. This
// pins the frontend half. THE PAIR ITSELF can only be checked from the
// backend, which already reads this repository in CI
// (backend tests/_frontend.py, tests/test_frontend_reads_the_declaration
// .py) — `NO_STATUS_REASONS` is exported so that suite can assert the
// four values against `_NO_STATUS` directly.
//
// FIXTURES SPEAK THE PROVIDER'S LANGUAGE. Nothing below is an
// "error-looking" string written for this file. Every one is what
// CPython or `requests` actually produces, in the shape the backend
// composes it (`f"{type(exc).__name__}: {exc}"` —
// src/picker/snapshots.py:721 and :860).

/** `FileNotFoundError`, whole, as the backend composes it. The artifact
 *  named is the one the backend's own comment cites as the case that
 *  drove its rewrite: a league-levels file that is not on disk. */
const ARTIFACT_GONE =
  "FileNotFoundError: [Errno 2] No such file or directory: "
  + "'research_archive/goals_cross_league_2026-09-09/league_levels.json'";

/** The same failure with nothing but the class and the name — the shape
 *  a caller that raises its own error produces, and the shape that made
 *  the old code say the provider had answered. */
const ARTIFACT_GONE_SHORT = "FileNotFoundError: eflcup_field.json";

/** A directory component that is a file. `NotADirectoryError` is the
 *  second type the backend maps to `missing`. */
const NOT_A_DIRECTORY =
  "NotADirectoryError: [Errno 20] Not a directory: "
  + "'research_archive/efl_bridges_2026-09-15/components.json/x'";

/** `urllib3`'s pool error as `requests` re-raises it — a provider that
 *  would not answer, which is the fact `missing` must not be folded into
 *  and the fact that must not be folded into `missing`. */
const POOL_TIMEOUT =
  "HTTPSConnectionPool(host='api.elections.kalshi.com', port=443): "
  + "Max retries exceeded with url: /trade-api/v2/markets "
  + "(Caused by NewConnectionError('Connection refused'))";

/** A missing file on a NETWORK SHARE. The unreachable test is a broad
 *  word list and this path carries "network" inside it, so this is the
 *  fixture that proves the two branches are ORDERED and not merely both
 *  present. */
const MISSING_ON_A_SHARE =
  "FileNotFoundError: [Errno 2] No such file or directory: "
  + "'/Volumes/network-share/trivela/eflcup_field.json'";

const said = (raw: string) => {
  const f = readFailure(raw);
  expect(f, `readFailure returned nothing for ${raw}`).not.toBeNull();
  return failureSentence(f!);
};

// ══ 1. THE BRANCH THAT WAS NOT THERE ═════════════════════════════════

test("a file that was never there is NAMED as missing, not reported as an unreadable answer",
  () => {
    for (const raw of [ARTIFACT_GONE, ARTIFACT_GONE_SHORT, NOT_A_DIRECTORY]) {
      const out = said(raw);
      expect(out, `"${raw}" did not read as a missing file`)
        .toBe(NO_STATUS_REASONS.missing);
      /* THE HALF THAT SAYS WHY IT MATTERS. "no answer we could read"
         asserts the provider ANSWERED and that we could not parse it;
         "could not be reached" asserts a network. Both are claims about
         something that never happened. */
      expect(out).not.toBe(NO_STATUS_REASONS.unreadable);
      expect(out).not.toBe(NO_STATUS_REASONS.unreachable);
    }
  });

test("the two branches are ORDERED — a missing file whose PATH says network is still missing",
  () => {
    expect(said(MISSING_ON_A_SHARE)).toBe(NO_STATUS_REASONS.missing);
  });

test("and a provider that would not answer is still unreachable, never missing",
  () => {
    /* NON-VACUOUS IN THE OTHER DIRECTION: a `missing` branch written too
       wide would swallow this, and every assertion above would still
       pass while the network case reported a file. */
    expect(said(POOL_TIMEOUT)).toBe(NO_STATUS_REASONS.unreachable);
  });

// ══ 2. THE SPELLING, WHICH IS THE PRODUCER'S ═════════════════════════

test("the unreachable sentence carries NO subject, because the backend's does not",
  () => {
    /* `provider_failure.reason()` is subject-less by construction — the
       caller's own prose names what it was reading, and `api/main.py`
       passes "its upstream" precisely because it does NOT know which of
       four providers failed. A frontend that answered "the provider
       could not be reached" named one anyway. */
    expect(NO_STATUS_REASONS.unreachable).toBe("could not be reached");
    expect(said(POOL_TIMEOUT)).not.toMatch(/^the provider\b/);
  });

test("all four no-status kinds exist and no two of them say the same thing",
  () => {
    /* THE SET, NOT A SUBSET. Three-of-four is exactly how this drift
       survived: every test that existed was satisfied by the three that
       were there. */
    const kinds = Object.keys(NO_STATUS_REASONS).sort();
    expect(kinds).toEqual(["missing", "timeout", "unreachable", "unreadable"]);
    const words = Object.values(NO_STATUS_REASONS);
    expect(new Set(words).size).toBe(words.length);
  });

// ══ 3. AND NONE OF THEM IS MACHINE TEXT ══════════════════════════════

test("the whole sentence a missing artifact produces carries no path and no errno",
  () => {
    /* THE DOOR THIS AUDIT DID NOT NAME, and the reason the branch above
       could not fire on the commonest real shape. `ARTIFACT_GONE`
       survived the prose test whole — no URL, no host, no query string,
       and a path PATHISH could not see because it is RELATIVE and opens
       against a quote — so the errno and an internal repository path
       went onto the page verbatim. */
    for (const raw of [ARTIFACT_GONE, NOT_A_DIRECTORY, MISSING_ON_A_SHARE]) {
      const out = said(raw);
      expect(out, "an errno reached the reader").not.toMatch(/\[Errno/i);
      expect(out, "a file path reached the reader").not.toContain("/");
      expect(out, "a filename reached the reader").not.toContain(".json");
      expect(readFailure(raw)!.redacted).toBe(true);
    }
    /* AND THE RAW TEXT IS NOT THROWN AWAY — it is what an operator needs.
       `readFailure` keeps it on `.raw` for `announceFailure` to put in
       the console, which is where an operator looks and a reader does
       not. A guard that only forbade would be satisfied by losing it. */
    expect(readFailure(ARTIFACT_GONE)!.raw).toBe(ARTIFACT_GONE);
  });
