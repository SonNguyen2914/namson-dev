// App chrome for the bet-suggester: a sticky glass top bar with wayfinding
// chips, skeleton loaders so data-heavy sections show structure (never a
// bare "Loading…"), fold-away sections, quiet toasts for silent actions,
// a route-change progress sweep, and a scroll-spy so the chip for the
// section you're reading lights up.
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";

export function TopBar({ back, title, children }: {
  back?: { href: string; label: string };
  title: ReactNode;
  children?: ReactNode;               // right side: nav chips / status
}) {
  return (
    <header className="topbar">
      <div className="mx-auto flex h-12 max-w-5xl items-center gap-4 px-5">
        {back && (
          <Link href={back.href} aria-label={back.label}
            className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-low transition-colors hover:text-accent">
            {/* arrow always; the label only where there's room (sm+),
                so the nav chip rail gets the full width on phones */}
            ←<span className="hidden sm:inline"> {back.label}</span>
          </Link>
        )}
        {/* Title is hidden on phones: the match-info card directly below
            already shows the matchup, so a truncated "RBNY …" here only
            stole room from the nav rail (leaving chips cut off). Shows
            again from sm+, where there's width for it. */}
        <div className="hidden min-w-0 truncate font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mid sm:block">
          {title}
        </div>
        {children && (
          // min-w-0 (NOT shrink-0): the chip rail must compress and scroll
          // within itself on phones — a rigid rail forced the whole page
          // wider than the viewport, horizontal-scrolling the entire app.
          // On mobile the title is hidden, so the rail gets the full width.
          <nav className="no-scrollbar ml-auto flex min-w-0 items-center gap-1.5 overflow-x-auto">
            {children}
          </nav>
        )}
      </div>
    </header>
  );
}

export function NavChip({ href, onClick, active, children }: {
  href?: string;
  onClick?: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  const cls = "whitespace-nowrap rounded-md border px-2 py-1 sm:px-2.5 " +
    "font-mono text-[10px] uppercase tracking-[0.14em] transition-colors " +
    (active
      ? "border-accent/50 bg-accent/10 text-accent"
      : "border-line text-ink-low hover:border-line-strong hover:text-ink-hi");
  return onClick
    ? <button onClick={onClick} className={cls}>{children}</button>
    : <a href={href} className={cls}>{children}</a>;
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
        <span className="min-w-0">
          {eyebrow && (
            <span className="mr-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-low">{eyebrow}</span>
          )}
          <span className="text-base font-medium text-ink-hi transition-colors group-hover:text-accent">{title}</span>
        </span>
        {!open && (
          <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">show</span>
        )}
      </button>
      {open && <div className="pt-5">{children}</div>}
    </div>
  );
}
