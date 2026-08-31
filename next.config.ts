import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // /bet-suggester was the league carousel until 2026-08-30; it is the
  // picker board now, and the carousel moved to /bet-suggester/leagues.
  // Every ?league=<id> bookmark, every match hub's "back to board" link,
  // and every share of a league mode still has to land where it meant to,
  // so the old address keeps its meaning as a redirect rather than
  // quietly showing a different page.
  //
  // Two rules, and the ORDER is load-bearing: wc26 left the carousel
  // entirely (it is finished, and lives in the Archive dropdown), so it
  // has to be caught before the general rule sends it to a list it is not
  // in. The general rule captures the id and carries it through.
  //
  // Hard loads only — a client-side <Link> transition never consults this
  // file. The same mapping is repeated in the board page's own guard;
  // e2e/picker.spec.ts exercises both paths.
  async redirects() {
    return [
      {
        source: "/bet-suggester",
        has: [{ type: "query", key: "league", value: "wc26" }],
        destination: "/bet-suggester/wc26",
        permanent: false,
      },
      {
        source: "/bet-suggester",
        has: [{ type: "query", key: "league", value: "(?<league>.*)" }],
        destination: "/bet-suggester/leagues?league=:league",
        permanent: false,
      },
      // "?league=" — the key present with an EMPTY value. The value regex
      // above does not match an empty string, so without this rule the
      // bare param sat inert on the board. Presence-only match, and only
      // reached when the two rules above did not fire. The carousel's own
      // fallback (MLS, its default mode) does the rest.
      {
        source: "/bet-suggester",
        has: [{ type: "query", key: "league" }],
        destination: "/bet-suggester/leagues",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
