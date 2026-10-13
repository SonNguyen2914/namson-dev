/* THE BACKEND'S 422 BODIES, ONE OF EACH SHAPE, RECORDED 2026-10-13.
 *
 * HOW. TRIVELA `api.main.app` on origin/main 2ab1a4b0, in process through
 * FastAPI's TestClient (no lifespan, so no scheduler), each request refused
 * at validation before any board assembly: nothing reached a deployed
 * backend and nothing was written.
 *
 *  - ARRAY: `GET /api/picker/board?leagues=<9 slugs>&days=8`. FastAPI's own
 *    query validation, `detail` an array of {type, loc, msg, input, ctx}.
 *    The live Cups tab hit this shape on 2026-10-13 (its `?leagues=` named
 *    more cups than PICKER_LEAGUES_PATTERN allowed) and the failure card
 *    printed "[object Object]".
 *  - STRING: `GET /api/championships/board?date=2026-10-13`. The route's own
 *    `HTTPException(422, "...")`, `detail` a string. */
export const BOARD_422_ARRAY = {
  "detail": [
    {
      "type": "string_pattern_mismatch",
      "loc": ["query", "leagues"],
      "msg": "String should match pattern '^[a-z][a-z0-9-]{1,20}(,[a-z][a-z0-9-]{1,20}){0,7}$'",
      "input": "epl,laliga,mls,ligamx,bundesliga,seriea,ligue1,eredivisie,ucl",
      "ctx": { "pattern": "^[a-z][a-z0-9-]{1,20}(,[a-z][a-z0-9-]{1,20}){0,7}$" },
    },
  ],
};

export const BOARD_422_STRING = {
  "detail": "date must be YYYYMMDD (a US-Eastern day)",
};
