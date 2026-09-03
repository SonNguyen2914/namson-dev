import { test, expect } from "@playwright/test";

// The league and hunter proxies under src/pages/api/*/[...path].ts each
// spell out an ALLOWED set, and every other spec mocks fetch in the
// BROWSER, so the allowlists are never exercised by them — which is how
// the comp proxy 404'd a real backend route on prod behind nine green
// specs (see e2e/picker.spec.ts, "unmocked on purpose"). These tests hit
// the real dev server. Whatever the backend answers (payload, error,
// unreachable), the ONE response that proves the allowlist rejected a
// route is the proxy's own 404 body, and the one that proves it forwards
// a route it must not is the absence of that body.
//
// Audit of 2026-09-03: the laliga list carried `approval`, a route the
// backend has never served (only mls, epl and ligamx have one); the mls
// and ligamx lists omitted theirs; hunter omitted `live-coverage`. Each
// case below went red against the previous build before it went green.

const FORWARDED: Array<[string, string]> = [
  ["mls", "approval"],
  ["ligamx", "approval"],
  ["hunter", "live-coverage"],
  ["laliga", "status"],
];

for (const [prefix, resource] of FORWARDED) {
  test(`the ${prefix} proxy forwards ${resource} — unmocked on purpose`,
    async ({ request }) => {
      const r = await request.get(`/api/${prefix}/${resource}`);
      expect(await r.text(), `${resource} rejected by the proxy allowlist`)
        .not.toContain(`unknown ${prefix} route`);
    });
}

test("the laliga proxy refuses approval, which the backend never served",
  async ({ request }) => {
    // Hermetic: the allowlist answers before any backend is contacted,
    // so this holds with no backend at all.
    const r = await request.get("/api/laliga/approval");
    expect(r.status()).toBe(404);
    expect(await r.text()).toContain("unknown laliga route");
  });

test("each proxy still refuses a route that is on no list",
  async ({ request }) => {
    for (const prefix of ["mls", "ligamx", "laliga", "hunter"]) {
      const r = await request.get(`/api/${prefix}/decision`);
      expect(r.status(), `${prefix}/decision must be refused`).toBe(404);
      expect(await r.text()).toContain(`unknown ${prefix} route`);
    }
  });
