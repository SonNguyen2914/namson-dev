// THE TRIVELA WORDMARK — type, and one small gold mark.
//
// A trivela is a ball struck with the outside of the foot, so it swerves
// AWAY from where it was aimed. The mark is that path: a low line that
// bends late, and the ball at the end of it. It is the only gold on the
// page outside the call to action, because gold is the brand and never a
// verdict (globals.css, the accent token).
//
// The letters are Archivo at the top of its width axis — the board's own
// display face, opened right out — so the name reads as a broadcast
// caption rather than a logo lock-up. The favicon (public/icon.svg) is
// this mark alone.

export function Mark({ size = 18, className = "" }: {
  size?: number; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width={size} height={size}
      className={className} style={{ overflow: "visible" }}>
      <path d="M2.5 19.5 C 9 19.5, 15.5 17, 18.2 8.6" fill="none"
        stroke="var(--accent)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="19.2" cy="5.2" r="3.1" fill="var(--accent)" />
    </svg>
  );
}

export function Wordmark({ size = "sm", as = "span" }: {
  size?: "sm" | "lg"; as?: "span" | "p" }) {
  const Tag = as;
  const lg = size === "lg";
  return (
    <Tag data-testid="wordmark"
      className="inline-flex items-center whitespace-nowrap text-ink-hi"
      style={{ gap: lg ? "0.5em" : "0.45em" }}>
      <Mark size={lg ? 34 : 14} />
      <span
        style={{
          // not var(--font-archivo): that token is invalid at :root (it
          // references a Geist variable defined lower down), so it
          // silently falls back to Geist. Named here, it resolves.
          fontFamily: '"Archivo Variable", var(--font-geist-sans), sans-serif',
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
