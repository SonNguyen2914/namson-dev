// UEFA Europa Conference League hub.
//
// Deliberately NOT shaped like the EPL / Liga MX / MLS hubs, because the
// competition is not shaped like a league. Those pages centre a model's
// odds board; this one has no model and cannot honestly have one — measured
// on the 2025 edition, the median club played 4 matches and only 53 of 164
// reached the 5-match floor a fitted rating needs, so a model built on this
// competition's own fixtures would refuse two thirds of its participants.
// That is permanent: it is the shape of a four-round qualifying cup.
//
// So the centre of this page is the market and the cross-league strength
// read, and the missing model is stated with its numbers rather than left
// as an empty board that looks broken.
import Head from "next/head";
import { useEffect, useState } from "react";

import { RouteProgress, TopBar } from "../../components/chrome";
import { Eyebrow, Reveal } from "../../components/ui";
import { dayLabel, groupByDay } from "../../lib/matchday";

type SideRating = {
  club?: string; rated?: boolean; reason?: string; reason_words?: string;
  rating?: number; source?: string; scale?: string;
  provider_rank?: number | null; country?: string | null;
  league_level?: string | null; match_tier?: string;
};
type Strength = {
  available?: boolean;
  expected_points_share?: { home: number; away: number } | null;
  rating_difference?: number | null;
  elo_difference?: number | null;
  pair_confidence?: string; source?: string;
  expectation_divisor?: number;
  home?: SideRating; away?: SideRating;
};
type Fixture = {
  fixture_id: number; kickoff_utc?: string; status?: string;
  status_long?: string; elapsed?: number | null; round?: string | null;
  venue?: string | null;
  home: { name?: string; crest?: string | null };
  away: { name?: string; crest?: string | null };
  goals?: { home: number | null; away: number | null };
  strength?: Strength;
};
type Payload = {
  display?: string; count?: number; with_strength_read?: number;
  fixtures?: Fixture[];
  model?: {
    state?: string; why?: string; instead?: string;
    measured?: Record<string, number>;
  };
  framing?: string;
};
type Markets = {
  status?: string; series?: string; means?: string;
  listed_events?: number; tradeable_events?: number;
};

const VARS = {
  "--accent": "#7dd3fc",
  "--accent-dim": "rgba(125,211,252,0.35)",
  "--accent-faint": "rgba(125,211,252,0.10)",
} as React.CSSProperties;

function when(f: Fixture) {
  if (f.status === "1H" || f.status === "2H" || f.status === "HT") {
    return `LIVE ${f.elapsed ?? ""}'`;
  }
  if (!f.kickoff_utc) return "";
  const d = new Date(f.kickoff_utc);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString(undefined, {
    hour: "numeric", minute: "2-digit",
  });
}


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

/** The strength read, or the NAMED reason there is none — never a blank and
 *  never a 50% stand-in. Each percentage carries its own club, because a
 *  bare "71% / 29%" on a row does not say which side is which. */
function Read({ s, home, away }: {
  s?: Strength; home?: string; away?: string;
}) {
  const e = s?.expected_points_share;
  if (!e) {
    const why = s?.home?.rated === false ? s?.home?.reason : s?.away?.reason;
    return (
      <span className="font-mono text-[10px] text-ink-faint"
        title={s?.home?.reason_words || s?.away?.reason_words || ""}>
        {why === "name_ambiguous" ? "ambiguous name" : "no read"}
      </span>
    );
  }
  const hi = e.home >= e.away;
  return (
    <span className="whitespace-nowrap font-mono text-[10px]">
      <span className={hi ? "text-accent" : "text-ink-low"}>
        {shortClub(s?.home?.club || home)} {(e.home * 100).toFixed(0)}%
      </span>
      <span className="px-1 text-ink-faint">·</span>
      <span className={!hi ? "text-accent" : "text-ink-low"}>
        {(e.away * 100).toFixed(0)}% {shortClub(s?.away?.club || away)}
      </span>
    </span>
  );
}

export default function EclHub() {
  const [d, setD] = useState<Payload | null>(null);
  const [mk, setMk] = useState<Markets | null>(null);
  const [days, setDays] = useState(8);
  const [onlyRated, setOnlyRated] = useState(false);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch(`/api/ecl/fixtures?days=${days}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j) => { if (alive) { setD(j); setErr(false); } })
        .catch(() => alive && setErr(true));
      fetch("/api/ecl/markets")
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j) => alive && setMk(j))
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, [days]);

  const all = d?.fixtures || [];
  const shown = onlyRated ? all.filter((f) => f.strength?.available) : all;
  const ratedCount = all.filter((f) => f.strength?.available).length;
  const groups = groupByDay(shown
    .map((f) => ({ id: String(f.fixture_id), date: f.kickoff_utc || "", f }))
    .filter((x) => x.date));
  const m = d?.model?.measured || {};

  return (
    <div style={VARS} className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head>
        <title>Conference League · market viewer · namson.dev</title>
      </Head>
      <RouteProgress />
      <TopBar back={{ href: "/bet-suggester", label: "board" }}
        title="Conference League · market viewer" />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-10">
        <Eyebrow>uefa europa conference league · viewer</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-hi">
          A cup, not a league
        </h1>

        {/* The missing model, stated with the numbers that justify it. An
            empty odds board with no explanation reads as broken; this is a
            deliberate refusal and should read as one. */}
        <section className="mt-8 rounded-2xl border border-line bg-elev p-5">
          <Eyebrow tone="accent">no model · by design</Eyebrow>
          <p className="mt-3 text-sm leading-relaxed text-ink-low">
            This competition gets no model and no shadow odds, and that is a
            measured decision rather than unfinished work. A fitted rating
            needs {m.min_games ?? 5} matches of history per club. On the{" "}
            {m.season ?? 2025} edition:
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["clubs", m.clubs],
              ["median matches each", m.median_matches_per_club],
              [`clubs at ${m.min_games ?? 5}+`, m.clubs_at_or_above_min_games],
              ["fixtures", m.fixtures],
            ].map(([k, v]) => (
              <div key={String(k)}
                className="rounded-xl border border-line px-3 py-2">
                <dt className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
                  {k}
                </dt>
                <dd className="mt-1 font-mono text-xl text-accent">
                  {v ?? "—"}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">
            {d?.model?.why}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
            {d?.model?.instead}
          </p>
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wide">
          <span className="text-ink-faint">
            {d?.count ?? 0} fixtures · {ratedCount} with a strength read
            {mk?.tradeable_events != null
              ? ` · ${mk.tradeable_events} tradeable on kalshi` : ""}
          </span>
          <button onClick={() => setOnlyRated((v) => !v)}
            className={`rounded-md border px-2 py-1 ${onlyRated
              ? "border-accent/50 text-accent" : "border-line text-ink-faint"}`}>
            {onlyRated ? `rated only · ${ratedCount}` : `all ${d?.count ?? 0}`}
          </button>
          {[2, 4, 8, 14].map((n) => (
            <button key={n} onClick={() => setDays(n)}
              className={`rounded-md border px-2 py-1 ${days === n
                ? "border-accent/50 text-accent" : "border-line text-ink-faint"}`}>
              {n}d
            </button>
          ))}
        </div>

        {err && !d && (
          <p className="mt-6 font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            fixtures unavailable — retrying every 60s
          </p>
        )}

        {groups.map(({ key, list }) => (
          <Reveal key={key}>
            <div className="mt-6">
              <div className="mb-2 flex items-baseline justify-between">
                <h3 className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
                  {dayLabel(list[0].date)}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                  {list.length} {list.length === 1 ? "match" : "matches"}
                </span>
              </div>
              <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                {list.map(({ f }) => (
                  <div key={f.fixture_id}
                    className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-ink-hi">
                        {f.home?.name} <span className="text-ink-faint">v</span>{" "}
                        {f.away?.name}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                        {when(f)}
                        {/* the round is load-bearing here: most of this
                            competition is qualifying, and a 2nd-round tie
                            is not a league-stage match */}
                        {f.round ? ` · ${f.round}` : ""}
                        {f.venue ? ` · ${f.venue}` : ""}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Read s={f.strength} home={f.home?.name} away={f.away?.name} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}

        {!groups.length && !err && (
          <p className="mt-6 rounded-xl border border-line px-4 py-6 text-center font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            no upcoming conference league fixtures in this window
          </p>
        )}

        <details className="mt-10 rounded-xl border border-line bg-elev">
          <summary className="cursor-pointer px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            what these numbers are, and are not
          </summary>
          <div className="space-y-2 px-4 pb-4 font-mono text-[10px] leading-relaxed text-ink-faint">
            <p>{d?.framing}</p>
            <p>
              The strength read is an EXTERNAL, unevaluated orientation
              figure from clubelo.com or worldclubratings.com — whichever
              covers both clubs. It is an expected POINTS share with draws
              counted as half, not a win probability, and it carries no draw
              number. It is not a forecast and not a model output.
            </p>
            <p>
              A club&apos;s strength here comes from its DOMESTIC league, not
              from its handful of Conference League matches — which is
              exactly why this instrument fits where a fitted model does not.
            </p>
            {mk?.listed_events != null && mk?.tradeable_events != null && (
              <p>
                Kalshi {mk.series} carries {mk.listed_events} events in
                total but only {mk.tradeable_events} have an open market;
                the rest are settled.
              </p>
            )}
          </div>
        </details>
      </main>
    </div>
  );
}
