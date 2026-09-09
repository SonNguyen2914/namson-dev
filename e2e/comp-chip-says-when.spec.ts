import { expect, test } from "@playwright/test";

// THE NAV CHIP THAT GLOWS WHEN A COMPETITION PLAYS TODAY OR TOMORROW.
//
// "remove UCL from the landing page, we have it in its own cup page is
// enough. When a match of that competition is today or the next day,
// make its box glow" (operator, 2026-09-09). The first half took the
// Champions League off the picker board; this file is the second half.
//
// WHAT IS PINNED, and why each is a property rather than a pixel:
//
//  1. IT IS DERIVED FROM FIXTURES. The same chip, the same slug and the
//     same code path glow or do not glow purely on what the competition's
//     fixture feed says — today, tomorrow, later, none. Nothing here
//     knows what a Champions League is.
//  2. MISSING IS NEVER ZERO. A read that did not land is not "no match
//     soon": a failed fetch leaves an ORDINARY chip that asserts nothing,
//     rather than a chip claiming an empty slate off a request that never
//     answered.
//  3. IT SAYS WHEN, NOT WHETHER. The whole vocabulary is a day. The
//     backend pins the same rule in words (tests/test_position.py:230
//     forbids "you should" / "cash out now" / "sell now") and the spirit
//     of it reaches any label this app adds: nothing here may read as a
//     recommendation, an urgency or a claim about value.
//  4. IT IS WAYFINDING, NOT A VERDICT. It is lit in the competition's own
//     league hue. Gold is the BRAND and up/warn/neg are the traffic
//     light; a chip glowing in either would be telling the operator a
//     fixture is good, bad or urgent, which is a judgement this surface
//     does not hold. Read off the PAINTED colour, not the class name.
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

const feed = (...days: string[]) => ({
  competition: "ucl", display: "UEFA Champions League",
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

/** `comp` is the fixture feed, or a status code to fail it with. */
async function open(
  page: import("@playwright/test").Page,
  comp: unknown | number,
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
  await page.route("**/api/comp/ucl/fixtures**", (r) =>
    typeof comp === "number"
      ? r.fulfill(json({ detail: "upstream unavailable" }, comp))
      : r.fulfill(json(comp)));
  await page.goto(where);
}

const chip = (page: import("@playwright/test").Page) =>
  page.locator('a[href="/bet-suggester/ucl"]').first();

/** The chip, once the read behind it has had its chance. Every
 *  unlit assertion goes through this: `data-soon` starts at "unknown"
 *  on the first paint by construction, so reading it straight after
 *  `goto` would confirm the not-yet-landed state and call it the
 *  answer. */
async function settled(page: import("@playwright/test").Page) {
  const c = chip(page);
  await expect(c).toBeVisible();
  await page.waitForLoadState("networkidle");
  return c;
}

// ─────────────────────────────────────────── 1: derived from fixtures

test("a fixture TODAY lights the chip, and the chip says which day",
  async ({ page }) => {
    await open(page, feed(TODAY));
    const c = chip(page);
    await expect(c).toHaveAttribute("data-soon", "soon");
    await expect(c).toHaveAccessibleName(/a match today/);
  });

test("a fixture TOMORROW lights it too — 'the next day' is in the rule",
  async ({ page }) => {
    await open(page, feed(TOMORROW));
    const c = chip(page);
    await expect(c).toHaveAttribute("data-soon", "soon");
    await expect(c).toHaveAccessibleName(/a match tomorrow/);
  });

test("both days at once are named as both, and the count is not smuggled in",
  async ({ page }) => {
    await open(page, feed(TODAY, TODAY, TOMORROW));
    const c = chip(page);
    await expect(c).toHaveAttribute("data-soon", "soon");
    await expect(c).toHaveAccessibleName(/matches today and tomorrow/);
    // it says WHICH DAYS, never how many — a tally invites a reader to
    // rank two competitions by it, which is a judgement off a fixture
    // list
    await expect(c).not.toHaveAccessibleName(/\d/);
  });

test("a fixture FOUR DAYS out does not light it — the window is two days, not 'soon'",
  async ({ page }) => {
    /* THE SAME CHIP, THE SAME SLUG, THE SAME CODE. Only the fixture
       times differ from the test above, which is what makes this a
       derivation rather than a hardcoded date or a `slug === "ucl"`. */
    await open(page, feed(LATER));
    await expect(await settled(page)).toHaveAttribute("data-soon", "none");
  });

test("a competition with NO fixtures at all does not light it",
  async ({ page }) => {
    await open(page, feed());
    await expect(await settled(page)).toHaveAttribute("data-soon", "none");
  });

// ───────────────────────────────────────── 2: missing is never zero

test("a read that FAILED is an ordinary chip, not a chip saying nothing is on",
  async ({ page }) => {
    /* A dimmed chip after a dead request would be an empty slate claimed
       off an answer nobody received — the same defect as "0 fixtures"
       over a competition the board never ranked, one surface up. The
       chip degrades to exactly what it is when nothing is known: a link
       with its own name and no assertion attached to it. */
    await open(page, 503);
    const c = await settled(page);
    await expect(c).toHaveAccessibleName("UCL");
    // and NOTHING anywhere says there is no match — the absence of a
    // claim, not a claim of absence
    await expect(page.getByText(/no match/i)).toHaveCount(0);
    await expect(page.getByText(/nothing (on|soon|today)/i)).toHaveCount(0);

    /* THE PART NO SCREENSHOT COULD EVER CATCH. A failed read and a
       measured empty window are the SAME unlit chip on screen, forever
       — so if the failure were quietly folded into "none", nothing
       visible would ever go wrong and nothing visible could ever say
       so. The state is in the markup for exactly this: it must read
       UNKNOWN, and it must not read NONE.
       Compare with the two tests above, which assert "none" off feeds
       that really were read and really were empty. */
    await expect(c).toHaveAttribute("data-soon", "unknown");
    await expect(c).not.toHaveAttribute("data-soon", "none");
  });

test("a 200 that is not a fixture list is the same as a failure",
  async ({ page }) => {
    /* A payload whose shape changed, or a refusal served at 200, is a
       read that did not answer the question. It must not arrive as a
       confident "nothing on". */
    await open(page, { detail: "not served" });
    const c = await settled(page);
    await expect(c).toHaveAttribute("data-soon", "unknown");
    await expect(c).toHaveAccessibleName("UCL");
  });

// ────────────────────────────────────── 3: it says WHEN, not whether

test("the lit chip's whole vocabulary is a day — no urgency, no advice",
  async ({ page }) => {
    await open(page, feed(TODAY, TOMORROW));
    const c = chip(page);
    await expect(c).toHaveAttribute("data-soon", "soon");
    const said = ((await c.getAttribute("title")) ?? "")
      + " " + ((await c.textContent()) ?? "");
    /* The backend's own forbidden list, plus the words a "soon" badge
       reaches for when nobody is watching. The rule is IT SHOWS; IT DOES
       NOT DECIDE, and a three-word chip is where that slips first. */
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

// ─────────────────────────────── 4: wayfinding, never the traffic light

test("the glow is the competition's own league hue — not gold, not up/warn/neg",
  async ({ page }) => {
    await open(page, feed(TODAY));
    const c = chip(page);
    await expect(c).toHaveAttribute("data-soon", "soon");

    /* READ OFF THE PAINT. A class-name check would pass on a rule that
       resolved to gold; two token names resolving to one colour is
       exactly the failure this asserts against, and it is the same
       method e2e/nothing-ahead-is-not-nothing uses for the column
       rails. */
    const tokens = await page.evaluate(() => {
      const probe = document.createElement("span");
      document.body.appendChild(probe);
      const read = (name: string) => {
        probe.style.color = `var(${name})`;
        return getComputedStyle(probe).color;
      };
      const out = {
        ucl: read("--lg-ucl"), accent: read("--accent"),
        up: read("--up"), warn: read("--warn"), neg: read("--neg"),
        live: read("--live"),
      };
      probe.remove();
      return out;
    });
    /* A SETTLED READ, not the first one. The chip carries the rail's
       ordinary `transition-colors`, and the glow arrives when the fetch
       does — so a colour read straight after `data-soon` appears
       faithfully describes a blend that is on screen for 150ms and is
       neither the resting ink nor the competition's hue. Measured once
       as rgb(129,111,132): a third colour, and a red test about nothing.
       Two consecutive agreeing reads is the same pattern the layout
       specs use for boxes. */
    const paint = () => c.evaluate((el) => getComputedStyle(el).color);
    let painted = await paint();
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(50);
      const next = await paint();
      if (next === painted) break;
      painted = next;
    }

    expect(painted, "the glow is not the competition's own light")
      .toBe(tokens.ucl);
    for (const [name, hue] of Object.entries(tokens)) {
      if (name === "ucl") continue;
      expect(painted, `the glow borrowed --${name}, which is a verdict`)
        .not.toBe(hue);
    }
    // and it really is glowing rather than merely tinted
    const shadow = await c.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe("none");
  });

test("the glow is not clipped away by the rail it sits in",
  async ({ page }) => {
    /* THE DEFECT THIS EXISTS FOR, measured 2026-09-09 before it shipped.
       The chip rail is `overflow-x: auto` so it can scroll on a phone,
       and CSS turns the other axis into `auto` with it — which made the
       nav a clipping box EXACTLY one chip tall, 0px of headroom above
       and below. An outer-only glow was sliced off on the sides that
       matter, worst on the last chip in the rail, and the emphasis the
       operator asked for existed only in the stylesheet. A colour
       assertion cannot see this: the computed style was perfect the
       whole time.
       TWO PROPERTIES, EITHER OF WHICH ALONE WOULD SURVIVE IT: the rail
       gives the chip real headroom, and the light is drawn INSIDE the
       chip as well as around it, where nothing can ever clip it. */
    await open(page, feed(TODAY));
    const c = chip(page);
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

// ───────────────────────────────────────────────── 5: it does not move

test("the glow is static — there is no animation for reduced motion to reduce",
  async ({ page }) => {
    await open(page, feed(TODAY));
    const c = chip(page);
    await expect(c).toHaveAttribute("data-soon", "soon");
    const motion = await c.evaluate((el) => {
      const s = getComputedStyle(el);
      return { animation: s.animationName, transition: s.transitionProperty };
    });
    expect(motion.animation).toBe("none");
    // the resting chip's colour transition is inherited chrome and is
    // fine; nothing here loops
    expect(motion.transition).not.toMatch(/box-shadow/);
  });

// ────────────────────────────────── 6: the fact survives without colour

test("the day is in the accessible name, not only in the hue",
  async ({ page }) => {
    /* A fact carried by a colour alone is a fact some readers never get,
       and forced-colors mode discards every custom colour on the page. */
    await open(page, feed(TOMORROW));
    const c = chip(page);
    await expect(c).toHaveAccessibleName(/UCL.*a match tomorrow/s);
    // the dot is decoration and says so, or it would be read aloud as
    // an unnamed image between the name and the day
    const dot = c.locator("i.chip-soon-dot");
    await expect(dot).toHaveCount(1);
    await expect(dot).toHaveAttribute("aria-hidden", "true");
  });

// ─────────────────────────────────── 7: every page that draws the rail

test("the chip on /bet-suggester/leagues glows by the same rule",
  async ({ page }) => {
    /* The rail used to be the same literal typed into two pages. It is
       one component now (components/CompRail.tsx) and this is the guard
       that keeps it one: a glow that reached only the board would be a
       second rail growing back. */
    await open(page, feed(TODAY), "/bet-suggester/leagues");
    const c = chip(page);
    await expect(c).toHaveAttribute("data-soon", "soon");
    await expect(c).toHaveAccessibleName(/a match today/);
  });

test("...and it is unlit there too when nothing is in the window",
  async ({ page }) => {
    await open(page, feed(LATER), "/bet-suggester/leagues");
    await expect(await settled(page)).toHaveAttribute("data-soon", "none");
  });
