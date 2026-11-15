import { expect, test } from "@playwright/test";

// /bet-suggester -> /trivela (2026-11-14). The pages moved; every old
// bookmark, shared link and backend notice still points at the old path,
// so next.config.ts answers each one with a PERMANENT redirect (308) to
// the same page under /trivela, query string kept. The API did not move.

test("the bare old path redirects permanently to /trivela", async ({ request }) => {
  const r = await request.get("/bet-suggester", { maxRedirects: 0 });
  expect(r.status()).toBe(308);
  expect(r.headers()["location"]).toBe("/trivela");
});

test("a page under the old path keeps its place and its query", async ({ request }) => {
  const r = await request.get("/bet-suggester/epl/12345?tab=market", { maxRedirects: 0 });
  expect(r.status()).toBe(308);
  expect(r.headers()["location"]).toBe("/trivela/epl/12345?tab=market");
});

test("an old league bookmark still reaches its league", async ({ request }) => {
  const first = await request.get("/bet-suggester?league=mls", { maxRedirects: 0 });
  expect(first.status()).toBe(308);
  expect(first.headers()["location"]).toBe("/trivela?league=mls");
  const second = await request.get("/trivela?league=mls", { maxRedirects: 0 });
  expect(second.headers()["location"]).toBe("/trivela/leagues?league=mls");
});

test("the API keeps its old name", async ({ request }) => {
  const r = await request.get("/api/bet-suggester/upcoming", { maxRedirects: 0 });
  expect(r.status()).not.toBe(308);
});
