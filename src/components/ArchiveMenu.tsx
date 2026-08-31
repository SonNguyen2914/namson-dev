// The archive dropdown — top-left of the top bar.
//
// WHAT GOES IN IT, AND HOW THAT WAS DECIDED. Competitions that are
// FINISHED. Not "old", not "less interesting" — over. The list was
// settled against the backend on 2026-08-30 rather than from memory,
// because "is this competition finished?" is a question the data answers
// and a guess gets wrong:
//
//   /api/comp/asean/fixtures       0 upcoming, 28 finished   -> ARCHIVE
//   /api/comp/leagues-cup/fixtures 2 upcoming (SEMI-FINALS,
//                                  2026-09-03)               -> stays a chip
//   /api/comp/ucl/fixtures        18 upcoming (league phase
//                                  opens 2026-09-08)         -> stays a chip
//   World Cup 26                   final played 2026-07-19   -> ARCHIVE
//
// So Leagues Cup and UCL are NOT archived: one is two matches from its
// final and the other has not kicked off. Filing a live competition
// under "finished" would be a claim about the world, made by a menu.
//
// The control itself is a real <button> with aria-expanded and a
// role="menu" panel: Enter/Space open, Escape closes and returns focus,
// arrows/Home/End move through the items, Tab and an outside click close
// it, and it closes on route change so it is never left hanging over the
// page it just navigated to. Focus is visible via the global
// :focus-visible rule.
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";

export type ArchiveEntry = {
  key: string;
  href: string;
  label: string;
  meta: string;
};

export const ARCHIVE: ArchiveEntry[] = [
  {
    key: "wc26",
    href: "/bet-suggester/wc26",
    label: "World Cup 26",
    meta: "complete · españa",
  },
  {
    key: "asean",
    href: "/bet-suggester/comp/asean",
    label: "ASEAN Championship",
    meta: "complete · viewer",
  },
];

export function ArchiveMenu({ current }: { current?: string }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const router = useRouter();

  const close = useCallback((focusButton = false) => {
    setOpen(false);
    if (focusButton) button.current?.focus();
  }, []);

  // Outside press. pointerdown, not mousedown: it fires for mouse AND
  // touch, so a touch scroll-drag that starts outside closes the menu
  // too — and it fires on press start, so a press that starts outside
  // and ends inside (a drag over the panel) is still "went elsewhere".
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // A menu left open across a navigation floats over the page it just
  // opened. Close on route change, not on unmount — the top bar itself
  // survives client-side transitions.
  useEffect(() => {
    const done = () => setOpen(false);
    router.events.on("routeChangeStart", done);
    return () => router.events.off("routeChangeStart", done);
  }, [router]);

  // Move real focus, not just a highlight: a roving-highlight menu that
  // leaves focus on the button reads the wrong item to a screen reader.
  useEffect(() => {
    if (open) items.current[cursor]?.focus();
  }, [open, cursor]);

  const openAt = (i: number) => { setCursor(i); setOpen(true); };

  const onButtonKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); openAt(0); }
    else if (e.key === "ArrowUp") { e.preventDefault(); openAt(ARCHIVE.length - 1); }
    else if (e.key === "Escape") close();
  };

  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); close(true); }
    else if (e.key === "Tab") close();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % ARCHIVE.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + ARCHIVE.length) % ARCHIVE.length);
    } else if (e.key === "Home") { e.preventDefault(); setCursor(0); }
    else if (e.key === "End") { e.preventDefault(); setCursor(ARCHIVE.length - 1); }
  };

  return (
    <div ref={wrap} className="relative shrink-0">
      <button
        ref={button}
        type="button"
        id="archive-menu-button"
        aria-haspopup="menu"
        aria-expanded={open}
        // only while the panel EXISTS — the id is conditionally rendered
        // below, and aria-controls naming a missing id is a dangling
        // reference to anything that resolves it
        aria-controls={open ? "archive-menu" : undefined}
        onClick={() => (open ? close() : openAt(0))}
        onKeyDown={onButtonKey}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors sm:px-2.5 ${
          open
            ? "border-accent/50 bg-accent/10 text-accent"
            : "border-line text-ink-low hover:border-line-strong hover:text-ink-hi"
        }`}
      >
        Archive
        <span aria-hidden
          className={`text-[8px] leading-none transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div
          id="archive-menu"
          role="menu"
          aria-labelledby="archive-menu-button"
          onKeyDown={onMenuKey}
          className="menu-glass absolute left-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-line p-1.5 shadow-2xl"
        >
          <p className="px-2.5 pb-1.5 pt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">
            finished competitions
          </p>
          {ARCHIVE.map((a, i) => (
            <Link
              key={a.key}
              href={a.href}
              role="menuitem"
              ref={(el) => { items.current[i] = el; }}
              tabIndex={i === cursor ? 0 : -1}
              aria-current={current === a.key ? "page" : undefined}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setCursor(i)}
              className={`block rounded-lg px-2.5 py-2 transition-colors ${
                current === a.key
                  ? "bg-accent/10 text-accent"
                  // the panel itself is bg-elev2 now, so the hover has to
                  // be a tint rather than the same surface
                  : "text-ink-mid hover:bg-accent/5 hover:text-ink-hi"
              }`}
            >
              <span className="block text-sm">{a.label}</span>
              <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                {a.meta}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArchiveMenu;
