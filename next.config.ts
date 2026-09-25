import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/* WHICH PAGES A BOARD CARD CAN OPEN, READ OFF THE PAGES THAT EXIST
   (2026-09-25, frontend audit F2). A card's link used to be a typed
   pattern — `/bet-suggester/<league>/<event_id>` — and 9 of 22 landing
   links, every EFL Cup card and every national card went to the 404,
   because only four leagues have a match hub. So the build reads the
   route table itself and hands it to the client as two lists:
     - MATCH HUBS: every `bet-suggester/<slug>/[eventId]` page;
     - COMPETITION PAGES: every static `bet-suggester/<name>` page.
   A hub added tomorrow is linked by its existence, and a card with
   nowhere to go is drawn unlinked (lib/pickerApi.rowHref), never sent to
   a page that is not there. */
const PAGES = path.join(process.cwd(), "src/pages/bet-suggester");
const entries = fs.readdirSync(PAGES, { withFileTypes: true });
const MATCH_HUBS = entries
  .filter((e) => e.isDirectory() && fs.existsSync(path.join(PAGES, e.name, "[eventId].tsx")))
  .map((e) => e.name).sort();
const COMP_PAGES = entries
  .filter((e) => e.isFile() && /^[a-z0-9-]+\.tsx$/.test(e.name) && e.name !== "index.tsx")
  .map((e) => e.name.replace(/\.tsx$/, "")).sort();

const nextConfig: NextConfig = {
  reactStrictMode: true,

  env: {
    TRIVELA_MATCH_HUBS: MATCH_HUBS.join(","),
    TRIVELA_COMP_PAGES: COMP_PAGES.join(","),
  },

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
