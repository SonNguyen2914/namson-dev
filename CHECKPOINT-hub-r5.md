# CHECKPOINT — hub round 5, frontend (working file; deleted in the final commit)

- Component: src/components/ModelVsMarket.tsx (self-contained, own ErrorBoundary).
- MatchHub.tsx: one import line + one JSX line at the top of the main column.
- Proxy: `minutes` prefix, one id route `{key}/{event_id}` (suggesterProxy.ts).
- Backend route: GET /api/minutes/{key}/{event_id} on TRIVELA `hub-r5-backend`.
- Spec: e2e/model-vs-market.spec.ts, 14 tests, mocked. Mutation proofs: line-end gap
  pinned to line end -> 6 red; ErrorBoundary removed -> malformed test red.
- Next: full hermetic suite, then final commit.
