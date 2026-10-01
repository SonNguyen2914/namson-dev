# CHECKPOINT — ratings-block (live player-ratings team +/-)

Working file; deleted in the final commit of this branch.

- [x] branch `ratings-block` off origin/main 631599b
- [x] backend shape read: TRIVELA src/live_perf/read.py (schema live-performance-v0)
- [x] component src/components/RatingsBlock.tsx
- [x] MatchHub insertion (one line + one import)
- [x] proxy: `live-performance` prefix, id route only
- [x] specs (17 green; mutants red: 10 + 18) (mocked backend only)
- [ ] tsc / build / suite

Finding: the backend publishes NO collection flag. LIVE_PERF_ENABLED is
not in any public payload, so "collection is off" is inferred from the
fixture route's 404 ("no live-performance record").
