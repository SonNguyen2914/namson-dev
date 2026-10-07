// App chrome for the bet-suggester: a sticky glass top bar with wayfinding
// chips, skeleton loaders so data-heavy sections show structure (never a
// bare "Loading…"), fold-away sections, quiet toasts for silent actions,
// a route-change progress sweep, and a scroll-spy so the chip for the
// section you're reading lights up.
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Wordmark } from "./Wordmark";
import { useOperatorTokenHeld } from "./OperatorToken";

/** THE FIELD, FROM THE TOP-LEFT OF EVERY PAGE THAT CARRIES THE NAV.
 *
 *  "create a stat page on the web, put in on the left upper side of the
 *   web for me to check rankings and tier rankings anytime i need"
 *                                            (operator, 2026-09-09)
 *
 *  "ANYTIME I NEED" IS WHY IT LIVES IN THE BAR ITSELF rather than in
 *  each page's `left` slot. Eleven surfaces render `TopBar` and only
 *  five pass `left` at all; a link handed in per page would be on those
 *  five and missing from the match pages, the market page and the 404 —
 *  and the one it would be missing from first is whichever page ships
 *  next. It is one piece of chrome, in one place, on every page by
 *  construction.
 *
 *  IT SITS BESIDE THE ARCHIVE, NOT INSTEAD OF IT. The standing rule for
 *  this corner is that it holds wayfinding OUT (`back`) or wayfinding
 *  DOWN (the archive dropdown), never both — and this is neither: it is
 *  a FIXED DESTINATION, the same one from everywhere, which is exactly
 *  the property that earns it 30px in the corner. It is also the
 *  narrowest thing in the bar (a glyph, with its three letters hidden
 *  below sm) so it cannot squeeze the chip rail on a phone.
 *
 *  IT NAMES A PAGE AND NOTHING ELSE. No count, no state, no glow —
 *  nothing about it changes with the data, so it can never become a
 *  signal about what is worth looking at. */
function FieldLink() {
  const router = useRouter();
  const here = router.pathname === "/bet-suggester/ratings";
  return (
    <Link href="/bet-suggester/ratings" data-testid="field-link"
      aria-label="the field — rankings and tier rankings"
      aria-current={here ? "page" : undefined}
      className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors sm:px-2 ${
        here
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-line text-ink-low hover:border-line-strong hover:text-ink-hi"}`}>
      {/* three ascending bars — a ranked field, at 9px */}
      <svg aria-hidden viewBox="0 0 9 9" className="h-[9px] w-[9px]">
        <rect x="0" y="5.5" width="2" height="3.5" fill="currentColor" />
        <rect x="3.5" y="3" width="2" height="6" fill="currentColor" />
        <rect x="7" y="0.5" width="2" height="8.5" fill="currentColor" />
      </svg>
      <span className="hidden sm:inline">field</span>
    </Link>
  );
}

/** THE LOGO, IN THE MIDDLE OF EVERY BAR, AND IT GOES HOME.
 *
 *  "put the Logo in the middle of the header bar to go back to landing
 *   page"                                        (Son, 2026-10-03)
 *
 *  ONE PIECE OF CHROME, LIKE THE FIELD LINK: it is in TopBar itself, so
 *  every page has it by construction and the page that ships next
 *  cannot forget it.
 *
 *  TRULY CENTRED, AND IT CANNOT COLLIDE. The bar is a three-track grid,
 *  `minmax(0,1fr) auto minmax(0,1fr)`: the two side tracks are always
 *  equal, so the logo sits on the bar's own axis, and each side is a
 *  `min-w-0` box its contents must live inside — the left cluster
 *  truncates its title, the right chip rail scrolls within itself.
 *
 *  THE SEVEN LETTERS ONLY FROM `lg` (round 9). Between md and lg they
 *  cost each side track ~35px, which cut every page title at 768px to a
 *  fragment ("WC…", "ML…"); below lg the gold mark stands alone in a
 *  44px box. From lg the box has a FIXED width, a little wider than the
 *  word set in Archivo: the letters arrive with the font after first
 *  paint (font-display: swap), and an auto-width middle track that grew
 *  by 16px when they did made both sides — title and rail — jump on
 *  every cold load. The gap between the three tracks is 4px below `sm`
 *  (measured: at 390px the archive menu plus a back arrow overran a
 *  145px left track by 2px at 8px). The gaps INSIDE the left cluster
 *  stay 8px: at 6px the back arrow's 44px touch box reached the field
 *  link's centre and answered its press
 *  (e2e/the-floor-is-the-pointer-not-the-width.spec.ts). */
function HomeLogo() {
  const router = useRouter();
  const here = router.pathname === "/";
  return (
    <Link href="/" data-testid="home-logo" aria-label="TRIVELA home"
      aria-current={here ? "page" : undefined}
      className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-md px-1.5 transition-opacity hover:opacity-80 lg:w-[120px]">
      <Wordmark letters="hidden lg:inline" />
    </Link>
  );
}

/** THE TRADING CHIP — THE OPERATOR'S, AND NOBODY ELSE'S.
 *
 *  "Hidden chip + one token"                      (Son, 2026-10-03)
 *
 *  It exists only while this tab holds an operator token
 *  (components/OperatorToken.tsx), and it is ABSENT otherwise — not
 *  hidden, not sr-only, not in the DOM — so a visitor's page carries no
 *  trace that the console exists. The server never holds a token, so it
 *  never renders one, and the first client render agrees with it.
 *
 *  ONE PIECE OF CHROME, like the field link and the logo: it is drawn by
 *  TopBar itself, at the head of the chip rail, so every page has it by
 *  construction and it is the first chip in view on a rail that scrolls.
 *  A `Link`, so the hop keeps the app shell — and the token in it. It
 *  is drawn as every other chip is and says where it goes, nothing
 *  else: no count, no P&L, no glow. */
function TradingChip() {
  const router = useRouter();
  const here = router.pathname === "/ops/trading";
  return (
    <Link href="/ops/trading" data-testid="trading-chip"
      aria-current={here ? "page" : undefined}
      className={`whitespace-nowrap rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors sm:px-2.5 ${
        here
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-line text-ink-low hover:border-line-strong hover:text-ink-hi"}`}>
      trading
    </Link>
  );
}

/** THE CHIP RAIL, AND WHERE IT RUNS OUT.
 *
 *  The rail scrolls inside its own box, and a scrollbar is hidden
 *  (`no-scrollbar`), so a rail cut at its edge read as a chip cut in
 *  half ("PREDICTIO", "FRIENDLIE") with nothing saying there was more.
 *  An edge that has more beyond it now FADES — the right edge while
 *  there is more to the right, the left edge once the rail has been
 *  scrolled — and an edge with nothing beyond it stays sharp. Measured,
 *  not assumed: the chips change width when the fonts land and a live
 *  chip can join the rail at any time, so the rail watches its own box,
 *  each chip's box and its list of chips. */
function Rail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement | null>(null);
  const [fade, setFade] = useState("");
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const more = el.scrollWidth - el.clientWidth - el.scrollLeft;
      const f = `${el.scrollLeft > 1 ? "l" : ""}${more > 1 ? "r" : ""}`;
      setFade((v) => (v === f ? v : f));
    };
    read();
    el.addEventListener("scroll", read, { passive: true });
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(read);
    const watchChips = () => {
      if (!ro) return;
      ro.observe(el);
      Array.from(el.children).forEach((c) => ro.observe(c));
    };
    watchChips();
    const mo = new MutationObserver(() => { watchChips(); read(); });
    mo.observe(el, { childList: true });
    return () => {
      el.removeEventListener("scroll", read);
      ro?.disconnect();
      mo.disconnect();
    };
  }, []);
  return (
    // min-w-0 (NOT shrink-0): the chip rail must compress and scroll
    // within itself — a rigid rail forced the whole page wider than the
    // viewport, horizontal-scrolling the entire app.
    // py-2 -my-2: HEADROOM FOR A GLOW, at no cost to the layout.
    // `overflow-x: auto` forces overflow-y to `auto` too, so this nav is
    // a clipping box the exact height of a chip — a lit chip's outer
    // bloom was being sliced off top and bottom with 0px to spare. The
    // negative margin gives the padding back, so the rail sits precisely
    // where it did.
    <nav ref={ref} data-fade={fade || undefined}
      className="topbar-rail no-scrollbar -my-2 flex min-w-0 items-center gap-1.5 overflow-x-auto py-2">
      {children}
    </nav>
  );
}

export function TopBar({ back, left, title, children, inner, rail = "row" }: {
  /** `direct`: ALWAYS the href, never history.back() — for a page whose
   *  own history is not the way back (the trading console, 2026-10-07:
   *  "← board" walked back through every console view first) */
  back?: { href: string; label: string; direct?: boolean };
  // The inner row's width and gutters. Every app page takes the default
  // (the board's 5xl measure); the home page passes its own wider
  // column so the bar's edges line up with the page under it.
  inner?: string;
  // Far-left slot, ahead of the back link. The archive dropdown lives
  // here on the surfaces that have no "back" (the board is the root of
  // the app), so the top-left corner is either wayfinding OUT or
  // wayfinding DOWN — never both fighting over the same 40px.
  left?: ReactNode;
  // optional since 2026-10-03: the home page's bar is field · logo ·
  // board, and a title beside the logo would only say the logo twice
  title?: ReactNode;
  children?: ReactNode;               // right side: nav chips / status
  /* WHERE THE CHIP RAIL GOES ON A PHONE (below `sm`), round 9.
   *  "row" (the default): a full-width second row under the bar. With
   *  the logo in the centre, the right track is half the bar — 149px at
   *  390px — and a match hub showed two chips of five, the second cut
   *  mid-word, where the rail had ~300px before the logo moved. Under
   *  the bar it has the whole width again (350px), as the board's own
   *  pills already do. The bar is then 89px tall, and `--topbar-h`
   *  follows it in globals.css (declared, so the first paint is right).
   *  "inline": the rail stays in the right track — for a rail of one
   *  short chip (the home page's "open the board") that fits there. */
  rail?: "row" | "inline";
}) {
  // THE OPERATOR'S CHIP JOINS THE RAIL, or makes one on a page that has
  // none (the 404). An "inline" rail is one short chip sized to fit
  // beside the logo; with a second chip it no longer fits there, so on a
  // phone it takes the row under the bar like every other rail.
  const operator = useOperatorTokenHeld();
  const hasRail = children != null || operator;
  const lane = operator ? "row" : rail;
  const row = hasRail && lane === "row";
  return (
    <header className="topbar" data-rail={hasRail ? lane : undefined}>
      <div className={`mx-auto grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] grid-rows-[3rem] items-center gap-x-1 sm:gap-x-4 ${
        row ? "max-sm:grid-rows-[3rem_2.5rem]" : ""} ${inner ?? "max-w-5xl px-5"}`}>
        <div data-testid="topbar-left" className="flex min-w-0 items-center gap-2 sm:gap-4">
          <FieldLink />
          {left}
          {back && (
            <Link href={back.href} aria-label={back.label}
              onClick={(e) => {
                // "back" means where the user WAS. A hardcoded href resets
                // the board to its default league tab (WC26), losing their
                // place — reported after every Leagues Cup visit. Real
                // history wins when it exists; the href stays as the
                // fallback for direct/bookmarked loads.
                // same-origin referrer required: history.length counts
                // about:blank/new-tab entries, so on a DIRECT load back()
                // would exit the site — e2e decision-safety.spec caught
                // exactly that. Direct loads follow the href fallback.
                if (!back.direct && typeof window !== "undefined"
                    && window.history.length > 1
                    && document.referrer.startsWith(window.location.origin)) {
                  e.preventDefault();
                  window.history.back();
                }
              }}
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-low transition-colors hover:text-accent">
              {/* arrow always; the label only from lg (round 9): between
                  sm and lg it took the room the page's own title needed,
                  and the arrow carries the same way out */}
              ←<span className="hidden lg:inline"> {back.label}</span>
            </Link>
          )}
          {/* Title is hidden on phones: the match-info card directly below
              already shows the matchup, so a truncated "RBNY …" here only
              stole room from the nav rail (leaving chips cut off). Shows
              again from sm+, where there's width for it — and where it
              still truncates, the whole of it is the hover title. */}
          {title != null && title !== "" && (
            <div title={typeof title === "string" ? title : undefined}
              className="hidden min-w-0 truncate font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mid sm:block">
              {title}
            </div>
          )}
        </div>
        <HomeLogo />
        <div data-testid="topbar-right" className={`flex min-w-0 items-center justify-end ${
          row ? "max-sm:col-span-3 max-sm:row-start-2 max-sm:justify-start" : ""}`}>
          {hasRail && (
            <Rail>
              {operator && <TradingChip />}
              {children}
            </Rail>
          )}
        </div>
      </div>
    </header>
  );
}

export function NavChip({ href, onClick, active, soon, children }: {
  href?: string;
  onClick?: () => void;
  active?: boolean;
  /* SOMETHING IS ON, AND WHEN — never whether to act on it.
   *
   *  THREE STATES, NAMED, and the third is the reason this is not a
   *  boolean. "soon" is a read that landed and counted a fixture in the
   *  window; "none" is a read that landed and counted none; "unknown" is
   *  a read that did not land — in flight, refused, or a payload that
   *  was not a fixture list. Only "soon" glows, and "none" and "unknown"
   *  are BOTH an ordinary chip on screen, because an ordinary chip
   *  asserts nothing and that is the right ink for both.
   *
   *  THEY ARE STILL TOLD APART IN THE MARKUP. `data-soon` carries the
   *  state verbatim — the same discipline as `data-counts` on a column
   *  header, and for the same reason: on screen the two absences look
   *  alike, so nothing else could ever catch a failed read being folded
   *  into a measured "nothing on". MISSING IS NEVER ZERO needs somewhere
   *  to be observable, and this is it.
   *
   *  `hue` is a CSS custom property NAME, so the chip is lit in the
   *  competition's own wayfinding light rather than in a colour typed
   *  here — league hues say WHICH, the traffic light says GOOD or BAD,
   *  and this is emphatically the first kind. `note` is the words: it
   *  names a day and nothing else, and it is written into the
   *  accessible name rather than left to the colour. */
  soon?: { state: "soon" | "none" | "unknown"; hue?: string; note?: string };
  children: ReactNode;
}) {
  const lit = soon?.state === "soon";
  const cls = "whitespace-nowrap rounded-md border px-2 py-1 sm:px-2.5 " +
    "font-mono text-[10px] uppercase tracking-[0.14em] transition-colors " +
    (lit
      // the glow wins over the resting style but NOT over `active`: a
      // chip for the page you are on is still the chip for the page you
      // are on, and two emphases fighting is neither
      ? (active
          ? "border-accent/50 bg-accent/10 text-accent"
          : "chip-soon")
      : active
        ? "border-accent/50 bg-accent/10 text-accent"
        : "border-line text-ink-low hover:border-line-strong hover:text-ink-hi");
  const style = lit && soon?.hue
    ? { ["--chip-hue" as string]: `var(${soon.hue})` }
    : undefined;
  const body = (
    <>
      {lit && (
        <i aria-hidden
          className="chip-soon-dot mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-[0.08em]" />
      )}
      {children}
      {/* THE FACT, IN WORDS, FOR ANYONE THE HUE NEVER REACHES. A glow is
          colour and colour alone; a screen reader, a high-contrast
          display and a printout all lose it. This is not decoration
          duplicated — it is the only copy of the fact that survives
          everywhere, and it is deliberately a day and not an
          instruction.
          ONLY THE LIT STATE SPEAKS. "none" and "unknown" add no words,
          because the one thing neither may say is that nothing is on:
          one has not been measured and the other is not worth a
          sentence. */}
      {lit && soon?.note && <span className="sr-only"> — {soon.note}</span>}
    </>
  );
  // Link, not <a>: a plain anchor made every chip hop a full document
  // load — the one navigation in the app that skipped the client router
  // (and RouteProgress). The legacy ?league= mapping that hard loads
  // used to pick up from next.config.ts lives client-side too (the
  // board's own deep-link guard), so nothing depends on the reload.
  const attrs = {
    className: cls, style,
    ...(soon ? { "data-soon": soon.state } : {}),
    ...(lit && soon?.note ? { title: soon.note } : {}),
  };
  return onClick
    ? <button onClick={onClick} {...attrs}>{body}</button>
    : <Link href={href ?? "#"} {...attrs}>{body}</Link>;
}

// Which of the given section ids is currently in view — drives the active
// state of the TopBar chips. Ids that don't exist yet (sections still
// loading) are simply ignored; the observer re-binds when they appear.
export function useScrollSpy(ids: string[], deps: unknown[] = []): string {
  const [active, setActive] = useState("");
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-72px 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(","), ...deps]);
  return active;
}

// Thin accent sweep under the top bar while a route change is in flight —
// perceived speed for the board -> match page hop.
export function RouteProgress() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const start = () => setBusy(true);
    const done = () => setBusy(false);
    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", done);
    router.events.on("routeChangeError", done);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", done);
      router.events.off("routeChangeError", done);
    };
  }, [router]);
  return busy ? <div className="route-progress" aria-hidden /> : null;
}

// ---- toasts: quiet feedback for actions that were previously silent ------
// Event-based so any component can `toast("…")` without prop drilling;
// <Toaster /> is mounted once per page.
type ToastMsg = { id: number; text: string };
const TOAST_EVENT = "bs-toast";

export function toast(text: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: text }));
  }
}

export function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      const id = ++n + Date.now();
      setItems((prev) => [...prev.slice(-2), { id, text }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);
  if (!items.length) return null;
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="toast">{t.text}</div>
      ))}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skel ${className}`} aria-hidden />;
}

export function SkeletonRows({ rows = 5, height = "h-11" }: {
  rows?: number; height?: string;
}) {
  return (
    <div className="space-y-2" aria-label="loading" role="status">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`${height} w-full`} />
      ))}
    </div>
  );
}

export function Collapse({ id, eyebrow, title, defaultOpen = true, className = "mb-10", children }: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className={className}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="group flex w-full items-baseline gap-3 border-b border-line pb-2.5 text-left">
        <span aria-hidden
          className={`text-ink-faint transition-transform ${open ? "rotate-90" : ""}`}>▸</span>
        {/* The eyebrow and the "show" hint are visual decoration; left in
            the accessible name they concatenate into garbage
            ("legendHow to read a row show"). The name is the title. */}
        <span className="min-w-0">
          {eyebrow && (
            <span aria-hidden className="mr-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">{eyebrow}</span>
          )}
          <span className="text-base font-medium text-ink-hi transition-colors group-hover:text-accent">{title}</span>
        </span>
        {!open && (
          <span aria-hidden className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">show</span>
        )}
      </button>
      {open && <div className="pt-5">{children}</div>}
    </div>
  );
}
