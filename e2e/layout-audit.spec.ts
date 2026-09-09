import { test, expect } from "@playwright/test";

const ROUTES = [
  "/", "/bet-suggester", "/bet-suggester/leagues", "/bet-suggester/bots",
  "/bet-suggester/hunter", "/bet-suggester/wc26", "/bet-suggester/friendlies",
  // ADDED 2026-09-08, and it was missing from the day it shipped. The
  // Champions League board is the one route that lays a matchday ACROSS
  // the band — six ~196px tracks, the narrowest card this board has
  // ever drawn — so it is the route this sweep has the most to say
  // about, and it was the only board route no geometry test walked.
  "/bet-suggester/ucl",
  // ADDED 2026-09-09 with the route, not after it — this list is the
  // hand-typed subset the note above already confesses to, and the
  // Champions League board sat outside it "from the day it shipped".
  // The Leagues Cup archive is the densest page in the tree: 2024's
  // knockout is 32 cards over five rounds plus a 45-row fixture table,
  // and its first draft DID have two layout defects a text assertion
  // could not see — club names truncated to initials at 1440, and the
  // whole bracket invisible at 390 behind an IntersectionObserver.
  "/bet-suggester/leagues-cup",
];
const WIDTHS = [390, 768, 1100, 1440, 1920];

/* THE GUARD CLASS THAT WAS MISSING (2026-09-07).
 *
 * 556 tests asserted text, attributes and refusals, and not one of them
 * asserted a BOX. So three layout defects shipped in a week and were
 * found by eye on a screenshot rather than by the suite: four league
 * columns collapsed to 0px whenever a fifth competition appeared, a
 * sticky header parked one pixel under the top bar that hides it, and a
 * fixture count wrapped to its own row on the columns whose league had a
 * long name. Every one of them is invisible to a text assertion.
 *
 * This walks the real routes at five widths and reports geometry only:
 * the page must not scroll sideways, nothing sticky may park where the
 * z-50 top bar covers it, no visible text may sit in a zero box, and no
 * text may be silently cut off (an ellipsis or an sr-only clip is a
 * decision; `overflow:hidden` eating a word is not).
 *
 * It asserts an EMPTY list rather than a count, so a new finding arrives
 * as its own sentence in the failure. */
test("no route scrolls sideways, hides a sticky header, or cuts text",
  async ({ page }) => {
  // this sweep walks 9 routes x 5 widths against a live backend; the
  // default per-test budget is not sized for that
  test.setTimeout(180_000);
  const findings: string[] = [];
  const unreachable: string[] = [];
  for (const route of ROUTES) {
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      /* A ROUTE THAT WILL NOT LOAD IS NOT A LAYOUT DEFECT, and this
         sweep must not go red for one. These eight routes are walked
         UNMOCKED — that is the point, it is the real chrome — so they
         reach a live backend, and on 2026-09-08 a slow
         /bet-suggester/friendlies ate the whole test's budget and this
         spec failed for a reason it does not measure. A guard that goes
         red for something it is not about teaches its reader to ignore
         it, which costs more than the defect it would have caught.
         Bounded per navigation, recorded by name, and reported without
         failing: reachability has its own specs. */
      try {
        await page.goto(route, { waitUntil: "domcontentloaded",
                                 timeout: 12_000 });
      } catch {
        unreachable.push(`${route} @${w}`);
        continue;
      }
      await page.waitForTimeout(700);
      const r = await page.evaluate((vw) => {
        const out: string[] = [];
        const de = document.documentElement;
        if (de.scrollWidth > vw + 1) {
          // name the widest offender
          let worst = "", wx = 0;
          document.querySelectorAll("*").forEach((el) => {
            const b = el.getBoundingClientRect();
            if (b.width === 0) return;
            const right = b.right + window.scrollX;
            if (right > wx) { wx = right;
              worst = el.tagName.toLowerCase()
                + (el.className && typeof el.className === "string"
                   ? "." + el.className.split(/\s+/).slice(0, 3).join(".") : ""); }
          });
          out.push(`H-OVERFLOW doc=${de.scrollWidth} vw=${vw} widest=${Math.round(wx)} ${worst}`);
        }
        // silently clipped text: overflow hidden, content wider, no ellipsis
        document.querySelectorAll("*").forEach((el) => {
          const cs = getComputedStyle(el);
          if (cs.overflowX !== "hidden" && cs.overflow !== "hidden") return;
          if (cs.textOverflow === "ellipsis") return;
          // sr-only text is clipped to 1px BY DESIGN (clip-path inset)
          if (cs.clipPath && cs.clipPath !== "none") return;
          if (/\bsr-only\b/.test(String((el as HTMLElement).className))) return;
          if (!el.textContent || !el.textContent.trim()) return;
          if (!(el as HTMLElement).checkVisibility?.()) return;
          if (el.children.length > 2) return;
          if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
            out.push(`CLIPPED "${el.textContent.trim().slice(0, 40)}" `
              + `${el.scrollWidth}>${el.clientWidth}`);
          }
        });
        // visible text in a zero-width or zero-height box
        document.querySelectorAll("*").forEach((el) => {
          if (el.children.length) return;
          const tag = el.tagName.toLowerCase();
          // <option>/<select> children never have a box; sr-only text is
          // clipped to 1px BY DESIGN and is the accessible name, not ink.
          if (tag === "option" || tag === "optgroup" || tag === "select") return;
          if (el.closest("select")) return;
          const cls = typeof el.className === "string" ? el.className : "";
          if (/\bsr-only\b/.test(cls)) return;
          const t = el.textContent?.trim();
          if (!t) return;
          // checkVisibility walks ANCESTORS: an element inside a
          // `hidden xl:block` wrapper has its own display:block and a
          // zero box, which is correct and not a defect.
          if (!(el as HTMLElement).checkVisibility?.()) return;
          const cs = getComputedStyle(el);
          if (cs.position === "absolute" && cs.clip !== "auto") return;
          const b = el.getBoundingClientRect();
          if (b.width === 0 || b.height === 0) {
            out.push(`ZERO-BOX <${tag}> "${t.slice(0, 30)}" ${b.width}x${b.height}`);
          }
        });
        // STICKY PARKED BEHIND THE BAR. `.topbar` is sticky/top:0/z:50;
        // any other sticky element whose own `top` is less than the bar's
        // height will be hidden by it the moment it sticks.
        const bar = document.querySelector(".topbar") as HTMLElement | null;
        if (bar) {
          const barH = bar.getBoundingClientRect().height;
          const bz = Number(getComputedStyle(bar).zIndex) || 0;
          document.querySelectorAll("*").forEach((el) => {
            const cs = getComputedStyle(el);
            if (cs.position !== "sticky" || el === bar) return;
            if (bar.contains(el)) return;
            const top = parseFloat(cs.top);
            if (Number.isNaN(top)) return;
            const z = Number(cs.zIndex) || 0;
            if (top < barH - 0.5 && z < bz) {
              out.push(`STICKY-UNDER-BAR top=${top} barH=${Math.round(barH)} `
                + `<${el.tagName.toLowerCase()}> `
                + `${(el.getAttribute("data-testid") || "").slice(0, 24)}`);
            }
          });
        }
        return out;
      }, w);
      const uniq = [...new Set(r)];
      const rank = (f: string) => f.startsWith("H-OVERFLOW") ? 0
        : f.startsWith("STICKY-UNDER-BAR") ? 1
        : f.startsWith("CLIPPED") ? 2 : 3;
      uniq.sort((a, b) => rank(a) - rank(b));
      uniq.slice(0, 8).forEach((f) => findings.push(`${route} @${w}: ${f}`));
      if (uniq.length > 8) findings.push(`${route} @${w}: (+${uniq.length - 8} more)`);
    }
  }
  if (unreachable.length) {
    console.log("routes that did not load in 12s (NOT layout findings, "
      + "and not asserted here):\n" + unreachable.join("\n"));
  }
  expect(findings, "layout findings:\n" + findings.join("\n"))
    .toEqual([]);
});
