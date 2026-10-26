import { expect, test } from "@playwright/test";

// SECURITY HEADERS (audit 2026-10-26). next.config.ts `headers()` sends
// these on every response: the site may be framed only by itself (the
// operator console's halt / kill / kill-lift buttons must not be
// clickjackable from another origin), types are not sniffed, and a
// cross-origin referrer carries the origin only. Hermetic: the request
// fixture reads headers off the local server; nothing is rendered.

const EXPECTED: Record<string, string> = {
  "x-frame-options": "SAMEORIGIN",
  "content-security-policy": "frame-ancestors 'self'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

for (const path of ["/", "/ops/trading", "/bet-suggester/var", "/api/ops/trading-status"]) {
  test(`${path} carries the security headers`, async ({ request }) => {
    const r = await request.get(path, { maxRedirects: 0 });
    const h = r.headers();
    for (const [k, v] of Object.entries(EXPECTED)) {
      expect(h[k], `${path} ${k}`).toBe(v);
    }
  });
}
