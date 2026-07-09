// App chrome for the bet-suggester: a sticky glass top bar with wayfinding
// chips, and skeleton loaders so data-heavy sections show structure (never a
// bare "Loading…") while they fetch.
import Link from "next/link";
import { ReactNode, useState } from "react";

export function TopBar({ back, title, children }: {
  back?: { href: string; label: string };
  title: ReactNode;
  children?: ReactNode;               // right side: nav chips / status
}) {
  return (
    <header className="topbar">
      <div className="mx-auto flex h-12 max-w-5xl items-center gap-4 px-5">
        {back && (
          <Link href={back.href}
            className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-low transition-colors hover:text-accent">
            ← {back.label}
          </Link>
        )}
        <div className="min-w-0 truncate font-mono text-[11px] uppercase tracking-[0.2em] text-ink-mid">
          {title}
        </div>
        {children && (
          <nav className="no-scrollbar ml-auto flex shrink-0 items-center gap-1.5 overflow-x-auto">
            {children}
          </nav>
        )}
      </div>
    </header>
  );
}

export function NavChip({ href, onClick, children }: {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  const cls = "whitespace-nowrap rounded-md border border-line px-2.5 py-1 " +
    "font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low " +
    "transition-colors hover:border-line-strong hover:text-ink-hi";
  return onClick
    ? <button onClick={onClick} className={cls}>{children}</button>
    : <a href={href} className={cls}>{children}</a>;
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
      <button onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-baseline gap-3 border-b border-line pb-2.5 text-left">
        <span className={`text-ink-faint transition-transform ${open ? "rotate-90" : ""}`}>▸</span>
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
