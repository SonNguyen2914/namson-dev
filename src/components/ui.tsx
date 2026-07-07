// Small presentational primitives for the bet-suggester redesign.
//
// Reveal    — fade-up on scroll (IntersectionObserver, fires once).
// RevealRow — same idea for <tr>, opacity-only (transforms on table rows
//             are unreliable in Safari).
// Flash     — wraps a live number; pulses briefly when the value changes,
//             reinforcing "this is live". Respects prefers-reduced-motion
//             via the CSS keyframes it toggles.
// Eyebrow   — the mono uppercase micro-label used across both pages.
import {
  CSSProperties, ReactNode, useEffect, useRef, useState,
} from "react";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // No IO support — reveal on the next frame (async, so no sync
      // setState inside the effect body).
      const raf = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, inView };
}

export function Reveal({
  children, delay = 0, className = "",
}: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function RevealRow({
  children, delay = 0, className = "",
}: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLTableRowElement>();
  return (
    <tr
      ref={ref}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      className={`reveal-row ${inView ? "is-in" : ""} ${className}`}
    >
      {children}
    </tr>
  );
}

export function Flash({
  value, tone = "accent", className = "",
}: {
  value: string | number;
  tone?: "accent" | "live";
  className?: string;
}) {
  const prev = useRef(value);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (prev.current !== value) {
      prev.current = value;
      setFlashing(true);
      const t = setTimeout(() => setFlashing(false), 950);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span
      className={`${className} ${
        flashing ? (tone === "live" ? "flash-live" : "flash-accent") : ""
      }`}
    >
      {value}
    </span>
  );
}

export function Eyebrow({
  children, tone = "low", className = "",
}: {
  children: ReactNode;
  tone?: "accent" | "live" | "warn" | "sky" | "low";
  className?: string;
}) {
  const color =
    tone === "accent" ? "text-accent"
    : tone === "live" ? "text-live"
    : tone === "warn" ? "text-warn"
    : tone === "sky" ? "text-skylive"
    : "text-ink-low";
  return (
    <p className={`font-mono text-[11px] uppercase tracking-[0.22em] ${color} ${className}`}>
      {children}
    </p>
  );
}
