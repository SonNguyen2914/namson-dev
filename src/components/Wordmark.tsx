// THE TRIVELA WORDMARK — type, and one small gold mark.
//
// A trivela is a ball struck with the outside of the foot, so it swerves
// AWAY from where it was aimed. The mark is that path: a low line that
// bends late, and the ball at the end of it. Gold is the brand and never
// a verdict — `--brand`, not `--accent`, because nine pages re-theme the
// accent to their league and the mark is in every page's bar.
//
// The letters are Archivo at the top of its width axis — the board's own
// display face, opened right out — so the name reads as a broadcast
// caption rather than a logo lock-up. The favicon (public/icon.svg) is
// this mark alone.
//
// SHARED since 2026-10-03: the centre of every page's TopBar
// (components/chrome.tsx) is this mark, linking home; the home page
// also signs off with the large size.

export function Mark({ size = 18, className = "" }: {
  size?: number; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width={size} height={size}
      className={className} style={{ overflow: "visible" }}>
      <path d="M2.5 19.5 C 9 19.5, 15.5 17, 18.2 8.6" fill="none"
        stroke="var(--brand)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="19.2" cy="5.2" r="3.1" fill="var(--brand)" />
    </svg>
  );
}

/** `letters` is a class for the seven letters alone, so a narrow bar
 *  can hide them and keep the mark (`"hidden md:inline"`). */
export function Wordmark({ size = "sm", as = "span", letters = "" }: {
  size?: "sm" | "lg"; as?: "span" | "p"; letters?: string }) {
  const Tag = as;
  const lg = size === "lg";
  return (
    <Tag data-testid="wordmark"
      className="inline-flex items-center whitespace-nowrap text-ink-hi"
      style={{ gap: lg ? "0.5em" : "0.45em" }}>
      <Mark size={lg ? 34 : 14} />
      <span className={letters}
        style={{
          // the site-wide token: valid at :root since 2026-10-03 (it
          // used to reference a Geist variable defined below :root, so
          // it fell back to Geist everywhere — globals.css)
          fontFamily: "var(--font-archivo)",
          fontStretch: "125%",
          fontWeight: 700,
          letterSpacing: lg ? "0.16em" : "0.2em",
          fontSize: lg ? "clamp(28px, 4.4vw, 52px)" : "12px",
          lineHeight: 1,
          // the tracking adds space after the last letter too; give it
          // back so the word is optically centred on its own box
          marginRight: lg ? "-0.16em" : "-0.2em",
        }}>
        TRIVELA
      </span>
    </Tag>
  );
}
