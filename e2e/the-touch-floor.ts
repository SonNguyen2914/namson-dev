/** THE TOUCH FLOOR, AUDITED THE ONLY WAY THAT COUNTS.
 *
 *  The floor is a 44px HIT AREA, not a 44px control: each control grows
 *  an `::after` centred on it, so the ink stays the size the design drew
 *  it and only the target grows. That is what makes it affordable on a
 *  board of dense fixture cards — and it is also why a box measurement
 *  cannot check it. `getBoundingClientRect()` on a 15px `i` reports 15px
 *  whether the floor is working or broken.
 *
 *  So this audit asks the page the question a thumb asks: PRESS 18px
 *  OUTSIDE THE INK AND SEE WHO ANSWERS. `elementFromPoint` at a point
 *  beyond the control's own box must resolve back to that control, and a
 *  press at its centre must still resolve to IT rather than to a
 *  neighbour whose hit area has reached over the top. Computed style is
 *  read too, but only as the cheap census — the press is the claim.
 *
 *  ── WHAT COUNTS AS A CONTROL ────────────────────────────────────────
 *
 *  Derived from the DOM, never a hand-listed set: everything a reader
 *  can press, focus or type into. A control added to the board tomorrow
 *  is audited without anybody remembering to add it here.
 *
 *  ── AND WHAT IS EXCLUDED, EACH FOR A MEASURED REASON ────────────────
 *
 *  `checkVisibility()` rather than a rect test. A closed `<details>` now
 *  hides its contents with `content-visibility: hidden`, which keeps the
 *  layout box — `watch-sync` inside the shut "matches to watch" panel
 *  reports a healthy 247x25 and is not rendered, not hit-testable and
 *  not pressable by anyone. A rect-only filter counts it and then fails
 *  on it forever.
 *
 *  DISABLED CONTROLS. Chromium does not hit-test a disabled form control
 *  at all — `elementFromPoint` over one returns the element behind it —
 *  and that is correct: a disabled button is meant to answer nothing.
 *  Requiring it to answer a press would be requiring a bug.
 *
 *  OFF TO THE SIDE. The board is a horizontal scroller carrying eight
 *  columns, most of them outside the viewport. Scrolling one in would
 *  move the track and rebase the loop, so a control that is not already
 *  horizontally on screen is counted in the census and not pressed.
 *
 *  UNDER THE PARKED CHROME. The top bar and the pills bar are sticky and
 *  really are in front of the page; a control that has scrolled beneath
 *  them is covered by design. The band comes from `--topbar-h`, which
 *  the page measures off those two bars at runtime rather than declaring
 *  — so this follows them if they change height. */
import type { Page } from "@playwright/test";

/** Everything a reader can press, focus or type into. */
export const CONTROLS = 'a[href],button,select,input,textarea,summary,'
  + '[role="tab"],[role="button"],[tabindex]:not([tabindex="-1"])';

export type FloorAudit = {
  /** every live control on the page */
  census: number;
  /** …of those, how many are under the floor once the hit area counts */
  small: number;
  /** …and how many would be under it on their INK alone. The floor is
   *  only doing work if this is large while `small` is zero. */
  smallInk: number;
  /** how many carry a grown hit area at all */
  grown: number;
  /** controls actually pressed (on screen, clear of the parked chrome) */
  pressed: number;
  /** …that did not answer a press at the floor */
  pressFail: number;
  /** …whose own centre was answered by a DIFFERENT control */
  theft: number;
  floor: number;
  examples: string[];
  thefts: string[];
  /** controls the floor MOVED: positioned by their own styles (absolute,
   *  fixed, sticky) and repositioned by the floor's `position: relative`.
   *  The floor may only grow a hit area; a control it moves is a layout
   *  change on every touch screen. */
  repositioned: string[];
  doc: number;
  vw: number;
};

/** Audit the floor on whatever device `page` is already emulating.
 *
 *  Call it on a context built with `reducedMotion: "reduce"`: the page
 *  sets `html { scroll-behavior: smooth }`, and a smooth scroll still in
 *  flight puts the rect and the hit test at two different offsets —
 *  measured, and it reported a healthy control as unreachable. Honouring
 *  reduced motion makes every scroll here instant, which is the same
 *  thing the charter asks of the page. */
export async function auditFloor(page: Page): Promise<FloorAudit> {
  return page.evaluate(async (SEL) => {
    const floor = parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue("--tap-floor")) || 44;
    /* THE CHROME BAND IS READ OFF EACH CONTROL, because `--topbar-h`
       inherits and is not one number: the board measures its nav plus
       pills and sets the result on its own page root, while every other
       page inherits `:root`'s declared `calc(3rem + 1px)`. It was read
       off "the" `[data-tap-floor]` element while there was one per page;
       with the floor on the app shell (audit F11) that element is the
       shell, which sits ABOVE the board's own measurement. A `calc()` is
       resolved by laying it out once, in a probe, rather than parsed. */
    const bandCache = new Map<string, number>();
    const bandOf = (e: HTMLElement) => {
      const v = getComputedStyle(e).getPropertyValue("--topbar-h").trim();
      if (!v) return 0;
      if (/^[\d.]+px$/.test(v)) return parseFloat(v);
      if (!bandCache.has(v)) {
        const probe = document.createElement("div");
        probe.style.cssText = `position:absolute;visibility:hidden;height:${v}`;
        document.body.appendChild(probe);
        bandCache.set(v, probe.getBoundingClientRect().height);
        probe.remove();
      }
      return bandCache.get(v)!;
    };
    const vis = (e: HTMLElement) => (e as unknown as {
      checkVisibility: (o?: unknown) => boolean }).checkVisibility({
        contentVisibilityAuto: true, opacityProperty: true,
        visibilityProperty: true } as unknown as undefined);
    const live = (e: HTMLElement) =>
      !(e as HTMLButtonElement).disabled
      && e.getAttribute("aria-disabled") !== "true"
      && e.getAttribute("aria-hidden") !== "true"
      && vis(e);

    const all = Array.from(document.querySelectorAll<HTMLElement>(SEL))
      .filter((e) => {
        const b = e.getBoundingClientRect();
        return b.width > 0 && b.height > 0 && live(e);
      });

    /** Is this control part of the parked chrome rather than under it? */
    const chromeOwned = (e: HTMLElement) => {
      let p: HTMLElement | null = e;
      while (p && p !== document.body) {
        const pos = getComputedStyle(p).position;
        if (pos === "sticky" || pos === "fixed") return true;
        p = p.parentElement;
      }
      return false;
    };

    const desc = (el: HTMLElement) => `<${el.tagName.toLowerCase()}`
      + `${el.dataset?.testid ? ` data-testid="${el.dataset.testid}"` : ""}>`
      + ` "${((el.textContent || "").trim()
        || el.getAttribute("aria-label") || "").slice(0, 20)}"`;

    let small = 0, smallInk = 0, grown = 0, pressed = 0, pressFail = 0,
      theft = 0;
    const examples: string[] = [], thefts: string[] = [];

    /* THE FLOOR MUST NOT MOVE ANYTHING. Its rule gives every control
       `position: relative` so the `::after` has a containing block, and
       a control that positions ITSELF has to keep doing so. Read with
       the floor and without it — the attribute taken off every shell
       for one synchronous style read and put straight back — so this
       is the rule's own effect and nothing else. */
    const shells = Array.from(
      document.querySelectorAll<HTMLElement>("[data-tap-floor]"));
    const posOn = all.map((e) => getComputedStyle(e).position);
    shells.forEach((sh) => sh.removeAttribute("data-tap-floor"));
    const posOff = all.map((e) => getComputedStyle(e).position);
    shells.forEach((sh) => sh.setAttribute("data-tap-floor", ""));
    const repositioned = all.flatMap((e, i) =>
      posOff[i] !== "static" && posOff[i] !== posOn[i]
        ? [`${desc(e)} ${posOff[i]} -> ${posOn[i]}`] : []);

    for (const e of all) {
      const b0 = e.getBoundingClientRect();
      const a = getComputedStyle(e, "::after");
      const g = a.content !== "none" && a.content !== "";
      if (g) grown++;
      if (b0.width < floor - 0.5 || b0.height < floor - 0.5) smallInk++;
      const w = Math.max(b0.width, g ? parseFloat(a.width) || 0 : 0);
      const h = Math.max(b0.height, g ? parseFloat(a.height) || 0 : 0);
      if (w < floor - 0.5 || h < floor - 0.5) {
        small++;
        if (examples.length < 8) examples.push(
          `${desc(e)} — ${Math.round(w)}x${Math.round(h)}`);
      }

      // ── and now the part a box cannot tell you ──
      if (b0.left < 2 || b0.right > innerWidth - 2) continue;
      /* INSTANT, SAID ON THE CALL (2026-09-24). `html` sets
         `scroll-behavior: smooth`, and a call that does not name its
         behaviour inherits it — so this scroll TRAVELLED, and the settle
         loop below had to guess when it had landed. It guessed wrong
         under load: the loop exits the first time two reads 25ms apart
         agree, and a smooth scroll that has not STARTED yet agrees with
         itself perfectly. Measured at 6x CPU throttle on the phone board:
         3 of 10 runs read the rect at scrollY 0 while the scroll began
         after, and pressed a point the control had already left
         ("refusal-why-open did not answer a press 18px off centre —
         league-col did"), which is the failure the full suite showed in 2
         of 4 runs and never alone. With `behavior: "instant"` the same
         throttled probe fails 0 of 10: the scroll has landed before this
         line returns, whatever the load. The loop stays as a floor for a
         layout that is still moving for its own reasons. */
      e.scrollIntoView({ block: "center", inline: "nearest",
        behavior: "instant" as ScrollBehavior });
      for (let i = 0, last = -1; i < 40 && last !== window.scrollY; i++) {
        last = window.scrollY;
        await new Promise((done) => setTimeout(done, 25));
      }
      const b = e.getBoundingClientRect();
      if (b.left < 2 || b.right > innerWidth - 2) continue;
      /* THE BARS THEMSELVES ARE NOT "UNDER THE BARS". A control with a
         sticky or fixed ancestor IS the parked chrome — the pills bar's
         own league pills are the clearest case, and they are the
         tablet's primary board control — so it is judged where it sits.
         Anything else inside that band has scrolled beneath the chrome
         and is covered by design. Read off `position`, so a bar that
         stops being sticky stops being excused. */
      if (!chromeOwned(e)
        && (b.top < bandOf(e) + floor || b.bottom > innerHeight - 2)) continue;
      if (b.top < 2 || b.bottom > innerHeight - 2) continue;
      pressed++;
      const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
      const ctl = (x: number, y: number) => {
        const hit = document.elementFromPoint(x, y) as HTMLElement | null;
        return hit ? hit.closest(SEL) : null;
      };
      if (b.width < floor - 0.5 || b.height < floor - 0.5) {
        // press OUTSIDE the ink, on whichever axis is short
        const vert = b.height < floor - 0.5;
        const off = floor / 2 - 4;
        const px = vert ? cx : cx - off, py = vert ? cy - off : cy;
        const got = ctl(px, py);
        if (got !== e) {
          pressFail++;
          if (examples.length < 8) examples.push(
            `${desc(e)} ${Math.round(b.width)}x${Math.round(b.height)} did `
            + `not answer a press ${Math.round(off)}px off centre — `
            + `${got ? desc(got as HTMLElement) : "nothing"} did`);
        }
      }
      const mine = ctl(cx, cy);
      if (mine && mine !== e) {
        theft++;
        if (thefts.length < 8)
          thefts.push(`${desc(e)} -> ${desc(mine as HTMLElement)}`);
      }
    }
    window.scrollTo(0, 0);
    return { census: all.length, small, smallInk, grown, pressed, pressFail,
      theft, floor, examples, thefts, repositioned,
      doc: document.documentElement.scrollWidth,
      vw: document.documentElement.clientWidth };
  }, CONTROLS);
}
