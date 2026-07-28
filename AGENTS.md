<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- Everything below is hand-written. The block above is tool-generated
     and gets regenerated — do not put project rules inside it. -->

# Trivela — frontend rules

This repo is **namson.dev**, Son's personal site. It also serves the
Trivela bet-suggester at `/bet-suggester`. Both things are true; changes
here can affect a portfolio site as well as a research platform.

Shared cross-agent rules (evidence classes, the real-money lock, WC26
classification, review roles) live in the **`SonNguyen2914/TRIVELA`**
repository at `AGENTS.md`. Locally that is usually
`~/dev/TRIVELA/backend/AGENTS.md`. If you do not have it checked out,
say so rather than assuming the rules do not apply.

The rules below are specific to this repo and appear nowhere in that
file.

## 1. Pushing deploys

Vercel deploys from a push to the default branch. Do not push without
Son's explicit say-so.

Pushing a *non-default* branch builds a Vercel **preview** only — a
preview URL, production domain untouched. That is how a GitHub-backed
reviewer gets to see the diff at all, so it is expected rather than
risky. `.github/workflows/ci.yml` here triggers on push to `main` and on
`pull_request`, so a branch push with no open PR runs **no CI**: local
`npx tsc --noEmit`, `npm run build` and `npx playwright test` are the
only signal until a PR exists.

## 2. Decision safety is a frontend invariant

Model output is **observational**. The UI must never present it as
advice:

- shadow / not-advice labelling stays on any surface showing model numbers
- never a bare `TAKE`
- an empty state says plainly there is no prediction — it never renders a
  zero bar that reads as a real forecast
- never let copy call a point estimate an established edge. The standing
  result is +0.0269, n=177, CI [−0.0043, +0.0605] — **not significant**

Enforcement is split, and is **not** complete:

- shadow framing and the bare-`TAKE` ban — `e2e/decision-safety.spec.ts`
- the empty state — `e2e/contract-deterministic.spec.ts`
- the significance-language rule has **no automated assertion**. It is
  reviewed by eye. Treat any copy change touching edge or performance
  claims as needing manual scrutiny, and do not assume a green suite
  cleared it.

## 3. Derive what you display from the numbers beside it

Never render a provider's composite string. ESPN's `score` is
**winner-first**, so rendering it directly made every defeat display as
a win. A result letter must be derived from the same two numbers shown
next to it.

More generally: a provider's *grouping* is data, not a guarantee — its
"Eastern Conference" once contained all 30 clubs. Enforced by
`e2e/scouting-consistency.spec.ts` and `e2e/mls-dashboard.spec.ts`.

## 4. Verify with Playwright, not the browser preview pane

The Next dev client wedges pre-hydration in the preview pane, and
`preview_start` ignores the config name and forces the production
backend. Use `npx playwright test` — the config self-serves on port 3123
and honours `SUGGESTER_BACKEND_URL`.

**But Playwright defaults to production too.** `playwright.config.ts`
falls back to the production Railway URL when `SUGGESTER_BACKEND_URL` is
unset, so the bare command is not the local-only run it reads as. The
requests are read-only GETs against the public shadow API — nothing is
written — but the results depend on a live service and on volatile data,
which is precisely the rot §6 below warns about.

Set it explicitly unless you mean to smoke-test live:

```bash
SUGGESTER_BACKEND_URL=http://localhost:8000 npx playwright test
```

`e2e/contract-deterministic.spec.ts` needs no backend at all; the other
four specs do.

## 5. Hydration

Dashboard components **do** render during SSR — what is missing then is
the *fetched data*, which only arrives after `useEffect` runs on the
client. So local-time formatting of fetched values is safe; anything
rendered in the initial SSR pass must not depend on the viewer's clock
or locale.

## 6. Prefer hermetic tests to live-data tests

Tests pinned to a live fixture rot: `decision-safety.spec.ts` hard-coded
a match that later settled, and went permanently red for reasons
unrelated to decision safety. Prefer recorded payloads
(`e2e/contract-deterministic.spec.ts`); when a test must use live data,
have it skip with a stated reason rather than fail.

## 7. Prove a guard fires

A test that passes both before and after a fix proves nothing. Before
trusting a new assertion, confirm it fails against the previous build.
