/** EVERY PAGE THE APP SERVES, READ OFF THE PAGES DIRECTORY.
 *
 *  Not a list anybody typed. A guard that walks "every route" and then
 *  enumerates them by hand covers the routes that existed the day it
 *  was written, and the page that ships next is the one it misses —
 *  the touch floor itself was the proof (2026-09-25, audit F11): it was
 *  set on four surfaces, the guard walked the board, and fourteen other
 *  routes had every control under 44px with a green suite.
 *
 *  So the route set is the Next pages router's own: every `.tsx` under
 *  `src/pages`, minus the API routes and the `_app` / `_document`
 *  shells. `index` is its folder. `404` is reached the way a reader
 *  reaches it, by an address nothing answers.
 *
 *  A DYNAMIC SEGMENT TAKES A VALUE THE APP ITSELF LINKS TO where one
 *  exists (the competition viewer's `[key]` is filled from the app's own
 *  competition registries, so it walks a page a reader can reach from
 *  the menu), and a sample id otherwise. Every page here renders
 *  client-side — none has `getStaticPaths` — so a sample id reaches the
 *  real page and its real chrome, in the failed-read state the hermetic
 *  stand-in gives every unmocked read. */
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { COMPETITION_PAGES } from "./liveCompetitions";

const PAGES = join(__dirname, "..", "src", "pages");

/** An address no page answers, for the 404 page. */
export const NOWHERE = "/bet-suggester/no-such-page-touch-floor";

/** A fixture id for a match page that has no registry to draw from. */
const SAMPLE_ID = "761439";

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (relative(PAGES, p) === "api") continue;
      walk(p, out);
    } else if (/\.tsx$/.test(name) && !name.startsWith("_")) out.push(p);
  }
  return out;
}

export type PageRoute = { file: string; template: string; url: string };

/** Every page route, one entry per page file. */
export function pageRoutes(): PageRoute[] {
  const known = [...COMPETITION_PAGES];
  return walk(PAGES).map((file) => {
    const rel = relative(PAGES, file).replace(/\.tsx$/, "");
    const template = rel === "404" ? "404"
      : "/" + rel.replace(/(^|\/)index$/, "");
    let url: string;
    if (template === "404") url = NOWHERE;
    else if (!template.includes("[")) url = template === "/" ? "/"
      : template.replace(/\/$/, "");
    else {
      const re = new RegExp("^" + template.replace(/\[[^\]/]+\]/g, "[^/]+")
        + "$");
      url = known.find((h) => re.test(h))
        ?? template.replace(/\[[^\]/]+\]/g, SAMPLE_ID);
    }
    return { file: relative(join(PAGES, "..", ".."), file), template, url };
  });
}

/** HOW MANY PAGES THERE ARE, IN ONE PLACE. Derived above, pinned here:
 *  the derivation is what brings a new page into every guard that walks
 *  this, and the count is what makes a walk that silently shrinks — a
 *  directory renamed, a filter too eager — fail instead of covering
 *  less. A page added or removed moves this number on purpose. */
export const PAGE_COUNT = 19;
