// THE CONSOLE'S PRIMITIVES (redesign, 2026-10-07).
//
// Only the abstractions that remove repetition: the panel a region sits
// in, a metric, a utilisation bar, the status and decision badges, the
// freshness line, the empty / error / stale notes, the inspector drawer,
// a ranked bar list, the technical-value style and the formatters.
//
// THE TYPE SCALE, in one place: view title 18/600 · section title 13/600
// · metric value 20 (lg) / 15 (md) tabular · label 11 uppercase 0.08em ·
// body 13 · table primary 13 / secondary 11.5 · technical 11 mono.
//
// THE COLOUR RULE: ink does the talking; green / amber / red only for a
// state (healthy, degraded, broken) or a signed money value, and always
// with a word or a shape beside it; gold only for the active view, the
// selected row and focus.
import {
  type ReactNode, useEffect, useId, useRef,
} from "react";
import type { Badge } from "../../lib/consoleModel";

// ------------------------------------------------------------ formatters

export const DASH = "—";
const n2 = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const x = Number(v);
    return Number.isFinite(x) ? x : null;
  }
  return null;
};
export const numOf = n2;

/** $1,234.56 · −$0.40 · +$1.20 (signed) */
export function usd(v: unknown, signed = false): string {
  const n = n2(v);
  if (n === null) return DASH;
  const sign = n < 0 ? "−" : signed && n > 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function count(v: unknown): string {
  const n = n2(v);
  return n === null ? DASH : n.toLocaleString("en-US");
}
export function pct0(share: number | null): string {
  return share === null ? DASH : `${Math.round(share * 100)}%`;
}
/** "7s", "3m 12s", "2h 4m", "3d" */
export function ago(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h}h ${m % 60}m` : `${Math.floor(h / 24)}d`;
}
export function agoIso(iso: unknown, now: number): string | null {
  if (typeof iso !== "string" || iso === "") return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? ago(now - t) : null;
}
/** "Oct 7, 14:05" local */
export function when(iso: unknown, seconds = false): string {
  if (typeof iso !== "string" || iso === "") return DASH;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString([], {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
  });
}
/** "14:05:09" local */
export function clockTime(iso: unknown): string {
  if (typeof iso !== "string" || iso === "") return DASH;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export const pnlTone = (v: unknown): string => {
  const n = n2(v);
  return n === null || n === 0 ? "text-ink-hi" : n > 0 ? "text-up" : "text-neg";
};

// ------------------------------------------------------------- regions

export function Panel({ title, meta, actions, children, testid, id, className = "",
  bodyClass = "", tone }: {
  title?: ReactNode; meta?: ReactNode; actions?: ReactNode; children: ReactNode;
  testid?: string; id?: string; className?: string; bodyClass?: string;
  /** a control area is drawn apart from data panels */
  tone?: "control";
}) {
  const hid = useId();
  return (
    <section data-testid={testid} id={id} aria-labelledby={title ? hid : undefined}
      className={`min-w-0 rounded-lg border bg-tc-panel ${tone === "control"
        ? "border-tc-line-strong" : "border-tc-line"} ${className}`}>
      {(title || actions || meta) && (
        <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-tc-line px-4 py-2.5">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
            {title && (
              <h2 id={hid} className="text-[13px] font-semibold tracking-[-0.005em] text-ink-hi">{title}</h2>
            )}
            {meta && <div className="text-[11.5px] text-ink-low">{meta}</div>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClass || "px-4 py-3"}>{children}</div>
    </section>
  );
}

export function SubHead({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2 mt-1 flex items-baseline justify-between gap-3">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-low">{children}</h3>
      {right && <div className="text-[11px] text-ink-faint">{right}</div>}
    </div>
  );
}

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`text-[11px] font-medium uppercase tracking-[0.08em] text-ink-low ${className}`}>
      {children}
    </span>
  );
}

/** A metric: label over value, a unit or source line under it. */
export function Metric({ label, value, sub, tone = "text-ink-hi", size = "md", testid, cls }: {
  label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: string;
  size?: "lg" | "md" | "sm"; testid?: string;
  /** the value's class (account / agent / learning), said under the label */
  cls?: "account" | "agent" | "learning" | "config";
}) {
  const sz = size === "lg" ? "text-[22px] leading-7" : size === "md"
    ? "text-[16px] leading-6" : "text-[13px] leading-5";
  return (
    <div data-testid={testid} className="min-w-0">
      <div className="flex items-center gap-1.5">
        <Label>{label}</Label>
        {cls && <ClassTag cls={cls} />}
      </div>
      <div className={`tc-num mt-0.5 font-medium ${sz} ${tone}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[11.5px] leading-snug text-ink-low">{sub}</div>}
    </div>
  );
}

const CLASS_WORDS: Record<string, [string, string]> = {
  account: ["ACCT", "Account-wide: Kalshi's figure for the whole account, Son's manual trades included"],
  agent: ["AGENT", "The trading agent's own bookkeeping — what the halts measure"],
  learning: ["LEARN", "A learning signal: experimental, unproven"],
  config: ["CFG", "Configuration on the backend service"],
};
export function ClassTag({ cls }: { cls: keyof typeof CLASS_WORDS }) {
  const [w, t] = CLASS_WORDS[cls];
  return (
    <span title={t} className="rounded-[3px] border border-tc-line-strong px-1 font-mono text-[9px] leading-[14px] tracking-[0.06em] text-ink-low">
      {w}<span className="sr-only"> — {t}</span>
    </span>
  );
}

// ------------------------------------------------------------- risk bar

/** USED AGAINST A LIMIT. The backend's daily loss and drawdown are
 *  POSITIVE for a loss and NEGATIVE after a settled gain (risk.py
 *  halt_loss), so a negative `used` is a gain: it spends none of the
 *  limit, draws an empty bar and is said as "+$X up". Below 50 % the bar is
 *  ink; 50–80 % amber; 80 %+ red — with the percentage in words beside it. */
export function RiskBar({ label, used, limit, testid, sub, gainAware = true, cls }: {
  label: ReactNode; used: unknown; limit: unknown; testid?: string; sub?: ReactNode;
  gainAware?: boolean; cls?: "account" | "agent" | "learning" | "config";
}) {
  const u = n2(used);
  const l = n2(limit);
  const share = u !== null && l !== null && l > 0 ? (u <= 0 ? 0 : Math.min(1, u / l)) : null;
  const gain = gainAware && u !== null && u < 0;
  const fill = share === null ? "bg-line-strong"
    : share >= 0.8 ? "bg-neg" : share >= 0.6 ? "bg-ink-hi/80" : "bg-ink-mid";
  const word = share === null ? null : share >= 1 ? "at limit" : share >= 0.8 ? "near limit" : null;
  return (
    <div data-testid={testid} className="min-w-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="flex items-center gap-1.5">
          <Label>{label}</Label>
          {cls && <ClassTag cls={cls} />}
        </span>
        <span className="tc-num whitespace-nowrap text-[13px] text-ink-hi">
          {gain ? <span className="text-up">+{usd(-(u as number))} up</span> : usd(used)}
          <span className="text-ink-faint"> of </span>{usd(limit)}
          {share !== null && (
            <span className={`ml-1.5 ${share >= 0.8 ? "text-neg" : "text-ink-low"}`}>
              {Math.round(share * 100)}%
            </span>
          )}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-tc-raised" role="meter"
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={share === null ? undefined : Math.round(share * 100)}
        aria-label={typeof label === "string" ? label : undefined}>
        <div className={`h-full ${fill}`} style={{ width: `${share === null ? 0 : share * 100}%` }} />
      </div>
      {(sub || word) && (
        <div className="mt-1 text-[11.5px] leading-snug text-ink-low">
          {word && <span className="text-neg">■ {word}{sub ? " · " : ""}</span>}
          {sub}
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------- statuses

export type State = "ok" | "warn" | "bad" | "off" | "info";
const STATE_DOT: Record<State, string> = {
  ok: "bg-up", warn: "bg-warn", bad: "bg-neg", off: "bg-ink-faint", info: "bg-ink-mid",
};
const STATE_TEXT: Record<State, string> = {
  ok: "text-ink-hi", warn: "text-warn", bad: "text-neg", off: "text-ink-low", info: "text-ink-hi",
};

/** A dot that changes SHAPE with severity (never colour alone): a filled
 *  circle is fine, a ring is off, a diamond is degraded, a square is
 *  broken. */
export function Dot({ state }: { state: State }) {
  const shape = state === "warn" ? "rotate-45 rounded-[1px]" : state === "bad"
    ? "rounded-[1px]" : state === "off" ? "rounded-full bg-transparent ring-1 ring-ink-faint" : "rounded-full";
  return <span aria-hidden className={`inline-block h-[7px] w-[7px] shrink-0 ${state === "off" ? "" : STATE_DOT[state]} ${shape}`} />;
}

export function StatusPill({ state, label, value, title, testid, href }: {
  state: State; label: string; value: ReactNode; title?: string; testid?: string; href?: string;
}) {
  const body = (
    <>
      <Dot state={state} />
      <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-low">{label}</span>
      <span className={`tc-num text-[12px] font-medium ${STATE_TEXT[state]}`}>{value}</span>
    </>
  );
  const cls = `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-1 ${
    state === "bad" ? "bg-neg/10" : state === "warn" ? "bg-warn/[0.07]" : ""}`;
  return href ? (
    <a href={href} data-testid={testid} title={title} data-state={state}
      className={`${cls} outline-none transition-colors hover:bg-tc-hover focus-visible:ring-2 focus-visible:ring-accent`}>{body}</a>
  ) : (
    <span data-testid={testid} title={title} data-state={state} className={cls}>{body}</span>
  );
}

const BADGE_CLS: Record<Badge["tone"], string> = {
  placed: "border-ink-hi/50 bg-ink-hi/[0.06] text-ink-hi",
  neutral: "border-tc-line-strong text-ink-mid",
  muted: "border-tc-line text-ink-low",
  caution: "border-warn/45 text-warn",
  danger: "border-neg/55 bg-neg/[0.08] text-neg",
};
const BADGE_ICON: Record<Badge["tone"], string> = {
  placed: "●", neutral: "○", muted: "·", caution: "◆", danger: "■",
};

export function DecisionBadge({ badge, side, testid = "cand-action" }: {
  badge: Badge; side?: string | null; testid?: string;
}) {
  return (
    <span data-testid={testid} data-badge={badge.key}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-[4px] border px-1.5 py-[1px] text-[11px] font-medium leading-4 ${BADGE_CLS[badge.tone]}`}>
      <span aria-hidden className="text-[8px] leading-none">{BADGE_ICON[badge.tone]}</span>
      {badge.label}{side ? ` · ${side}` : ""}
    </span>
  );
}

// ------------------------------------------------------------- freshness

export function Freshness({ at, now, cadenceMs, failed, testid, label }: {
  at: number | null; now: number; cadenceMs: number; failed?: boolean;
  testid?: string; label?: string;
}) {
  if (at === null) {
    return <span data-testid={testid} className="text-[11.5px] text-ink-low">{failed ? "read failed" : "reading…"}</span>;
  }
  const age = Math.max(0, now - at);
  const stale = age > 3 * cadenceMs;
  const state: State = failed ? "bad" : stale ? "warn" : "ok";
  return (
    <span data-testid={testid} data-stale={stale || undefined}
      className={`tc-num inline-flex items-center gap-1.5 whitespace-nowrap text-[11.5px] ${
        failed ? "text-neg" : stale ? "text-warn" : "text-ink-low"}`}
      title={`read ${new Date(at).toLocaleTimeString()} · refreshed every ${cadenceMs / 1000} s`}>
      <Dot state={state} />
      {label ? `${label} · ` : ""}
      {failed ? `last read failed · data ${ago(age)} old`
        : stale ? `stale · ${ago(age)}` : `live · ${ago(age)} ago`}
    </span>
  );
}

// ---------------------------------------------------------------- notes

export function EmptyNote({ children, testid, why }: { children: ReactNode; testid?: string; why?: string }) {
  return (
    <p data-testid={testid} data-why={why}
      className="rounded-md border border-dashed border-tc-line px-3 py-3 text-[12.5px] text-ink-low">
      {children}
    </p>
  );
}

export function ErrorNote({ children, testid, tone = "neg" }: {
  children: ReactNode; testid?: string; tone?: "neg" | "warn";
}) {
  return (
    <p data-testid={testid} role="alert"
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-[12.5px] leading-snug ${tone === "neg"
        ? "border-neg/40 bg-neg/[0.06] text-neg" : "border-warn/40 bg-warn/[0.05] text-warn"}`}>
      <span aria-hidden className="mt-[1px] font-mono text-[11px]">{tone === "neg" ? "■" : "◆"}</span>
      <span className="min-w-0">{children}</span>
    </p>
  );
}

export function InfoNote({ children, testid, tone = "low" }: {
  children: ReactNode; testid?: string; tone?: "low" | "warn";
}) {
  return (
    <p data-testid={testid} className={`text-[12px] leading-snug ${tone === "warn" ? "text-warn" : "text-ink-low"}`}>
      {children}
    </p>
  );
}

/** A technical value: mono, small, the full value on hover and focus. */
export function Tech({ children, title, className = "", tone = "text-ink-low" }: {
  children: ReactNode; title?: string; className?: string; tone?: string;
}) {
  return (
    <span title={title ?? (typeof children === "string" ? children : undefined)}
      tabIndex={title || typeof children === "string" ? 0 : undefined}
      className={`font-mono text-[11px] ${tone} outline-none focus-visible:text-ink-hi ${className}`}>
      {children}
    </span>
  );
}

/** One disclosure for the technical depth: raw codes, versions, bases. */
export function Disclosure({ summary, children, testid, defaultOpen = false }: {
  summary: ReactNode; children: ReactNode; testid?: string; defaultOpen?: boolean;
}) {
  return (
    <details data-testid={testid} open={defaultOpen} className="group mt-2">
      <summary className="flex cursor-pointer select-none list-none items-center gap-1.5 text-[11.5px] text-ink-low outline-none hover:text-ink-mid focus-visible:text-ink-hi [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="inline-block text-[9px] transition-transform group-open:rotate-90">▶</span>
        {summary}
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

// ---------------------------------------------------------- key / value

export function KV({ k, children, testid, field }: {
  k: ReactNode; children: ReactNode; testid?: string; field?: string;
}) {
  return (
    <div data-testid={testid} data-field={field}
      className="grid grid-cols-[minmax(110px,38%)_1fr] gap-x-3 border-b border-tc-line py-1.5 last:border-b-0">
      <dt className="text-[11.5px] text-ink-low">{k}</dt>
      <dd className="tc-num min-w-0 break-words text-[12.5px] text-ink-hi">{children}</dd>
    </div>
  );
}

// ---------------------------------------------------------------- drawer

/** THE INSPECTOR: a right-side drawer over the view, not a page. Esc and
 *  the close button close it; focus moves in on open and back to what
 *  opened it on close; the view under it keeps its scroll. */
export function Drawer({ open, onClose, title, subtitle, children, testid, width = 560 }: {
  open: boolean; onClose: () => void; title: ReactNode; subtitle?: ReactNode;
  children: ReactNode; testid?: string; width?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const opener = useRef<Element | null>(null);
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    ref.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      const o = opener.current as HTMLElement | null;
      if (o && typeof o.focus === "function" && document.contains(o)) o.focus({ preventScroll: true });
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="presentation">
      <button type="button" aria-label="Close the inspector" tabIndex={-1} onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40" />
      <div ref={ref} role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : "inspector"}
        tabIndex={-1} data-testid={testid}
        className="tc-drawer tc-scroll relative flex h-full w-full flex-col overflow-y-auto border-l border-tc-line-strong bg-tc-panel shadow-2xl outline-none"
        style={{ maxWidth: width }}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-tc-line bg-tc-panel px-5 py-3">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold leading-snug text-ink-hi">{title}</div>
            {subtitle && <div className="mt-0.5 text-[12px] text-ink-low">{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} data-testid="drawer-close"
            className="shrink-0 rounded-md border border-tc-line-strong px-2 py-1 text-[12px] text-ink-mid outline-none hover:bg-tc-hover focus-visible:ring-2 focus-visible:ring-accent">
            Close <span className="text-ink-faint">Esc</span>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

export function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-low">{title}</h3>
      <dl>{children}</dl>
    </section>
  );
}

// ---------------------------------------------------------------- inputs

export const CTRL = "h-8 rounded-md border border-tc-line-strong bg-tc-raised px-2 text-[12.5px] text-ink-hi outline-none transition-colors hover:border-ink-faint focus-visible:ring-2 focus-visible:ring-accent";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-ink-low">{label}</span>
      {children}
    </label>
  );
}

export function FilterButton({ pressed, onClick, children, testid, data, title }: {
  pressed: boolean; onClick: () => void; children: ReactNode; testid?: string;
  data?: Record<string, string>; title?: string;
}) {
  return (
    <button type="button" aria-pressed={pressed} data-testid={testid} onClick={onClick} title={title}
      {...data}
      className={`tc-num h-7 whitespace-nowrap rounded-md border px-2 text-[12px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
        pressed ? "border-accent/60 bg-accent/[0.08] text-ink-hi" : "border-tc-line text-ink-mid hover:border-tc-line-strong hover:text-ink-hi"}`}>
      {children}
    </button>
  );
}

// ------------------------------------------------------------ bar lists

export interface BarItem {
  key: string; label: ReactNode; sub?: ReactNode; value: number;
  display: ReactNode; tone?: "ink" | "up" | "neg" | "warn"; onClick?: () => void;
  testid?: string; data?: Record<string, string>;
}

/** RANKED HORIZONTAL BARS: label left, value right, the bar under the
 *  label scaled to the largest |value|. Clickable when it filters. */
export function BarList({ items, testid, signed = false, scaleMax, dense = false }: {
  items: BarItem[]; testid?: string; signed?: boolean;
  /** scale against this instead of the list's own largest (lists that share an axis) */
  scaleMax?: number; dense?: boolean;
}) {
  const max = Math.max(1e-9, scaleMax ?? 0, ...items.map((i) => Math.abs(i.value)));
  return (
    <ol data-testid={testid} className={dense ? "space-y-0" : "space-y-1"}>
      {items.map((it) => {
        const w = `${(Math.abs(it.value) / max) * (signed ? 50 : 100)}%`;
        const fill = it.tone === "up" ? "bg-up/70" : it.tone === "neg" ? "bg-neg/70"
          : it.tone === "warn" ? "bg-warn/70" : "bg-ink-mid/50";
        const inner = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 text-left text-[12.5px] leading-snug text-ink-hi">{it.label}</span>
              <span className="tc-num shrink-0 text-[12.5px] text-ink-hi">{it.display}</span>
            </div>
            {it.sub && <div className="text-left text-[11px] leading-snug text-ink-low">{it.sub}</div>}
            <div className="relative mt-1 h-1 rounded-full bg-tc-raised">
              {signed && <div className="absolute inset-y-[-2px] left-1/2 w-px bg-ink-faint" />}
              <div className={`absolute inset-y-0 rounded-full ${fill}`}
                style={signed ? (it.value >= 0 ? { left: "50%", width: w } : { right: "50%", width: w })
                  : { left: 0, width: w }} />
            </div>
          </>
        );
        return (
          <li key={it.key} data-testid={it.testid} {...it.data}>
            {it.onClick ? (
              <button type="button" onClick={it.onClick}
                className={`block w-full rounded-md px-2 ${dense ? "py-1" : "py-1.5"} outline-none transition-colors hover:bg-tc-hover focus-visible:ring-2 focus-visible:ring-accent`}>
                {inner}
              </button>
            ) : <div className={`px-2 ${dense ? "py-1" : "py-1.5"}`}>{inner}</div>}
          </li>
        );
      })}
    </ol>
  );
}

// ------------------------------------------------------------- the table

export const TH = "border-b border-tc-line px-3 py-2 text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-low whitespace-nowrap";
export const TD = "border-b border-tc-line px-3 py-2 align-top";

/** A plain dense table for small read-only blocks. */
export function SimpleTable({ head, rows, empty, testid, right = [], minWidth }: {
  head: string[]; rows: ReactNode[][]; empty: string; testid?: string;
  /** indices of numeric (right-aligned) columns */
  right?: number[]; minWidth?: number;
}) {
  if (rows.length === 0) {
    return <p data-testid={testid} className="text-[12px] text-ink-low">{empty}</p>;
  }
  const R = new Set(right);
  return (
    <div className="tc-scroll overflow-x-auto">
      <table data-testid={testid} className="w-full border-collapse text-[12.5px]"
        style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={`${h}-${i}`} scope="col" className={`${TH} ${R.has(i) ? "text-right" : "text-left"} first:pl-0 last:pr-0`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, i) => (
                <td key={i} className={`${TD} first:pl-0 last:pr-0 ${R.has(i) ? "tc-num text-right text-ink-hi" : "text-ink-mid"}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
