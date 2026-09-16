import { expect, test } from "@playwright/test";
import {
  COMPETITIONS, LIVE_COMPETITION_COUNT, RAIL_PAGES, chipFor,
} from "./liveCompetitions";

// THE NAV CHIPS THAT GLOW WHEN A COMPETITION PLAYS TODAY OR TOMORROW.
//
// "remove UCL from the landing page, we have it in its own cup page is
// enough. When a match of that competition is today or the next day,
// make its box glow" (operator, 2026-09-09). The first half took the
// Champions League off the picker board; this file is the second half.
//
// "make the EFL box glow up when there are matches on the next day,
// just like UCL" (operator, 2026-09-15). Same rule, second competition
// — and the day it landed this file said `ucl` nine times and `eflcup`
// none, so every property below was asserted of one chip and of no
// other. The set now comes from the registry and its LENGTH is
// asserted: see e2e/liveCompetitions.ts.
//
// WHAT IS PINNED, and why each is a property rather than a pixel:
//
//  1. IT IS DERIVED FROM FIXTURES. The same chip, the same code path
//     and — now provably — the same behaviour for every competition
//     glow or do not glow purely on what that competition's fixture
//     feed says: today, tomorrow, later, none. Nothing here knows what
//     a Champions League is, and the tests are run once per registry
//     entry to prove it rather than asserting it in a comment.
//  2. MISSING IS NEVER ZERO. A read that did not land is not "no match
//     soon": a failed fetch leaves an ORDINARY chip that asserts nothing,
//     rather than a chip claiming an empty slate off a request that never
//     answered.
//  3. IT SAYS WHEN, NOT WHETHER. The whole vocabulary is a day. The
//     backend pins the same rule in words (tests/test_position.py:230
//     forbids "you should" / "cash out now" / "sell now") and the spirit
//     of it reaches any label this app adds: nothing here may read as a
//     recommendation, an urgency or a claim about value.
//  4. IT IS WAYFINDING, NOT A VERDICT. Each chip is lit in its OWN
//     competition's league hue. Gold is the BRAND and up/warn/neg are
//     the traffic light; a chip glowing in either would be telling the
//     operator a fixture is good, bad or urgent, which is a judgement
//     this surface does not hold. Read off the PAINTED colour, not the
//     class name — and, since 2026-09-15, checked against every OTHER
//     competition's hue too, because two chips resolving to one colour
//     is wayfinding that does not way-find.
//  5. IT DOES NOT MOVE. A pulse reads as "hurry" — the one thing (3)
//     forbids — and is what prefers-reduced-motion exists to spare
//     people. There is no animation to reduce.
//  6. THE FACT SURVIVES WITHOUT THE COLOUR. A glow is colour alone, and a
//     screen reader, a high-contrast display and a printout all lose it,
//     so the day is written into the chip's accessible name.
//  7. IT IS ON EVERY PAGE THAT DRAWS THE RAIL. The rail was two identical
//     literals in two pages; the day one of them gained a glow, the other
//     had a chip that could not.
//
// Hermetic: every payload is served by page.route.

const json = (body: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(body),
});

// ── THE CLOCK, ASKED THE WAY THE PAGE ASKS IT ────────────────────────
// The app buckets every kickoff by calendar day in ONE fixed zone
// (lib/matchday.TZ). A test that built "today" out of the runner's own
// midnight would be green on a laptop in California and red on a CI
// runner in UTC eight hours a day, which is the drift the fixed zone
// exists to close — so this asks the same question with the same tool.
const TZ = "America/Los_Angeles";
const _fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
});
const dayKey = (d: Date) => _fmt.format(d);

/** The calendar day `n` days after a YYYY-MM-DD key. Calendar
 *  arithmetic, not `+ n*24h`: LA has a 25-hour day each November, and a
 *  clock-based "tomorrow" is the same day for its first hour. */
function plusDays(key: string, n: number) {
  const [y, m, d] = key.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  const p = (x: number) => String(x).padStart(2, "0");
  return `${t.getUTCFullYear()}-${p(t.getUTCMonth() + 1)}-${p(t.getUTCDate())}`;
}

/** A kickoff instant that lands on the given LA calendar day, whatever
 *  the season. 19:30Z is 11:30 or 12:30 in LA — the zone is UTC-8 or
 *  UTC-7 and never anything else — so the instant is the middle of that
 *  day under both offsets and cannot slide into a neighbour. */
function kickoffOn(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 19, 30)).toISOString();
}

const TODAY = dayKey(new Date());
const TOMORROW = plusDays(TODAY, 1);
const LATER = plusDays(TODAY, 4);

const fixture = (id: number, day: string) => ({
  fixture_id: id, kickoff_utc: kickoffOn(day), status: "NS",
  home: { name: "Home" }, away: { name: "Away" },
});

/** A fixture feed for one competition. `competition` is the registry's
 *  own key rather than a literal, so a feed can never be served under a
 *  name the chip is not asking for. */
const feed = (key: string, ...days: string[]) => ({
  competition: key,
  fixtures: days.map((d, i) => fixture(1000 + i, d)),
});

/* The board's own payloads, cut to the bone: this file is about the top
   bar, and a real board below it would only add requests that can fail
   for reasons that are not this file's subject. */
const BOARD = {
  generated_at: "2026-09-09T12:00:00Z", date: "20260909", days: 7,
  leagues: {
    mls: { src: "current", min_current_gp: 22, clubs: 30, kind: "league" },
  },
  rows: [], refusals: [],
};
const REVIEW = {
  generated_at: "2026-09-09T12:00:00Z", date: "20260909", back: 7,
  window: { from: "20260902", to: "20260909" },
  store: { backend: "memory", writable: true },
  leagues: {}, finished: [], refusals: [],
};

type Comp = (typeof COMPETITIONS)[number];

/** `comp` names WHICH chip is under test; `served` is its fixture feed,
 *  or a status code to fail the read with.
 *
 *  EVERY OTHER COMPETITION IN THE REGISTRY IS FAILED ON PURPOSE by the
 *  catch-all below. That is not incidental: it means each test drives
 *  one chip while its neighbours sit in the UNKNOWN state, so a glow
 *  that leaked from one chip to another — a shared hook, a shared
 *  token, a rail that lit itself — is visible here rather than hidden
 *  behind every chip being fed at once. */
async function open(
  page: import("@playwright/test").Page,
  comp: Comp,
  served: unknown | number,
  where = "/bet-suggester",
) {
  /* ORDER MATTERS AND IT IS BACKWARDS. Playwright tries the MOST
     RECENTLY registered handler first, so the catch-all goes on FIRST
     and the specific patterns after it — registered the other way round,
     the catch-all swallowed the fixture feed and every glow test failed
     for a reason that had nothing to do with the glow. */
  await page.route("**/api/**", (r) => r.fulfill(json({}, 503)));
  await page.route("**/api/picker/board**", (r) => r.fulfill(json(BOARD)));
  await page.route("**/api/picker/review**", (r) => r.fulfill(json(REVIEW)));
  await page.route(`**/api/comp/${comp.key}/fixtures**`, (r) =>
    typeof served === "number"
      ? r.fulfill(json({ detail: "upstream unavailable" }, served))
      : r.fulfill(json(served)));
  await page.goto(where);
}

/** The chip, once the read behind it has had its chance. Every
 *  unlit assertion goes through this: `data-soon` starts at "unknown"
 *  on the first paint by construction, so reading it straight after
 *  `goto` would confirm the not-yet-landed state and call it the
 *  answer. */
async function settled(page: import("@playwright/test").Page, comp: Comp) {
  const c = chipFor(page, comp);
  await expect(c).toBeVisible();
  await page.waitForLoadState("networkidle");
  return c;
}

// ─────────────────────────── 0: the registry the rest of this file walks

test("the rail draws every live competition and nothing else",
  async ({ page }) => {
    /* THE GUARD OVER THE GUARDS. Every describe below is generated from
       `COMPETITIONS`, so a registry this file could not see would take
       its whole coverage with it silently. Two assertions close that:
       the registry is the size it is declared to be, and the RAIL
       ACTUALLY DRAWS THAT MANY CHIPS — a registry entry that renders
       nothing would otherwise satisfy every test below by having no
       chip to fail them. */
    expect(COMPETITIONS.length,
      "a competition joined LIVE_COMPETITIONS without this count moving; "
      + "check every guard that walks the registry before changing it")
      .toBe(LIVE_COMPETITION_COUNT);

    await open(page, COMPETITIONS[0], 503);
    for (const comp of COMPETITIONS) {
      await expect(chipFor(page, comp)).toHaveCount(1);
      await expect(chipFor(page, comp)).toHaveAccessibleName(comp.label);
    }
    // and no chip beyond them: the rail is the registry rendered, not a
    // place literals accumulate
    await expect(page.locator("nav a[data-soon]"))
      .toHaveCount(COMPETITIONS.length);
  });

// ─────────────────────── every property, once per registry competition

for (const comp of COMPETITIONS) {
  test.describe(`${comp.label} (${comp.key})`, () => {

    // ─────────────────────────────────────── 1: derived from fixtures

    test("a fixture TODAY lights the chip, and the chip says which day",
      async ({ page }) => {
        await open(page, comp, feed(comp.key, TODAY));
        const c = chipFor(page, comp);
        await expect(c).toHaveAttribute("data-soon", "soon");
        await expect(c).toHaveAccessibleName(/a match today/);
      });

    test("a fixture TOMORROW lights it too — 'the next day' is in the rule",
      async ({ page }) => {
        await open(page, comp, feed(comp.key, TOMORROW));
        const c = chipFor(page, comp);
        await expect(c).toHaveAttribute("data-soon", "soon");
        await expect(c).toHaveAccessibleName(/a match tomorrow/);
      });

    test("both days at once are named as both, and the count is not "
       + "smuggled in", async ({ page }) => {
        await open(page, comp, feed(comp.key, TODAY, TODAY, TOMORROW));
        const c = chipFor(page, comp);
        await expect(c).toHaveAttribute("data-soon", "soon");
        await expect(c).toHaveAccessibleName(/matches today and tomorrow/);
        // it says WHICH DAYS, never how many — a tally invites a reader
        // to rank two competitions by it, which is a judgement off a
        // fixture list
        await expect(c).not.toHaveAccessibleName(/\d/);
      });

    test("a fixture FOUR DAYS out does not light it — the window is two "
       + "days, not 'soon'", async ({ page }) => {
        /* THE SAME CHIP, THE SAME SLUG, THE SAME CODE. Only the fixture
           times differ from the test above, which is what makes this a
           derivation rather than a hardcoded date or a `slug === "ucl"`
           — and running it per registry entry is what makes that claim
           checkable instead of asserted. */
        await open(page, comp, feed(comp.key, LATER));
        await expect(await settled(page, comp))
          .toHaveAttribute("data-soon", "none");
      });

    test("a competition with NO fixtures at all does not light it",
      async ({ page }) => {
        await open(page, comp, feed(comp.key));
        await expect(await settled(page, comp))
          .toHaveAttribute("data-soon", "none");
      });

    // ───────────────────────────────────── 2: missing is never zero

    test("a read that FAILED is an ordinary chip, not a chip saying "
       + "nothing is on", async ({ page }) => {
        /* A dimmed chip after a dead request would be an empty slate
           claimed off an answer nobody received — the same defect as
           "0 fixtures" over a competition the board never ranked, one
           surface up. The chip degrades to exactly what it is when
           nothing is known: a link with its own name and no assertion
           attached to it. */
        await open(page, comp, 503);
        const c = await settled(page, comp);
        await expect(c).toHaveAccessibleName(comp.label);
        // and NOTHING anywhere says there is no match — the absence of a
        // claim, not a claim of absence
        await expect(page.getByText(/no match/i)).toHaveCount(0);
        await expect(page.getByText(/nothing (on|soon|today)/i))
          .toHaveCount(0);

        /* THE PART NO SCREENSHOT COULD EVER CATCH. A failed read and a
           measured empty window are the SAME unlit chip on screen,
           forever — so if the failure were quietly folded into "none",
           nothing visible would ever go wrong and nothing visible could
           ever say so. The state is in the markup for exactly this: it
           must read UNKNOWN, and it must not read NONE.
           Compare with the two tests above, which assert "none" off
           feeds that really were read and really were empty. */
        await expect(c).toHaveAttribute("data-soon", "unknown");
        await expect(c).not.toHaveAttribute("data-soon", "none");
      });

    test("a 404 is the same as any other failure — an absent route is "
       + "not an empty slate", async ({ page }) => {
        /* THE STATUS THIS COMPETITION ACTUALLY GOT. On 2026-09-15
           /api/comp/eflcup/fixtures answered `404 unknown competition`
           on every page load, because the route resolved through the
           competition VIEWERS and the EFL Cup deliberately has none.
           The backend now serves a SCHEDULE for it — see
           components/CompRail — and this stays, because a 404 is what a
           competition gets on the day before its route exists and it
           must never be the day its chip claims nothing is on. */
        await open(page, comp, 404);
        const c = await settled(page, comp);
        await expect(c).toHaveAttribute("data-soon", "unknown");
        await expect(c).toHaveAccessibleName(comp.label);
      });

    test("a 200 that is not a fixture list is the same as a failure",
      async ({ page }) => {
        /* A payload whose shape changed, or a refusal served at 200, is
           a read that did not answer the question. It must not arrive as
           a confident "nothing on". */
        await open(page, comp, { detail: "not served" });
        const c = await settled(page, comp);
        await expect(c).toHaveAttribute("data-soon", "unknown");
        await expect(c).toHaveAccessibleName(comp.label);
      });

    // ────────────────────────────── 3: it says WHEN, not whether

    test("the lit chip's whole vocabulary is a day — no urgency, no advice",
      async ({ page }) => {
        await open(page, comp, feed(comp.key, TODAY, TOMORROW));
        const c = chipFor(page, comp);
        await expect(c).toHaveAttribute("data-soon", "soon");
        const said = ((await c.getAttribute("title")) ?? "")
          + " " + ((await c.textContent()) ?? "");
        /* The backend's own forbidden list, plus the words a "soon"
           badge reaches for when nobody is watching. The rule is IT
           SHOWS; IT DOES NOT DECIDE, and a three-word chip is where that
           slips first. */
        for (const banned of [
          /you should/i, /cash out/i, /sell now/i, /buy/i, /bet/i,
          /don'?t miss/i, /hurry/i, /act now/i, /last chance/i,
          /value/i, /edge/i, /opportunity/i, /!/,
        ]) {
          expect(said, `the chip says something it must not: ${banned}`)
            .not.toMatch(banned);
        }
        expect(said).toMatch(/today|tomorrow/i);
      });

    // ─────────────────── 4: wayfinding, never the traffic light

    test("the glow is this competition's own league hue — not gold, not "
       + "up/warn/neg, and not another competition's", async ({ page }) => {
        await open(page, comp, feed(comp.key, TODAY));
        const c = chipFor(page, comp);
        await expect(c).toHaveAttribute("data-soon", "soon");

        /* READ OFF THE PAINT. A class-name check would pass on a rule
           that resolved to gold; two token names resolving to one colour
           is exactly the failure this asserts against, and it is the
           same method e2e/nothing-ahead-is-not-nothing uses for the
           column rails.

           THE TOKEN NAMES COME FROM THE REGISTRY, never from `--lg-` +
           slug. A concatenated custom property resolves to nothing at
           all when a competition's token is not spelled that way, and an
           unresolved `var()` reads as the inherited ink — which is a
           test that passes while the pill on screen has no colour. That
           shipped once on 2026-09-15. */
        const tokens = await page.evaluate((names) => {
          const probe = document.createElement("span");
          document.body.appendChild(probe);
          const read = (name: string) => {
            probe.style.color = `var(${name})`;
            return getComputedStyle(probe).color;
          };
          const out: Record<string, string> = {
            accent: read("--accent"), up: read("--up"),
            warn: read("--warn"), neg: read("--neg"), live: read("--live"),
            cup: read("--lg-cup"),
          };
          for (const [key, hue] of names) out[`comp:${key}`] = read(hue);
          probe.remove();
          return out;
        }, COMPETITIONS.map((x) => [x.key, x.hue] as const));

        /* A SETTLED READ, not the first one. The chip carries the rail's
           ordinary `transition-colors`, and the glow arrives when the
           fetch does — so a colour read straight after `data-soon`
           appears faithfully describes a blend that is on screen for
           150ms and is neither the resting ink nor the competition's
           hue. Measured once as rgb(129,111,132): a third colour, and a
           red test about nothing. Two consecutive agreeing reads is the
           same pattern the layout specs use for boxes. */
        const paint = () => c.evaluate((el) => getComputedStyle(el).color);
        let painted = await paint();
        for (let i = 0; i < 40; i++) {
          await page.waitForTimeout(50);
          const next = await paint();
          if (next === painted) break;
          painted = next;
        }

        expect(painted, "the glow is not this competition's own light")
          .toBe(tokens[`comp:${comp.key}`]);
        for (const [name, hue] of Object.entries(tokens)) {
          if (name === `comp:${comp.key}`) continue;
          expect(painted,
            name.startsWith("comp:")
              ? `the glow is ${name.slice(5)}'s light, so two chips are `
                + "one colour and the hue way-finds nothing"
              : `the glow borrowed --${name}, which is a verdict`)
            .not.toBe(hue);
        }
        // and it really is glowing rather than merely tinted
        const shadow = await c.evaluate(
          (el) => getComputedStyle(el).boxShadow);
        expect(shadow).not.toBe("none");
      });

    test("the glow is not clipped away by the rail it sits in",
      async ({ page }) => {
        /* THE DEFECT THIS EXISTS FOR, measured 2026-09-09 before it
           shipped. The chip rail is `overflow-x: auto` so it can scroll
           on a phone, and CSS turns the other axis into `auto` with it —
           which made the nav a clipping box EXACTLY one chip tall, 0px
           of headroom above and below. An outer-only glow was sliced off
           on the sides that matter, worst on the LAST CHIP IN THE RAIL,
           and the emphasis the operator asked for existed only in the
           stylesheet. A colour assertion cannot see this: the computed
           style was perfect the whole time.
           "Worst on the last chip" is why this runs per competition: the
           rail has more than one chip now, and the one most exposed to
           it is whichever is last today.
           TWO PROPERTIES, EITHER OF WHICH ALONE WOULD SURVIVE IT: the
           rail gives the chip real headroom, and the light is drawn
           INSIDE the chip as well as around it, where nothing can ever
           clip it. */
        await open(page, comp, feed(comp.key, TODAY));
        const c = chipFor(page, comp);
        await expect(c).toHaveAttribute("data-soon", "soon");

        const geom = await c.evaluate((el) => {
          const nav = el.closest("nav")!;
          const cb = el.getBoundingClientRect();
          const nb = nav.getBoundingClientRect();
          return {
            above: cb.top - nb.top, below: nb.bottom - cb.bottom,
            shadow: getComputedStyle(el).boxShadow,
          };
        });
        expect(geom.above, "no room above the chip for its glow")
          .toBeGreaterThan(4);
        expect(geom.below, "no room below the chip for its glow")
          .toBeGreaterThan(4);
        expect(geom.shadow,
          "the glow is drawn only outside the chip, where the rail clips it")
          .toContain("inset");
      });

    // ───────────────────────────────────────── 5: it does not move

    test("the glow is static — there is no animation for reduced motion "
       + "to reduce", async ({ page }) => {
        await open(page, comp, feed(comp.key, TODAY));
        const c = chipFor(page, comp);
        await expect(c).toHaveAttribute("data-soon", "soon");
        const motion = await c.evaluate((el) => {
          const s = getComputedStyle(el);
          return { animation: s.animationName,
                   transition: s.transitionProperty };
        });
        expect(motion.animation).toBe("none");
        // the resting chip's colour transition is inherited chrome and is
        // fine; nothing here loops
        expect(motion.transition).not.toMatch(/box-shadow/);
      });

    // ────────────────────────── 6: the fact survives without colour

    test("the day is in the accessible name, not only in the hue",
      async ({ page }) => {
        /* A fact carried by a colour alone is a fact some readers never
           get, and forced-colors mode discards every custom colour on
           the page. */
        await open(page, comp, feed(comp.key, TOMORROW));
        const c = chipFor(page, comp);
        await expect(c).toHaveAccessibleName(
          new RegExp(`${comp.label}.*a match tomorrow`, "s"));
        // the dot is decoration and says so, or it would be read aloud as
        // an unnamed image between the name and the day
        const dot = c.locator("i.chip-soon-dot");
        await expect(dot).toHaveCount(1);
        await expect(dot).toHaveAttribute("aria-hidden", "true");
      });

    // ─────────────────────────── 7: every page that draws the rail

    for (const where of RAIL_PAGES) {
      test(`the chip on ${where} glows by the same rule`,
        async ({ page }) => {
          /* The rail used to be the same literal typed into two pages.
             It is one component now (components/CompRail.tsx) and this
             is the guard that keeps it one: a glow that reached only the
             board would be a second rail growing back.

             THE PAGE LIST IS DERIVED TOO — the two standalone surfaces
             that import the rail, plus every competition's own page,
             which draws it because it IS the board narrowed to one
             column. A competition page whose rail had gone missing would
             be a chip you cannot reach from the competition beside it. */
          await open(page, comp, feed(comp.key, TODAY), where);
          const c = chipFor(page, comp);
          await expect(c).toHaveAttribute("data-soon", "soon");
          await expect(c).toHaveAccessibleName(/a match today/);
        });
    }

    test("...and it is unlit on the board when nothing is in the window",
      async ({ page }) => {
        await open(page, comp, feed(comp.key, LATER),
                   "/bet-suggester/leagues");
        await expect(await settled(page, comp))
          .toHaveAttribute("data-soon", "none");
      });
  });
}
