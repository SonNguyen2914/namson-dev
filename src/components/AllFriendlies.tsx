// Every club friendly in the window, clickable through to its own page.
//
// This is a SEPARATE surface from the board above it, on purpose. That one
// is fed by ESPN's club.friendly bucket, which is a curated subset —
// measured 2026-07-29 it could name 1 of 25 tradeable Kalshi events (4%).
// This one reads the date-scoped all-leagues API-Football sweep, which on
// 2026-07-30 returned 399 friendlies in a two-day window against that
// surface's 24.
//
// Every row is keyed by API-Football fixture id, the only identifier
// stable across ALL friendlies rather than the ESPN-visible subset, and
// that id is what the per-match route below takes.
import Link from "next/link";
import { useEffect, useState } from "react";

import { Eyebrow } from "./ui";

type Side = { name?: string; crest?: string | null };
type Strength = {
  available?: boolean;
  expected_points_share?: { home: number; away: number } | null;
  elo_difference?: number | null;
  pair_confidence?: string;
  home?: { rated?: boolean; reason?: string; reason_words?: string;
           elo?: number; league_level?: string | null;
           country?: string | null };
  away?: { rated?: boolean; reason?: string; reason_words?: string;
           elo?: number; league_level?: string | null;
           country?: string | null };
};
type Row = {
  fixture_id: number;
  kickoff_utc?: string;
  status?: string;
  elapsed?: number | null;
  league_name?: string;
  venue?: string | null;
  home: Side;
  away: Side;
  goals?: { home: number | null; away: number | null };
  kalshi?: { state?: string; event_ticker?: string; means?: string };
  strength?: Strength;
};

function when(r: Row) {
  if (r.status === "1H" || r.status === "2H" || r.status === "HT") {
    return `LIVE ${r.elapsed ?? ""}'`;
  }
  if (!r.kickoff_utc) return "";
  const d = new Date(r.kickoff_utc);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    weekday: "short", hour: "numeric", minute: "2-digit",
  });
}

// The strength read, or the NAMED reason there isn't one. Never a blank,
// never a dash standing in for a number, and never a 50% default — an
// unreadable pairing has to look different from an even one.
function StrengthCell({ s }: { s?: Strength }) {
  if (!s) return <span className="text-ink-faint">—</span>;
  if (!s.available || !s.expected_points_share) {
    const why = s.home?.rated === false ? s.home?.reason
      : s.away?.reason;
    return (
      <span className="font-mono text-[10px] text-ink-faint" title={
        s.home?.reason_words || s.away?.reason_words || ""}>
        {why === "clubelo_name_unmapped" ? "no elo match"
          : why === "clubelo_request_failed" ? "elo unread"
            : "no strength read"}
      </span>
    );
  }
  const e = s.expected_points_share;
  return (
    <span className="font-mono text-[11px] text-ink-hi">
      {(e.home * 100).toFixed(0)}% / {(e.away * 100).toFixed(0)}%
      {typeof s.elo_difference === "number" && (
        <span className="pl-1.5 text-ink-faint">
          ΔElo {s.elo_difference > 0 ? "+" : ""}{s.elo_difference.toFixed(0)}
        </span>
      )}
    </span>
  );
}

export default function AllFriendlies() {
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<{ count?: number; registry?: boolean }>({});
  const [err, setErr] = useState<string | null>(null);
  // Defaults to TRUE. Chronological order puts the obscure
  // fixtures first (reserve sides, third tiers), so opening on
  // "show all" meant the first screen was a wall of "no strength
  // read" even though 83 matches had one.
  const [onlyRated, setOnlyRated] = useState(true);
  const [days, setDays] = useState(2);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch(`/api/friendlies/fixtures?days=${days}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => {
          if (!alive) return;
          setRows(d.fixtures || []);
          setMeta({ count: d.count, registry: d.kalshi_registry_read });
          setErr(null);
        })
        .catch(() => alive && setErr("fixtures unavailable"));
    };
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, [days]);

  const shown = onlyRated
    ? rows.filter((r) => r.strength?.available)
    : rows;
  const ratedCount = rows.filter((r) => r.strength?.available).length;

  return (
    <section className="mt-14">
      <Eyebrow tone="accent">all friendlies · every match</Eyebrow>
      <h2 className="mt-3 text-xl text-ink-hi">Full slate</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-low">
        Every club friendly API-Football lists across the window — not just
        the ones a betting venue happens to price, and not just the ones
        ESPN&apos;s friendly bucket names. Tap any match for its own page.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wide">
        <span className="text-ink-faint">
          {meta.count ?? 0} matches · {ratedCount} with a strength read
        </span>
        <button onClick={() => setOnlyRated((v) => !v)}
          className={`rounded-md border px-2 py-1 ${onlyRated
            ? "border-accent/50 text-accent" : "border-line text-ink-faint"}`}>
          {onlyRated ? `rated only · ${ratedCount}` : `all ${meta.count ?? 0}`}
        </button>
        {[1, 2, 4, 8].map((d) => (
          <button key={d} onClick={() => setDays(d)}
            className={`rounded-md border px-2 py-1 ${days === d
              ? "border-accent/50 text-accent" : "border-line text-ink-faint"}`}>
            {d}d
          </button>
        ))}
        {meta.registry === false && (
          <span className="text-ink-faint">
            kalshi registry unread — listing state unknown, not &quot;unlisted&quot;
          </span>
        )}
      </div>

      {err && (
        <p className="mt-4 font-mono text-[11px] text-ink-faint">
          {err} — retrying every 60s
        </p>
      )}

      <div className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line">
        {shown.map((r) => (
          <Link key={r.fixture_id}
            href={`/bet-suggester/friendlies/${r.fixture_id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-elev">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-ink-hi">
                {r.home?.name} <span className="text-ink-faint">v</span>{" "}
                {r.away?.name}
              </div>
              <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                {when(r)}
                {r.league_name ? ` · ${r.league_name}` : ""}
                {r.venue ? ` · ${r.venue}` : ""}
                {r.kalshi?.state === "bridged" ? " · KALSHI BOOK" : ""}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <StrengthCell s={r.strength} />
            </div>
          </Link>
        ))}
        {!shown.length && !err && (
          <p className="px-4 py-6 text-center font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            no friendlies in this window
          </p>
        )}
      </div>

      <p className="mt-3 font-mono text-[10px] leading-relaxed text-ink-faint">
        strength read = clubelo.com Elo expectation, an EXPECTED POINTS
        SHARE with draws counted as half — not a win probability, not a
        forecast, and not a model output. Unrated clubs say why rather than
        showing a number.
      </p>
    </section>
  );
}
