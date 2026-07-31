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

import { MarketVsReadInline, type MarketVsReadData }
  from "./MarketVsRead";
import { dayLabel, groupByDay } from "../lib/matchday";
import { Eyebrow } from "./ui";

type Side = { name?: string; crest?: string | null };
// Kept in step with the served payload. This drifted once already: after
// the backend renamed `elo` to `rating` (one field for two providers whose
// scales differ), this type still declared `elo` and had no `club` at all.
type SideRating = {
  club?: string; rated?: boolean; reason?: string; reason_words?: string;
  rating?: number; source?: string; scale?: string;
  provider_rank?: number | null;
  league_level?: string | null; country?: string | null;
};
type Strength = {
  available?: boolean;
  expected_points_share?: { home: number; away: number } | null;
  rating_difference?: number | null;
  elo_difference?: number | null;
  pair_confidence?: string; source?: string;
  home?: SideRating;
  away?: SideRating;
};
type KalshiOnly = {
  event_ticker: string; title?: string; means?: string;
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
  market_vs_read?: MarketVsReadData | null;
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

/** A compact club label for a narrow row: the most distinctive word, so
 *  "Borussia Dortmund" reads DORTMUND and "FC Augsburg" reads AUGSBURG
 *  rather than both collapsing to a generic prefix. */
function shortClub(name?: string) {
  if (!name) return "";
  const drop = new Set(["fc", "cf", "afc", "sc", "ac", "as", "ss", "ssc",
    "club", "cd", "sd", "ca", "fk", "sk", "bk", "if", "ks", "de", "the"]);
  const words = name.split(/[\s.]+/).filter((w) => w
    && !drop.has(w.toLowerCase().replace(/[^a-z]/g, "")));
  const pick = words.sort((a, b) => b.length - a.length)[0] || name;
  return pick.slice(0, 9).toUpperCase();
}

// The strength read, or the NAMED reason there isn't one. Never a blank,
// never a dash standing in for a number, and never a 50% default — an
// unreadable pairing has to look different from an even one.
//
// Each percentage carries its own club. A bare "20% / 80%" is unreadable
// on a row: nothing says which side is which, and the reader has to infer
// it from the fixture title above.
function StrengthCell({ s, home, away }: {
  s?: Strength; home?: string; away?: string;
}) {
  if (!s) return <span className="text-ink-faint">—</span>;
  if (!s.available || !s.expected_points_share) {
    const why = s.home?.rated === false ? s.home?.reason : s.away?.reason;
    return (
      <span className="font-mono text-[10px] text-ink-faint" title={
        s.home?.reason_words || s.away?.reason_words || ""}>
        {why === "name_ambiguous" ? "ambiguous name"
          : why === "provider_request_failed" ? "ratings unread"
            : "no strength read"}
      </span>
    );
  }
  const e = s.expected_points_share;
  const hi = e.home >= e.away;
  return (
    <span className="whitespace-nowrap font-mono text-[10px]">
      <span className={hi ? "text-accent" : "text-ink-low"}>
        {shortClub(s.home?.club || home)} {(e.home * 100).toFixed(0)}%
      </span>
      <span className="px-1 text-ink-faint">·</span>
      <span className={!hi ? "text-accent" : "text-ink-low"}>
        {(e.away * 100).toFixed(0)}% {shortClub(s.away?.club || away)}
      </span>
    </span>
  );
}

export default function AllFriendlies() {
  const [rows, setRows] = useState<Row[]>([]);
  const [meta, setMeta] = useState<{
    count?: number; registry?: boolean; finishedHidden?: number;
    kalshiTradeable?: number | null; kalshiListed?: number | null;
  }>({});
  const [kalshiOnly, setKalshiOnly] = useState<KalshiOnly[]>([]);
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
          setKalshiOnly(d.kalshi_only || []);
          setMeta({ count: d.count, registry: d.kalshi_registry_read,
            finishedHidden: d.finished_hidden,
            kalshiTradeable: d.kalshi_tradeable_total,
            kalshiListed: d.kalshi_listed_total });
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
  // groupByDay wants {id, date}; the row travels alongside so the render
  // does not have to look it up again.
  const groups = groupByDay(shown.map((r) => ({
    id: String(r.fixture_id), date: r.kickoff_utc || "", row: r,
  })).filter((x) => x.date));

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
          {meta.count ?? 0} upcoming · {ratedCount} with a strength read
          {meta.finishedHidden
            ? ` · ${meta.finishedHidden} finished hidden` : ""}
          {meta.kalshiTradeable != null
            ? ` · ${meta.kalshiTradeable} tradeable on kalshi` : ""}
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

      {/* Grouped by DAY, using the shared matchday rules rather than a
          fourth copy of them — a flat 312-row table is unreadable, and the
          day boundary is the thing a reader actually navigates by. */}
      {groups.map(({ key, list }) => (
        <div key={key} className="mt-6">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              {dayLabel(list[0].date)}
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              {list.length} {list.length === 1 ? "match" : "matches"}
            </span>
          </div>
          <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {list.map(({ row: r }) => (
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
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-right">
                  {r.kalshi?.state === "bridged" && (
                    <span className="rounded border border-accent/40 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-accent">
                      book
                    </span>
                  )}
                  <StrengthCell s={r.strength} home={r.home?.name}
                    away={r.away?.name} />
                  <MarketVsReadInline d={r.market_vs_read} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
      {!groups.length && !err && (
        <p className="mt-4 rounded-xl border border-line px-4 py-6 text-center font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          no upcoming friendlies in this window
        </p>
      )}

      {/* Tradeable markets our fixture feed could not match. Shown rather
          than dropped: this section claims to cover what the venue is
          pricing, so an event it prices must not vanish because
          API-Football lacks the club. */}
      {!!kalshiOnly.length && (
        <div className="mt-8">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
            tradeable on kalshi · no fixture matched
          </h3>
          <div className="mt-2 divide-y divide-line overflow-hidden rounded-xl border border-line">
            {kalshiOnly.map((k) => (
              <div key={k.event_ticker} className="px-4 py-3">
                <div className="truncate text-sm text-ink-mid">
                  {k.title || k.event_ticker}
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                  {k.event_ticker}
                </div>
                {k.means && (
                  <p className="mt-1 font-mono text-[10px] leading-relaxed text-ink-faint">
                    {k.means}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-4 font-mono text-[10px] leading-relaxed text-ink-faint">
        strength read = an expected POINTS SHARE (draws counted as half)
        from clubelo.com or worldclubratings.com, whichever covers both
        clubs — not a win probability, not a forecast, not a model output.
        Unrated clubs say why rather than showing a number.
      </p>
      {meta.kalshiListed != null && meta.kalshiTradeable != null && (
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
          kalshi carries {meta.kalshiListed} club-friendly events in total,
          but only {meta.kalshiTradeable} have an open market — the rest are
          settled past matches. Only the second number is a count of things
          you could bet on now.
        </p>
      )}
      <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
        finished and cancelled matches are excluded: the fixture sweep is
        date-scoped, so without that filter the previous day&apos;s results
        sat at the top of the list.
      </p>
    </section>
  );
}
