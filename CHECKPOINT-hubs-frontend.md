# CHECKPOINT — hubs-all-comps-frontend (delete in final commit)

Base: origin/main 631599b
Contract assumed: GET /api/comp/{slug}/match/{event_id} for slug in
bundesliga, seriea, ligue1, eredivisie, unl, cnl, afcon — same payload as
src/comp_match.build: {match, book, books, book_meta, model: null,
model_refusal: {state, why, instead, note}, lineups}. Sister branch
`hubs-all-comps-backend` did NOT exist at start (checked 2026-10-01).
2026-10-02: it exists (bc29a79) and MATCHES: same route, keyed by column
key; adds `board_read` (+ competition/display/framing). model_refusal.instead
is the KEY "board_read" -> MatchHub now draws board_read (label/clock/notes
only) and never prints the key.

- [x] M1: 7 hub pages (lib/compHub.ts config), MatchHub: named no-model
      state, payload normalisation, per-section ErrorBoundary, held data
      dimmed with its time
- [x] M2: e2e/every-competition-has-a-hub.spec.ts 28/28 green
- [ ] M2b: red/green proof (A: drop a hub page; B: drop proxy hub regex; C: drop refusal block)
- [ ] M3: build + full suite, CI-style
- Proxy: CORRECTED — COMP_KEY has no digits, so `ligue1/match/N` was refused.
  Added HUB_MATCH_KEYS + one regex for exactly the seven per-match paths.
- Held-data dimming from M1 reverted (out of scope; MatchHub diff kept minimal).
- Env: container Playwright browsers are build 1194, package wants 1228 ->
  PLAYWRIGHT_BROWSERS_PATH=<scratch>/pw with symlinks. package-lock.json
  churn from `npm install` is NOT committed.
- Board links: automatic — next.config.ts reads hub dirs into MATCH_HUBS.
