import { RefObject, useEffect, useRef } from "react";

import { leagueLabel } from "../lib/pickerApi";
import { hueOf } from "./PickerColumn";

/** THE HEADER FOR A BOARD THAT CARRIES MORE COLUMNS THAN IT DRAWS,
 *  AND THE LOOP UNDERNEATH IT (operator, 2026-09-15).
 *
 *  WHY IT EXISTS. Card width is arithmetic, not taste: the board's track
 *  is `max-w-[96rem]`, so a card STOPS GROWING at 1536px and a wider
 *  monitor renders the identical one. Measured on the live board — four
 *  columns 356px and the club name intact; five 280px and the name
 *  truncated but readable; six 229px and 20px of name left; seven 193px
 *  and the name at ZERO. Eight leagues cannot sit side by side at any
 *  width. Four is the number, and the eight are carried by moving
 *  through them.
 *
 *  ── WHAT MOVED, AND WHY (2026-09-15, the approved draft) ────────────
 *
 *  The first shipped cut had NO BOARD MOTION AT ALL: four columns were
 *  rendered, an integer `windowStart` swapped all four of them at once,
 *  and the names scrambled beside a board that had not moved. The draft
 *  the operator approved does the opposite — the board is a REAL
 *  `overflow-x` scroller carrying every declared column, and the four in
 *  front of you are a SCROLL POSITION rather than a render decision.
 *
 *  THE LOOP IS NODE ROTATION, NOT CLONES. `order` is the columns in
 *  track order; `rotL` moves the head to the tail and subtracts exactly
 *  one column width from `scrollLeft`, so every column under the cursor
 *  stays exactly where it was and the scroller can never reach an end.
 *  `spins` counts those turns, and that is what makes
 *
 *      absPos() = spins + scrollLeft / oneW() - REST
 *
 *  a REAL-VALUED position across the whole loop rather than an integer —
 *  the thing the first cut did not have. It juddered because it animated
 *  on DISCRETE position changes while the board scrolled CONTINUOUSLY: a
 *  slide would start, the scroll would move again, and the guard against
 *  overlap made the ribbon skip or lag.
 *
 *  THE LIT FOUR NEVER MOVE. The rail is SLOTS fixed slots and slots
 *  LIT_FROM..LIT_FROM+VIEW-1 are, by construction, the four columns on
 *  screen — lit because of where they sit, not because of which league
 *  they hold. What travels is the content.
 *
 *  AND EVERY LEAGUE KEEPS A PILL whether it is on screen or not — which
 *  is also the wayfinding, because whichever dim pill sits beside the lit
 *  block is what arrives if you keep going that way.
 *
 *  THE TWO BUFFER SLOTS. The strip is one slot wider than the board at
 *  each end and parked at `translateX(-unit)`, so there is somewhere to
 *  slide FROM and somewhere to slide TO. Those two carry a league that is
 *  already named by a visible slot, so they are `aria-hidden` scaffolding
 *  and not pills: a tablist with a duplicate tab in it would be lying to
 *  a screen reader about how many leagues there are.
 */

/** How many columns are drawn at once. Measured, not chosen — see above. */
export const VIEW = 4;
/** HOW MANY COLUMNS REST TO THE LEFT of the four on screen.
 *
 *  The scroller lives in a band `REST ± 1` columns wide and a rotation
 *  rebases it back into that band, which is why it never reaches either
 *  end. That only works while there is a column of SLACK on each side,
 *  so this is derived from the board rather than typed: the draft's own
 *  `REST = 2` is what eight columns give, and six give one — a board
 *  with `REST = 2` and only two columns of slack rests AGAINST its right
 *  end, where the rotation that carries it round can never fire. */
const restFor = (n: number) => Math.max(0, Math.min(2, n - VIEW - 1));
/** A LOOP NEEDS SLACK ON BOTH SIDES. Five columns give one column of
 *  scroll room in total: whichever end it is put at, the other has none,
 *  and a rotation there would be a jump rather than a seam. Such a board
 *  is a plainly bounded scroller and the rail is its position. */
const loops = (n: number) => n - VIEW >= 2;
/** The gap between two pills, px. */
const RGAP = 6;
/** The gap between two COLUMNS, px — Tailwind `gap-6` on the track. A
 *  column's width is arithmetic off this, so the two must agree; a
 *  changed gap class with this left behind puts every column half a
 *  gutter out of true. */
const GAP = 24;

/** The churn a cell shows while it is unrevealed. Letters, digits and
 *  punctuation together — a letters-only churn reads as a word being
 *  typed, which is the one thing this is not. */
const CHURN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-%$.,/#&*+=<>?@";
const CHURN_MS = 1000 / 13;
const REVEAL_MS = 430;
const STAGGER_MS = 26;
/** Never strand the optimistic guard: a step that the scroll never
 *  finishes delivering must not leave the ribbon deaf to the next one. */
const ARM_MS = 900;

const rnd = () => CHURN.charAt(Math.floor(Math.random() * CHURN.length));

const wrap = (x: number, n: number) => ((x % n) + n) % n;

/** THE STRIP ITSELF — slots and nothing else.
 *
 *  React renders the SHAPE and never the content: no `data-slug`, no
 *  name, no ink. Everything a step changes is written by the loop below,
 *  imperatively, because the board scrolls continuously and a render per
 *  frame is exactly the judder this rewrite exists to remove. It also
 *  means a re-render of the page — a matchday sort, a field landing —
 *  cannot clobber a reveal that is halfway through: React has no opinion
 *  about attributes it never set.
 *
 *  The two ends are BUFFERS (see the header): scaffolding, not pills. */
export function LeagueRibbon({ slugs, view, stripRef }: {
  /** every declared column, in the operator's order */
  slugs: readonly string[];
  /** how many are on screen at once */
  view: number;
  /** the translated strip, handed to `useBoardLoop` */
  stripRef: RefObject<HTMLDivElement | null>;
}) {
  const slots = slugs.length + 2;
  return (
    /* The window the strip slides inside — what makes the buffers
       buffers. CLIP, NOT HIDDEN, on both counts: `overflow: hidden`
       creates a scroll container in BOTH axes (the same trap the board's
       own track pays for below), and what is out of sight here is a
       DUPLICATE of a league a visible pill already names, so nothing a
       reader needs is being quietly cut off. */
    <div data-testid="league-ribbon-window"
      className="w-full overflow-clip">
      <div ref={stripRef} data-testid="league-ribbon" role="tablist"
        aria-label={`leagues, in strength order — ${view} on screen`}
        style={{ ["--rgap" as string]: `${RGAP}px` }}
        className="flex w-max gap-[var(--rgap)] will-change-transform">
        {Array.from({ length: slots }, (_, i) => {
          const buffer = i === 0 || i === slots - 1;
          return (
            /* THE KEY IS THE SLOT, NOT THE LEAGUE, and the whole effect
               turns on it. Keyed by slug, React reconciles a rotation by
               MOVING each pill's DOM node to its new position and
               carrying its text along — so the ribbon slid sideways,
               which is the opposite of the design: the slots hold still
               while their NAMES change in place. */
            <button key={i} type="button"
              {...(buffer
                ? { "aria-hidden": true, tabIndex: -1,
                    "data-testid": "ribbon-buffer" }
                : { role: "tab", "data-testid": "ribbon-pill" })}
              className="flex w-[var(--slot)] min-w-0 flex-none items-center justify-center gap-2 rounded-lg border border-line bg-bs-elev2 px-2.5 py-2 font-mono text-[10px] uppercase leading-tight tracking-[0.08em] text-ink-faint transition-colors hover:border-ink-faint">
              <i aria-hidden
                className="h-2 w-2 flex-none rounded-full transition-opacity" />
              <span data-testid="ribbon-name"
                className="min-w-0 truncate whitespace-pre" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** The resolved ink for a slug. `hueOf` answers in the column's own
 *  vocabulary — `var(--lg-mls)`, or `var(--lg-cup)` for a competition the
 *  palette does not name — and a transition needs two REAL colours, not a
 *  custom property that changed. So the expression is painted onto a
 *  probe and read back, which resolves whatever `hueOf` said without this
 *  file keeping a second copy of the palette. */
function resolveHues(slugs: readonly string[]): Record<string, string> {
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  const out: Record<string, string> = {};
  for (const s of slugs) {
    probe.style.color = "";
    probe.style.color = hueOf(s);
    out[s] = getComputedStyle(probe).color;
  }
  document.body.removeChild(probe);
  return out;
}

/** THE LOOP. Owns the track's geometry, its rotation, and the ribbon it
 *  drives. Everything here is imperative and lives outside React's
 *  render for one reason: the layout change and the `scrollLeft` rebase
 *  that cancels it out MUST happen in the same frame, and a state update
 *  is a frame late — which is a visible jump of one whole column. */
export function useBoardLoop({ trackRef, stripRef, slugs, enabled }: {
  trackRef: RefObject<HTMLDivElement | null>;
  stripRef: RefObject<HTMLDivElement | null>;
  slugs: readonly string[];
  enabled: boolean;
}): void {
  const key = slugs.join(",");
  /** Re-seat the grid after ANY commit. React writes `--col` from the
   *  column's DOM position and the loop overwrites it with the ROTATED
   *  one; React skips a style property whose value has not changed
   *  between renders, so in practice it never fights back — but "in
   *  practice" is not a guarantee, and a single column left on its
   *  render-time track is a duplicated column and a hole. */
  const reseat = useRef<() => void>(() => {});

  useEffect(() => {
    const track = trackRef.current;
    const strip = stripRef.current;
    if (!enabled || !track || !strip) return;

    const ORDER = key.split(",");
    const N = ORDER.length;
    /* At VIEW columns or fewer the board shows everything it has: no
       ribbon is built and there is nothing here to drive. */
    if (N <= VIEW) return;
    const SLACK = N - VIEW;
    const LOOPS = loops(N);
    const REST = restFor(N);
    /** The first LIT slot. Derived, never typed: slot k carries
     *  `ORDER[i - REST - 1 + k]`, so the slot holding the leftmost column
     *  on screen is the one where that expression is `i`. */
    const LIT_FROM = REST + 1;

    const cols = new Map<string, HTMLElement>();
    for (const el of Array.from(track.querySelectorAll<HTMLElement>(
      '[data-testid="league-col"][data-league]'))) {
      cols.set(el.dataset.league!, el);
    }
    /* Every declared column must be ON the track or the rotation is
       addressing a board that is not there. */
    if (ORDER.some((s) => !cols.has(s))) return;

    const pills = Array.from(strip.children) as HTMLElement[];
    const SLOTS = pills.length;
    const HUE = resolveHues(ORDER);
    const root = getComputedStyle(document.documentElement);
    const NEUTRAL = root.getPropertyValue("--line").trim();
    const FAINT = root.getPropertyValue("--ink-faint").trim();
    const HI = root.getPropertyValue("--ink-hi").trim();
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)");

    const order = ORDER.slice();
    let spins = 0;
    let shown: number | null = null;
    let armed: number | null = null;
    let tok = 0;
    let raf: number | null = null;
    let ticking = false;
    let dead = false;

    // ── geometry ───────────────────────────────────────────────────────
    const colW = () => (track.clientWidth - GAP * (VIEW - 1)) / VIEW;
    const oneW = () => colW() + GAP;
    /** Is the track genuinely a horizontal scroller? Below `xl` the
     *  columns stack and it is not — the rail is then a jump nav, and
     *  saying otherwise would light four columns that are not "on
     *  screen" in any sense a reader would recognise. */
    const rolling = () => track.scrollWidth - track.clientWidth > 4;
    /** The bounded scroller's resting offset for a leftmost column `i`. */
    const seatFor = (i: number) =>
      Math.max(0, Math.min(SLACK, i)) * oneW();

    const layout = () => {
      track.style.setProperty("--cols", String(N));
      track.style.setProperty("--colw", `${colW()}px`);
      /* what the matchday rail sticks to, so a date stays legible over
         whichever four columns you have scrolled to */
      track.style.setProperty("--vieww", `${track.clientWidth}px`);
      order.forEach((slug, i) =>
        cols.get(slug)!.style.setProperty("--col", String(i + 1)));
    };
    reseat.current = () => { if (!dead) layout(); };

    /* THE LOOP. No clones: the array turns and the scroll is compensated
       by exactly one column, so nothing under the cursor moves. */
    const rotL = () => {
      order.push(order.shift()!); layout();
      track.scrollLeft -= oneW(); spins += 1;
    };
    const rotR = () => {
      order.unshift(order.pop()!); layout();
      track.scrollLeft += oneW(); spins -= 1;
    };
    /* WHERE THE BOARD IS, as a real number of columns from the start of
       the declared order. Three cases and one meaning: looped, the scroll
       offset plus the turns it has taken; bounded, the scroll offset
       alone; stacked — below xl, where the columns are one above another
       and nothing scrolls sideways — the rail's own jump position. */
    const absPos = () =>
      !rolling() ? spins
      : LOOPS ? spins + track.scrollLeft / oneW() - REST
      : track.scrollLeft / oneW();

    // ── the ribbon ─────────────────────────────────────────────────────
    const unit = () => {
      const w = (strip.parentElement as HTMLElement).clientWidth;
      const slot = (w - RGAP * (N - 1)) / N;
      strip.style.setProperty("--slot", `${slot}px`);
      return slot + RGAP;
    };
    const setStrip = (px: number) => {
      strip.style.transform = `translateX(${px}px)`;
    };
    const lit = (k: number) => k >= LIT_FROM && k < LIT_FROM + VIEW;
    const slugAt = (target: number, k: number) =>
      ORDER[wrap(target - REST - 1 + k, N)];

    const dot = (b: HTMLElement) => b.firstElementChild as HTMLElement;
    const name = (b: HTMLElement) => b.lastElementChild as HTMLElement;

    /** Everything about a pill EXCEPT its letters: identity, ink and the
     *  accessible name, set together so a pill can never be lit for one
     *  league while it reads another. */
    const identify = (b: HTMLElement, slug: string, on: boolean) => {
      b.dataset.slug = slug;
      const label = leagueLabel(slug);
      if (b.dataset.testid !== "ribbon-buffer" && b.getAttribute("role") === "tab") {
        b.setAttribute("aria-selected", on ? "true" : "false");
      }
      b.setAttribute("aria-label", `${label}${on ? ", on screen" : ""}`);
      const n = cols.get(slug)!
        .querySelectorAll('[data-testid="picker-row"]').length;
      b.title = `${label} — ${n} fixture${n === 1 ? "" : "s"} on the board`;
      b.style.setProperty("--h", HUE[slug]);
      b.style.borderColor = on ? HUE[slug] : NEUTRAL;
      b.style.color = on ? HI : FAINT;
      const d = dot(b);
      d.style.backgroundColor = HUE[slug];
      d.style.opacity = on ? "1" : "0.3";
      d.style.boxShadow = on
        ? `0 0 0 3px color-mix(in srgb, ${HUE[slug]} 22%, transparent)` : "none";
    };

    /** The cells of one pill's name — the rolling glyphs, rebuilt only
     *  when the word changes length. Monospace is what makes the churn
     *  safe: every glyph is one width, so a cell rerolling cannot reflow
     *  the word or nudge its neighbours. */
    const cells = (b: HTMLElement, n: number) => {
      const nm = name(b);
      if (nm.children.length !== n) {
        nm.textContent = "";
        for (let i = 0; i < n; i++) {
          const c = document.createElement("i");
          c.style.display = "inline-block";
          c.style.width = "1ch";
          c.style.textAlign = "center";
          c.style.fontStyle = "normal";
          nm.appendChild(c);
        }
      }
      return Array.from(nm.children) as HTMLElement[];
    };

    /* Put a glyph in a cell. NO TRANSFORM, no entry: the character is
       replaced in place and the colour goes with it. A locked letter is
       told apart by LOSING the tint, not by moving — two earlier cuts had
       the glyphs travelling and both were wrong about the effect. */
    const put = (g: HTMLElement, ch: string, colour: string) => {
      if (g.textContent !== ch) g.textContent = ch;
      if (g.style.color !== colour) g.style.color = colour;
    };

    /** The settled state at `target`, with no motion at all. */
    const fill = (target: number) => {
      tok += 1;
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      pills.forEach((b, k) => {
        const slug = slugAt(target, k);
        identify(b, slug, lit(k));
        const text = leagueLabel(slug);
        const cs = cells(b, text.length);
        cs.forEach((g, i) => put(g, text.charAt(i), ""));
      });
    };

    /** RANDOM LETTER REVEAL — the operator's chosen motion.
     *
     *  Unrevealed cells churn through random glyphs and a reveal front
     *  crosses the word in RANDOM order, locking each cell to its true
     *  character as it passes. THE CHURN WEARS THE INCOMING LEAGUE'S INK,
     *  so what is scrambling in front of you is already the colour of the
     *  thing arriving.
     *
     *  `fwd` is the side the new leagues arrive from, and the wave starts
     *  there and runs across WITH the content. */
    const revealTo = (target: number, fwd: boolean) => {
      if (quiet.matches) { fill(target); return; }
      tok += 1;
      const mine = tok;
      if (raf !== null) cancelAnimationFrame(raf);
      const jobs = pills.map((b, k) => {
        const slug = slugAt(target, k);
        const text = leagueLabel(slug);
        const idx = Array.from({ length: text.length }, (_, i) => i);
        for (let i = idx.length - 1; i > 0; i--) {   /* randomize order */
          const j = Math.floor(Math.random() * (i + 1));
          [idx[i], idx[j]] = [idx[j], idx[i]];
        }
        return { b, slug, text, on: lit(k), hue: HUE[slug],
                 start: (fwd ? SLOTS - 1 - k : k) * STAGGER_MS,
                 order: idx, cells: cells(b, text.length), started: false };
      });
      const t0 = performance.now();
      let lastChurn = -1e9;
      const frame = (now: number) => {
        if (mine !== tok) return;
        const churn = now - lastChurn >= CHURN_MS;
        if (churn) lastChurn = now;
        let all = true;
        for (const j of jobs) {
          const e = now - t0 - j.start;
          if (e < 0) { all = false; continue; }
          if (!j.started) { j.started = true; identify(j.b, j.slug, j.on); }
          const prog = Math.min(1, e / REVEAL_MS);
          if (prog < 1) all = false;
          const lock = Math.round(prog * j.text.length);
          const open = new Set(j.order.slice(0, lock));
          j.cells.forEach((g, c) => {
            if (open.has(c)) {
              if (g.textContent !== j.text.charAt(c))
                put(g, j.text.charAt(c), "");
            } else if (churn) {
              put(g, rnd(), j.hue);
            }
          });
        }
        raf = all ? null : requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    /* ── the position, and what the ribbon does with it ────────────────
       `absPos` is a REAL number. `Math.floor` of a value that rests a
       hair BELOW its integer reads one column early, and it does rest
       there: the rebase subtracts a whole column from a `scrollLeft` the
       smooth scroll had not QUITE finished moving — it fires inside the
       2px tolerance below — so the resting offset is up to 2px short.
       EPS is that tolerance expressed as a fraction of a column. */
    const ribbonUpdate = () => {
      const u = unit();
      const a = absPos();
      const i = Math.floor(a + 2 / oneW());
      strip.dataset.pos = a.toFixed(3);
      setStrip(-u);
      if (shown === null) { shown = i; fill(i); return; }
      /* A STEP ADVANCES `shown` OPTIMISTICALLY so the ink leaves WITH the
         cards. Until the scroll actually arrives the position still reads
         the OLD index, and without this guard that mismatch fired a
         corrective reveal in the opposite direction — two waves at once,
         one forward from the keypress and one backward from the lag. */
      if (armed !== null) { if (i === armed) armed = null; return; }
      if (shown === i) return;
      const d = i - shown;
      shown = i;
      if (Math.abs(d) !== 1) { fill(i); return; }    /* a jump, not a step */
      revealTo(i, d > 0);
    };

    const ribbonReset = () => {
      shown = null; armed = null;
      tok += 1;
      if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
      ribbonUpdate();
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (dead) return;
        if (LOOPS) {
          const one = oneW();
          let guard = 0;
          while (track.scrollLeft > (REST + 1) * one - 2 && guard++ < N) rotL();
          while (track.scrollLeft < (REST - 1) * one + 2 && guard++ < N) rotR();
        }
        ribbonUpdate();
      });
    };

    /** BOTH AT ONCE: the ink leaves with the cards, not after them.
     *  Position-driven cueing can only fire once the scroll has CROSSED,
     *  which put the wave at t=320 — the board had all but finished
     *  sliding before the ink moved. An arrow key and a pill click know
     *  their direction at the instant they are called; free scrolling
     *  still falls back to the crossing, which is the only cue it has. */
    const step = (d: number) => {
      /* A BOUNDED SCROLLER CAN REFUSE A STEP. The loop never can — that
         is its whole point — but a board with a column of slack and no
         more runs out, and advancing `shown` for a movement that will not
         happen leaves the rail naming a column the reader is not looking
         at. So the arrival is computed first where it can be, and the
         wave only leaves if the board is going to. */
      const bounded = rolling() && !LOOPS;
      let next: number | null = null;
      if (bounded) {
        const here = Math.floor(absPos() + 2 / oneW());
        next = Math.max(0, Math.min(SLACK, here + d));
        if (next === here) return;
      }
      if (shown !== null) {
        shown = next ?? shown + d;
        armed = shown;
        revealTo(shown, d > 0);
        const want = armed;
        window.setTimeout(() => { if (armed === want) armed = null; }, ARM_MS);
      }
      const behavior = quiet.matches ? "auto" as const : "smooth" as const;
      if (!rolling()) { spins = wrap(spins + d, N); seatColumn(); return; }
      if (bounded) { track.scrollTo({ left: seatFor(next!), behavior }); return; }
      track.scrollBy({ left: d * oneW(), behavior });
    };

    /** Where the loop cannot roll — the stacked board below `xl` — the
     *  rail is a jump nav and the board answers by bringing the column
     *  itself into view. */
    const seatColumn = () => {
      const slug = ORDER[wrap(spins, N)];
      cols.get(slug)!.scrollIntoView({
        behavior: quiet.matches ? "auto" : "smooth", block: "start" });
      ribbonUpdate();
    };

    const goto = (slug: string) => {
      const target = ORDER.indexOf(slug);
      if (target < 0) return;
      const from = shown;
      if (!rolling()) {
        spins = target;
        if (from !== null && Math.abs(target - from) === 1) {
          shown = target; armed = target;
          revealTo(target, target > from);
          const want = armed;
          window.setTimeout(() => { if (armed === want) armed = null; }, ARM_MS);
        }
        seatColumn();
        return;
      }
      if (!LOOPS) {
        /* A BOUNDED SCROLLER CANNOT ALWAYS PUT A COLUMN LEFTMOST — the
           last one is already against the end — so it is scrolled as far
           as it goes, which is far enough to have it on screen. Lighting
           it while it sat off the edge is the lie this avoids. */
        const seat = Math.max(0, Math.min(SLACK, target));
        track.scrollTo({ left: seatFor(seat),
          behavior: quiet.matches ? "auto" : "smooth" });
        if (from !== null && Math.abs(seat - from) === 1) {
          shown = seat; armed = seat;
          revealTo(seat, seat > from);
          const want = armed;
          window.setTimeout(() => { if (armed === want) armed = null; }, ARM_MS);
        } else if (seat !== from) {
          shown = seat; armed = seat; fill(seat);
          const want = armed;
          window.setTimeout(() => { if (armed === want) armed = null; }, ARM_MS);
        }
        return;
      }
      let guard = 0;
      while (order[REST] !== slug && guard++ < N * 2) order.push(order.shift()!);
      layout();
      track.scrollLeft = REST * oneW();
      spins = target;                 /* absPos must still name this league */
      if (from !== null && Math.abs(target - from) === 1) {
        /* A NEIGHBOUR IS A STEP, and a step gets the wave. Jumping four
           leagues is not a step and gets the settled state — a reveal
           over a distance nothing travelled is decoration. */
        shown = target;
        revealTo(target, target > from);
        armed = null;
      } else {
        ribbonReset();
      }
    };
    const onPill = (e: Event) => {
      const b = (e.currentTarget as HTMLElement);
      if (b.dataset.slug) goto(b.dataset.slug);
    };
    pills.forEach((b) => b.addEventListener("click", onPill));

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    };

    const onResize = () => {
      layout();
      if (rolling() && LOOPS) track.scrollLeft = REST * oneW();
      ribbonReset();
    };

    document.addEventListener("keydown", onKey);
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    // ── seat it ────────────────────────────────────────────────────────
    layout();
    if (LOOPS) {
      let g0 = 0;
      while (order[REST] !== ORDER[0] && g0++ < N * 2) order.unshift(order.pop()!);
      layout();
      if (rolling()) track.scrollLeft = REST * oneW();
      spins = ORDER.indexOf(order[REST]);
    }
    ribbonReset();
    /* A COLUMN'S WIDTH IS MEASURED OFF A TRACK THAT HAS JUST CHANGED
       SHAPE. Before `--colw` is written the grid is four 1fr tracks and
       does not overflow, so on a platform with classic scrollbars there
       is none — and the first `clientWidth` is a scrollbar wider than
       the one the board ends up with. Re-seat on the next frame, once
       the overflow it created is real.
       And again once the web fonts settle: the strip's slot width comes
       from its parent's measured width and the pill's height from a face
       that may not have loaded yet. */
    requestAnimationFrame(() => { if (!dead) { layout(); ribbonUpdate(); } });
    if (document.fonts?.ready) void document.fonts.ready.then(() => {
      if (!dead) { layout(); ribbonUpdate(); }
    });

    return () => {
      dead = true;
      reseat.current = () => {};
      if (raf !== null) cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      pills.forEach((b) => b.removeEventListener("click", onPill));
      track.style.removeProperty("--colw");
      track.style.removeProperty("--vieww");
    };
  }, [key, enabled, trackRef, stripRef]);

  /* No dependency list ON PURPOSE: this runs after EVERY commit and puts
     the rotation back on the grid. See `reseat` above. */
  useEffect(() => { reseat.current(); });
}
