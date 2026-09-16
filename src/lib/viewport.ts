import { useEffect, useLayoutEffect, useState } from "react";

/** WHICH SHAPE THE BOARD IS IN, read from the stylesheet rather than
 *  typed beside it.
 *
 *  The board changes shape twice — one league on a phone, two columns on
 *  a tablet, four on a desktop — and half of each decision is CSS (which
 *  columns are laid out side by side) and half is JS (how many of them
 *  the loop puts on screen, and whether the ribbon or the tab strip is
 *  the control). Those two halves must agree exactly: a `matchMedia`
 *  string of `(max-width: 767px)` beside a `md:` utility is two
 *  declarations of one width, and the day one moves the board renders a
 *  column the control cannot reach.
 *
 *  So the widths come from `--breakpoint-md` / `--breakpoint-xl` on
 *  `:root`, which is where the non-inline `@theme` block in globals.css
 *  puts them and where Tailwind compiles its own `md:` and `xl:`
 *  variants from. One number, two readers.
 *
 *  THE FALLBACK IS NOT A SECOND COPY, it is the answer for the one
 *  moment the stylesheet cannot be asked: the server, where there is no
 *  `document` at all. It answers "desktop" there, which is what every
 *  page in this app has always been server-rendered as, so the markup
 *  the client hydrates is the markup the server sent. The real width
 *  arrives in a LAYOUT effect — before the browser paints — so a phone
 *  never shows a frame of the desktop board.
 */

/** The em-or-px value of a `--breakpoint-*` custom property, in px. */
function breakpoint(name: string, fallback: number): number {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name).trim();
  if (raw.endsWith("rem")) {
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const n = parseFloat(raw) * (Number.isFinite(root) ? root : 16);
    return Number.isFinite(n) ? n : fallback;
  }
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export type BoardShape = "phone" | "tablet" | "desktop";

/** `useLayoutEffect` does nothing on the server and React says so, every
 *  render. This hook is about the browser's FIRST paint, so on the
 *  server the passive hook is the honest stand-in — chosen once at module
 *  scope so the hook order never changes between renders. */
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Which of the board's three shapes the viewport is in.
 *
 *  Server and first hydration answer `"desktop"`; the real answer is
 *  written in a layout effect, which runs before paint. */
export function useBoardShape(): BoardShape {
  const [shape, setShape] = useState<BoardShape>("desktop");
  useIsoLayoutEffect(() => {
    const md = breakpoint("--breakpoint-md", 768);
    const xl = breakpoint("--breakpoint-xl", 1280);
    const phone = window.matchMedia(`(max-width: ${md - 0.02}px)`);
    const wide = window.matchMedia(`(min-width: ${xl}px)`);
    const read = () =>
      setShape(phone.matches ? "phone" : wide.matches ? "desktop" : "tablet");
    read();
    phone.addEventListener("change", read);
    wide.addEventListener("change", read);
    return () => {
      phone.removeEventListener("change", read);
      wide.removeEventListener("change", read);
    };
  }, []);
  return shape;
}
