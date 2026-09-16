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

/** A STEP'S OWN ANIMATION, ms — see `glideTo` for why the loop drives it
 *  rather than `scrollTo({behavior:"smooth"})`. Measured off what the
 *  browser was doing before, so the board still moves at the speed the
 *  operator approved: Chrome's native smooth scroll covered this
 *  distance in ~310ms. */
const STEP_MS = 300;
/** How long after the last scroll event a free scroll counts as over.
 *  Momentum reports every frame, so any gap this wide is a hand that has
 *  let go — and short enough that the board is not visibly adrift first. */
const SETTLE_MS = 120;
/** Near enough to a column edge to leave alone, px. */
const SNAP_EPS = 1;
/** Decelerating, and it ARRIVES: the cubic is at 0.999 of the distance
 *  with a tenth of the duration left, so nothing depends on the tail. */
const easeOut = (t: number) => 1 - (1 - t) ** 3;

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
export function useBoardLoop({ trackRef, stripRef, railRef, slugs, enabled,
  onRolling }: {
  trackRef: RefObject<HTMLDivElement | null>;
  stripRef: RefObject<HTMLDivElement | null>;
  /** THE HEADER RAIL's inner grid — the columns' headers, lifted OUT of
   *  the scrollport so they can stick to the viewport, and carried
   *  sideways by this loop instead. Optional: a board that does not
   *  scroll has no rail and nothing here runs for it. */
  railRef?: RefObject<HTMLDivElement | null>;
  slugs: readonly string[];
  enabled: boolean;
  /** IS THE TRACK GENUINELY A HORIZONTAL SCROLLER? The page needs the
   *  answer to decide whether to build the rail at all, and this is the
   *  only place that MEASURES it — a second copy of the `xl` breakpoint
   *  in a media query would be a second answer free to disagree. */
  onRolling?: (rolling: boolean) => void;
}): void {
  const key = slugs.join(",");
  /** Read through a ref so the effect below does not re-run — and does
   *  not go stale — when the page hands it a fresh closure. */
  const rollCb = useRef(onRolling);
  rollCb.current = onRolling;
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
    /** The step/settle animation this file drives itself, and the flag
     *  that tells the scroll handler to keep its hands off while it runs. */
    let glideRaf: number | null = null;
    let animating = false;
    let settleTimer: number | null = null;
    let touching = false;

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

    /** THE HEADER RAIL FOLLOWS THE TRACK, AND IS NOT A SECOND COPY OF IT.
     *
     *  The rail is a grid on the SAME template — `--cols` tracks of
     *  `--colw`, the same 24px gutter — sitting OUTSIDE the scrollport,
     *  and each header's slot takes its column's `--col` in the same
     *  statement the column does, off the same `order` array. So a
     *  header cannot be placed on a track its column is not on: there is
     *  one rotation and both read it.
     *
     *  What is left is the scroll offset, and that is this one transform.
     *  It is POSITIONAL SYNC, not an animation — no transition, no
     *  easing, nothing for `prefers-reduced-motion` to reduce. The rail
     *  moves exactly as much as the board moves, whenever the board
     *  moves, which is why every `scrollLeft` write below goes through
     *  `setScroll`. */
    const syncRail = () => {
      const rail = railRef?.current;
      if (rail) rail.style.transform = `translateX(${-track.scrollLeft}px)`;
    };
    /** Every write to the scroller, in one place, so the rail can never
     *  be left behind by one. */
    const setScroll = (x: number) => { track.scrollLeft = x; syncRail(); };

    /** Has the track become — or stopped being — a real scroller? Said
     *  once per change, never per frame. */
    let told: boolean | null = null;
    const report = () => {
      const r = rolling();
      if (r !== told) { told = r; rollCb.current?.(r); }
    };

    const layout = () => {
      track.style.setProperty("--cols", String(N));
      track.style.setProperty("--colw", `${colW()}px`);
      /* what the matchday rail sticks to, so a date stays legible over
         whichever four columns you have scrolled to */
      track.style.setProperty("--vieww", `${track.clientWidth}px`);
      const rail = railRef?.current ?? null;
      if (rail) {
        rail.style.setProperty("--cols", String(N));
        rail.style.setProperty("--colw", `${colW()}px`);
      }
      order.forEach((slug, i) => {
        cols.get(slug)!.style.setProperty("--col", String(i + 1));
        /* THE HEADER TAKES ITS COLUMN'S TRACK IN THE SAME BREATH. A rail
           seated from its own bookkeeping is a header free to drift a
           whole column away from the league it names — worse than no
           sticky header at all. */
        rail?.querySelector<HTMLElement>(`[data-rail-slot="${slug}"]`)
          ?.style.setProperty("--col", String(i + 1));
      });
      syncRail();
      report();
    };
    reseat.current = () => { if (!dead) layout(); };

    /* THE LOOP. No clones: the array turns and the scroll is compensated
       by exactly one column, so nothing under the cursor moves.
       The rail turns WITH it: `layout()` re-seats the header slots and
       `setScroll` re-offsets the rail, both inside this one synchronous
       pair — which is what keeps a rotation invisible in the rail as
       well as on the board. */
    const rotL = () => {
      order.push(order.shift()!); layout();
      setScroll(track.scrollLeft - oneW()); spins += 1;
    };
    const rotR = () => {
      order.unshift(order.pop()!); layout();
      setScroll(track.scrollLeft + oneW()); spins -= 1;
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
       `absPos` is a REAL number, and `Math.floor` of a value resting a
       hair BELOW its integer reads one column early. The board no longer
       rests short by design — it is seated on an exact multiple of a
       column by `seatAbs` (2026-09-15) — but `scrollLeft` is read back
       off a device-pixel grid the float never lands on, so the tolerance
       stays. EPS is it, expressed as a fraction of a column. */
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

    /* ── MOTION: the board is moved from here, and only from here ──────
       (2026-09-15, the two defects the operator was looking at)

       BOTH OF THEM ARE THE SAME SENTENCE: the board was allowed to be at
       a FRACTIONAL position, and the correction for that was visible.

       A step used to be `scrollBy({behavior:"smooth"})`, which hands the
       animation to the browser — and the loop's rebase then has to fire
       INSIDE it. From a whole column that is survivable, because the
       threshold is not crossed until the animation is 99.7% done. From a
       fractional one it is not: measured on the eight-league board, a
       board parked at 0.449 of a column answered one ArrowRight by
       crossing the threshold at 92ms, and the `scrollLeft` write that
       rebases it ABORTED the browser's animation where it stood. The
       step delivered 0.611 of a column instead of one and left the board
       at 1.060 — three columns on screen and a sliver clipped at each
       edge, which is the broken board in the operator's screenshot.

       And the board got to 0.449 in the first place because NOTHING ever
       settled a free scroll: `scrollTo` ran for explicit steps only, so a
       wheel or trackpad flick rested wherever its momentum stopped.

       So: the loop owns the animation. A step turns the order FIRST, at
       rest, where the turn and the `scrollLeft` that cancels it are one
       synchronous pair with nothing in flight between them; the glide
       then runs entirely inside the safe band and ends on the canonical
       seat, a whole column, exactly. No rebase ever lands mid-animation
       again, because during a glide there is nothing to rebase. */

    const cancelGlide = () => {
      if (glideRaf !== null) { cancelAnimationFrame(glideRaf); glideRaf = null; }
      animating = false;
    };

    /** Put the scroller back inside the band `REST ± 1` by turning the
     *  order. Invisible by construction: each turn moves every column one
     *  place and takes exactly one column back off `scrollLeft`, so what
     *  is under the scrollport does not move. */
    const normalize = () => {
      if (!LOOPS) return;
      const one = oneW();
      let guard = 0;
      while (track.scrollLeft > (REST + 1) * one - 2 && guard++ < N) rotL();
      while (track.scrollLeft < (REST - 1) * one + 2 && guard++ < N) rotR();
    };

    /** Move the scroller to `to` over `STEP_MS`, or land on it at once.
     *  `prefers-reduced-motion` takes the second branch, which is the
     *  settled state and no animation at all. */
    const glideTo = (to: number, animate: boolean) => {
      cancelGlide();
      const from = track.scrollLeft;
      if (!animate || quiet.matches || Math.abs(to - from) < 0.5) {
        setScroll(to);
        ribbonUpdate();
        return;
      }
      animating = true;
      const t0 = performance.now();
      const frame = (now: number) => {
        /* CLAMPED AT BOTH ENDS. A rAF callback is handed the timestamp of
           the frame it belongs to, and a keypress is dispatched DURING
           that frame's input handling — so `t0`, taken in the handler, can
           be LATER than the first `now`. Unclamped that is a negative `p`,
           and the cubic answers a negative fraction of the distance:
           measured, the board stepped 31px the WRONG WAY on frame one and
           then recovered, which is the overshoot-and-return the guard in
           `the-board-scrolls-and-loops` refuses. */
        const p = Math.min(1, Math.max(0, (now - t0) / STEP_MS));
        setScroll(from + (to - from) * easeOut(p));
        if (p < 1) { glideRaf = requestAnimationFrame(frame); return; }
        glideRaf = null;
        animating = false;
        setScroll(to);          /* land on it, not near it */
        ribbonUpdate();
      };
      glideRaf = requestAnimationFrame(frame);
    };

    /** SEAT THE BOARD ON A WHOLE COLUMN. `abs` is in `absPos`'s units —
     *  columns from the start of the declared order — and the board ends
     *  naming exactly that column, with its left edge on the
     *  scrollport's.
     *
     *  A looped board turns the order until the canonical seat IS `abs`
     *  and then glides to that one fixed offset, so every step animates
     *  between the same two places and can never cross a threshold. A
     *  bounded one has no seam to rebase and simply glides to the column. */
    const seatAbs = (abs: number, animate: boolean) => {
      if (LOOPS) {
        let k = abs - spins;
        let guard = 0;
        while (k > 0 && guard++ < N * 2) { rotL(); k -= 1; }
        while (k < 0 && guard++ < N * 2) { rotR(); k += 1; }
        glideTo(REST * oneW(), animate);
        return;
      }
      glideTo(seatFor(abs), animate);
    };

    /** WHERE A FREE SCROLL COMES TO REST — the nearest whole column.
     *
     *  This is JS and not `scroll-snap-type: x mandatory` because
     *  mandatory snapping snaps PROGRAMMATIC writes too: measured on this
     *  board, `track.scrollLeft += oneW()/2` read back as the offset it
     *  started from, in the same statement. A snapping scrollport cannot
     *  be animated from script at all, and the loop's own rebase is a
     *  script write — so the declarative answer would have taken the
     *  mechanism this board is built on with it. */
    const settle = () => {
      settleTimer = null;
      if (dead || animating || touching || !rolling()) return;
      const a = absPos();
      const q = Math.round(a);
      if (Math.abs(a - q) * oneW() <= SNAP_EPS) return;
      seatAbs(q, true);
    };
    const scheduleSettle = () => {
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settle, SETTLE_MS);
    };

    const onScroll = () => {
      /* THE RAIL MOVES IN THIS HANDLER, NOT IN THE rAF BELOW. A scroll
         event is dispatched in the frame's own rendering step, BEFORE
         requestAnimationFrame callbacks — so a transform written here
         lands in the same painted frame as the scroll that caused it,
         and one written in the throttled callback below would be a frame
         late. A header trailing its column by a frame on every wheel tick
         is the drift this rail exists to avoid. */
      syncRail();
      /* A glide's own writes are not a free scroll and must not arm the
         settle against themselves. */
      if (!animating) scheduleSettle();
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (dead) return;
        if (!animating) normalize();
        ribbonUpdate();
      });
    };

    /** A HAND ON THE BOARD OUTRANKS THE GLIDE. A horizontal wheel is the
     *  reader taking over; a vertical one is them reading the page, and
     *  must not stop a step half-way down a column. */
    const onWheel = (e: WheelEvent) => { if (e.deltaX !== 0) cancelGlide(); };
    const onTouchStart = () => { touching = true; cancelGlide(); };
    const onTouchEnd = () => { touching = false; scheduleSettle(); };

    /** BOTH AT ONCE: the ink leaves with the cards, not after them.
     *  Position-driven cueing can only fire once the scroll has CROSSED,
     *  which put the wave at t=320 — the board had all but finished
     *  sliding before the ink moved. An arrow key and a pill click know
     *  their direction at the instant they are called; free scrolling
     *  still falls back to the crossing, which is the only cue it has. */
    const step = (d: number) => {
      /* Below xl there is no scroller: the rail is a jump nav. */
      if (!rolling()) { spins = wrap(spins + d, N); seatColumn(); return; }
      cancelGlide();
      if (settleTimer !== null) {
        window.clearTimeout(settleTimer); settleTimer = null;
      }
      normalize();
      /* THE ARRIVAL IS A WHOLE COLUMN, READ OFF THE BOARD. Not
         `shown + d`: a step taken while the board sits between two
         columns — mid-flick, or from the fractional rest this used to
         leave behind — has to say which column it is leaving before it
         can say which one it is going to, and the rail's idea of that is
         a consequence rather than the source.
         A BOUNDED SCROLLER CAN REFUSE A STEP. The loop never can — that
         is its whole point — but a board with a column of slack and no
         more runs out, and advancing `shown` for a movement that will not
         happen leaves the rail naming a column the reader is not looking
         at. So the arrival is computed first, and the wave only leaves if
         the board is going to. */
      const here = Math.round(absPos());
      const arrive = LOOPS
        ? here + d : Math.max(0, Math.min(SLACK, here + d));
      if (arrive === here) return;
      if (shown !== null) {
        shown = arrive;
        armed = arrive;
        revealTo(arrive, d > 0);
        const want = armed;
        window.setTimeout(() => { if (armed === want) armed = null; }, ARM_MS);
      }
      seatAbs(arrive, true);
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
      /* A jump owns the board outright — nothing half-finished may still
         be writing `scrollLeft` underneath it. */
      cancelGlide();
      if (settleTimer !== null) {
        window.clearTimeout(settleTimer); settleTimer = null;
      }
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
        seatAbs(seat, true);
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
      setScroll(REST * oneW());
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
      cancelGlide();
      layout();
      if (rolling() && LOOPS) setScroll(REST * oneW());
      ribbonReset();
    };

    document.addEventListener("keydown", onKey);
    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("wheel", onWheel, { passive: true });
    track.addEventListener("touchstart", onTouchStart, { passive: true });
    track.addEventListener("touchend", onTouchEnd, { passive: true });
    track.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("resize", onResize);

    // ── seat it ────────────────────────────────────────────────────────
    layout();
    if (LOOPS) {
      let g0 = 0;
      while (order[REST] !== ORDER[0] && g0++ < N * 2) order.unshift(order.pop()!);
      layout();
      if (rolling()) setScroll(REST * oneW());
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
      if (glideRaf !== null) cancelAnimationFrame(glideRaf);
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      document.removeEventListener("keydown", onKey);
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("wheel", onWheel);
      track.removeEventListener("touchstart", onTouchStart);
      track.removeEventListener("touchend", onTouchEnd);
      track.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("resize", onResize);
      pills.forEach((b) => b.removeEventListener("click", onPill));
      track.style.removeProperty("--colw");
      track.style.removeProperty("--vieww");
      /* A BOARD WITH NO LOOP HAS NO RAIL. Said last, so the page unmounts
         the rail and every header goes back to sticking in its own column
         — which is the state a four-column board and every narrowed page
         were never taken out of. */
      if (told !== false) rollCb.current?.(false);
    };
  }, [key, enabled, trackRef, stripRef, railRef]);

  /* No dependency list ON PURPOSE: this runs after EVERY commit and puts
     the rotation back on the grid. See `reseat` above. */
  useEffect(() => { reseat.current(); });
}
