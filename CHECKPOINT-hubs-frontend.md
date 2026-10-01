# CHECKPOINT — hubs-all-comps-frontend (delete in final commit)

Base: origin/main 631599b
Contract assumed: GET /api/comp/{slug}/match/{event_id} for slug in
bundesliga, seriea, ligue1, eredivisie, unl, cnl, afcon — same payload as
src/comp_match.build: {match, book, books, book_meta, model: null,
model_refusal: {state, why, instead, note}, lineups}. Sister branch
`hubs-all-comps-backend` did NOT exist at start (checked 2026-10-01).

- [x] M1: 7 hub pages (lib/compHub.ts config), MatchHub: named no-model
      state, payload normalisation, per-section ErrorBoundary, held data
      dimmed with its time
- [ ] M2: specs (per-comp states, board links, registry-derived 11) + red/green
- [ ] M3: build + full suite, CI-style
- Proxy: comp id route `^[a-z][a-z-]{1,20}/match/\d{1,12}$` already forwards
  all seven; no allowlist change needed (pinned by spec).
- Board links: automatic — next.config.ts reads hub dirs into MATCH_HUBS.
