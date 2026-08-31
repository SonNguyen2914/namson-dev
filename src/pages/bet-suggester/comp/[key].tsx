// One page for every viewer competition — Champions League, Leagues Cup,
// ASEAN Championship.
//
// Five more were served here until 2026-08-24, when the operator retired
// Conference League, Europa League, Brasileirão, Liga Profesional
// Argentina and USL Championship. This page needed no per-competition
// edit for that: the registry is the backend's, and a retired key now
// answers 404 with the reason, which the not-served state below renders
// instead of retrying an outage that will never end.
//
// Deliberately ONE page rather than eight. The three league match pages in
// this repo are the cautionary tale: copied per league, they drifted apart
// on fee arithmetic and only one of them is correct. Everything that varies
// between these competitions — display name, accent, Kalshi series, and the
// reason there is no model — is served by the backend registry.
//
// These are NOT the league hubs. Those centre a model's odds board; this
// centres the market and the cross-league strength read, and states the
// missing model with the numbers behind it, because an empty odds board
// with no explanation is what reads as broken.
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ARCHIVE, ArchiveMenu } from "../../../components/ArchiveMenu";
import { RouteProgress, TopBar } from "../../../components/chrome";
import { Eyebrow, Reveal } from "../../../components/ui";
import MarketVsRead, { MarketVsReadInline, type MarketVsReadData }
  from "../../../components/MarketVsRead";
import TournamentView from "../../../components/TournamentView";
import { TZ, dayLabel, groupByDay } from "../../../lib/matchday";

type SideRating = {
  club?: string; rated?: boolean; reason?: string; reason_words?: string;
  rating?: number; source?: string; provider_rank?: number | null;
  country?: string | null; match_tier?: string;
};
type Strength = {
  available?: boolean;
  expected_points_share?: { home: number; away: number } | null;
  rating_difference?: number | null; elo_difference?: number | null;
  pair_confidence?: string; source?: string;
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
  market_vs_read?: MarketVsReadData | null;
  kalshi_event?: string | null;
  meaning?: {
    round?: string | null;
    tie?: { leg?: number; first_leg?: string; means?: string };
    stakes?: { means?: string; format?: string;
               home?: { played?: number; w?: number; d?: number;
                        d_shootout?: number;
                        l?: number; points?: number | null;
                        points_range?: number[] | null };
               away?: { played?: number; w?: number; d?: number;
                        d_shootout?: number;
                        l?: number; points?: number | null;
                        points_range?: number[] | null } };
  } | null;
  news?: { absences?: unknown[]; status?: string } | null;
  weather?: { available?: boolean; place?: string;
              temperature_c?: number;
              precipitation_probability_pct?: number;
              wind_speed_kmh?: number } | null;
};
type Payload = {
  display?: string; accent?: string; count?: number;
  with_strength_read?: number; finished_hidden?: number;
  fixtures?: Fixture[]; framing?: string;
  model?: { state?: string; why?: string; instead?: string;
            note?: string | null };
  strength_notes?: { estimate_class?: string; estimate_meaning?: string };
};
type Markets = {
  status?: string; series?: string; means?: string;
  listed_events?: number; tradeable_events?: number;
};

/** A compact club label: the most DISTINCTIVE word, so "Borussia Dortmund"
 *  reads DORTMUND rather than collapsing onto a common prefix. */
function shortClub(name?: string) {
  if (!name) return "";
  const drop = new Set(["fc", "cf", "afc", "sc", "ac", "as", "ss", "ssc",
    "club", "cd", "sd", "ca", "fk", "sk", "bk", "if", "ks", "de", "the"]);
  const words = name.split(/[\s.]+/).filter((w) => w
    && !drop.has(w.toLowerCase().replace(/[^a-z]/g, "")));
  return (words.sort((a, b) => b.length - a.length)[0] || name)
    .slice(0, 9).toUpperCase();
}

function when(f: Fixture) {
  if (f.status === "1H" || f.status === "2H" || f.status === "HT") {
    return `LIVE ${f.elapsed ?? ""}'`;
  }
  if (!f.kickoff_utc) return "";
  const d = new Date(f.kickoff_utc);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-US", {
    timeZone: TZ,
    hour: "numeric", minute: "2-digit",
  });
}

/** The read, or the NAMED reason there is none. Each percentage carries its
 *  own club — a bare "64% / 36%" does not say which side is which. */
function Read({ s, home, away }: {
  s?: Strength; home?: string; away?: string;
}) {
  const e = s?.expected_points_share;
  if (!e) {
    const why = s?.home?.rated === false ? s?.home?.reason : s?.away?.reason;
    return (
      <span className="font-mono text-[10px] text-ink-faint"
        title={s?.home?.reason_words || s?.away?.reason_words || ""}>
        {why === "name_ambiguous" ? "ambiguous name"
          : why === "provider_request_failed" ? "ratings unread" : "no read"}
      </span>
    );
  }
  const hi = e.home >= e.away;
  const d = s?.rating_difference ?? s?.elo_difference;
  return (
    <span className="whitespace-nowrap font-mono text-[10px]">
      <span className={hi ? "text-accent" : "text-ink-low"}>
        {shortClub(s?.home?.club || home)} {(e.home * 100).toFixed(0)}%
      </span>
      <span className="px-1 text-ink-faint">·</span>
      <span className={!hi ? "text-accent" : "text-ink-low"}>
        {(e.away * 100).toFixed(0)}% {shortClub(s?.away?.club || away)}
      </span>
      {typeof d === "number" && (
        <span className="pl-1.5 text-ink-faint">
          Δ{d > 0 ? "+" : ""}{d.toFixed(0)}
        </span>
      )}
    </span>
  );
}

export default function CompViewer() {
  const router = useRouter();
  const key = typeof router.query.key === "string" ? router.query.key : null;
  // A finished competition served by this page (ASEAN) lives in the
  // Archive dropdown — so the dropdown must be HERE too, marking it
  // current, or the archive is a door that locks behind you.
  const archiveKey =
    key != null && ARCHIVE.some((a) => a.key === key) ? key : undefined;
  const [d, setD] = useState<Payload | null>(null);
  const [mk, setMk] = useState<Markets | null>(null);
  const [days, setDays] = useState(14);
  const [onlyRated, setOnlyRated] = useState(false);
  const [err, setErr] = useState(false);
  // A key the backend does not serve is PERMANENT, not a blip. Kept
  // apart from `err` because the two need opposite behaviour: a
  // transient failure should keep retrying, and a retired competition
  // polled every 60s forever is an outage that never resolves.
  const [gone, setGone] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    // Flips false on a 404 and never back: the backend does not serve
    // this key, so every later poll would ask the same dead question.
    // The handle lives in an object so the 404 branch can cancel the
    // poll without depending on when the timer was assigned.
    let served = true;
    const poll: { id?: ReturnType<typeof setInterval> } = {};
    const load = () => {
      if (!served) return;
      fetch(`/api/comp/${key}/fixtures?days=${days}`)
        .then(async (r) => {
          if (r.ok) return r.json();
          // 404 means this key is not served — a retirement or a typo,
          // either way permanent. The backend sends the reason in
          // `detail`; show it and STOP polling. Anything else is a
          // failure worth retrying.
          if (r.status === 404) {
            const body = await r.json().catch(() => null);
            const why = body && typeof body.detail === "string"
              ? body.detail : null;
            throw { permanent: true as const, why };
          }
          throw { permanent: false as const, why: null };
        })
        .then((j) => { if (alive) { setD(j); setErr(false); } })
        .catch((e) => {
          if (!alive) return;
          if (e && e.permanent) {
            served = false;
            setGone(e.why || "this competition is not served here");
            if (poll.id) clearInterval(poll.id);
          } else {
            setErr(true);
          }
        });
      fetch(`/api/comp/${key}/markets`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j) => alive && setMk(j))
        .catch(() => {});
    };
    load();
    poll.id = setInterval(load, 60000);
    return () => { alive = false; if (poll.id) clearInterval(poll.id); };
  }, [key, days]);

  const all = d?.fixtures || [];
  const shown = onlyRated ? all.filter((f) => f.strength?.available) : all;
  const ratedCount = all.filter((f) => f.strength?.available).length;
  const groups = groupByDay(shown
    .map((f) => ({ id: String(f.fixture_id), date: f.kickoff_utc || "", f }))
    .filter((x) => x.date));
  const byDesign = d?.model?.state === "no_model_by_design";
  const vars = { "--accent": d?.accent || "#7dd3fc" } as React.CSSProperties;

  // A key the backend does not serve gets its own page rather than the
  // board with every panel empty. The old behaviour rendered "Loading",
  // a blank no-model card and a zero count, then re-fetched forever —
  // a permanent state wearing a transient one's clothes, which is the
  // empty-state rule this repo already applies to a missing prediction.
  if (gone) {
    return (
      <div style={vars} className="min-h-screen bg-bs font-sans text-ink-mid">
        <Head><title>Not served · market viewer · namson.dev</title></Head>
        <RouteProgress />
        <TopBar left={<ArchiveMenu current={archiveKey} />}
          back={{ href: "/bet-suggester", label: "board" }}
          title="market viewer" />
        <main className="mx-auto max-w-5xl px-5 pb-24 pt-10">
          <Eyebrow>not served here</Eyebrow>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-hi">
            {String(key || "This competition")}
          </h1>
          <section className="mt-8 rounded-2xl border border-line bg-elev p-5">
            <p className="max-w-3xl text-sm leading-relaxed text-ink-low">
              {gone}
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div style={vars} className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head>
        {/* ONE expression: next/head only renders a single-child <title>
            at SSR, so the old juxtaposed children shipped no title tag */}
        <title>{`${d?.display || "Competition"} · market viewer · namson.dev`}</title>
      </Head>
      <RouteProgress />
      <TopBar left={<ArchiveMenu current={archiveKey} />}
        back={{ href: "/bet-suggester", label: "board" }}
        title={`${d?.display || "Competition"} · market viewer`} />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-10">
        <Eyebrow>{(d?.display || "competition").toLowerCase()} · viewer</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-hi">
          {d?.display || "Loading"}
        </h1>

        {/* The missing model, with the reason — and the two reasons are
            NOT the same claim. A cup can never support one; a league
            simply has not had one built. */}
        <section className="mt-8 rounded-2xl border border-line bg-elev p-5">
          <Eyebrow tone="accent">
            {byDesign ? "no model · by design" : "no model · not built yet"}
          </Eyebrow>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-low">
            {d?.model?.why}
          </p>
          {d?.model?.note && (
            <p className="mt-2 max-w-3xl font-mono text-[10px] leading-relaxed text-ink-faint">
              {d.model.note}
            </p>
          )}
          <p className="mt-3 max-w-3xl text-[11px] leading-relaxed text-ink-faint">
            {d?.model?.instead}
          </p>
        </section>

        {/* WC26-style tournament surface — groups, bracket, champion
            forecast. Mounts unconditionally; the backend's 404 is the
            feature switch, so no per-competition frontend code. */}
        {key && <TournamentView compKey={key} />}

        <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wide">
          <span className="text-ink-faint">
            {d?.count ?? 0} upcoming · {ratedCount} with a strength read
            {d?.finished_hidden ? ` · ${d.finished_hidden} finished hidden` : ""}
            {mk?.tradeable_events != null
              ? ` · ${mk.tradeable_events} tradeable on kalshi` : ""}
          </span>
          <button onClick={() => setOnlyRated((v) => !v)}
            className={`rounded-md border px-2 py-1 ${onlyRated
              ? "border-accent/50 text-accent" : "border-line text-ink-faint"}`}>
            {onlyRated ? `rated only · ${ratedCount}` : `all ${d?.count ?? 0}`}
          </button>
          {[3, 7, 14, 30].map((n) => (
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

        {groups.map(({ key: dk, list }) => (
          <Reveal key={dk}>
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
                  <details key={f.fixture_id} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-ink-hi">
                        {f.home?.name}{" "}
                        <span className="text-ink-faint">v</span>{" "}
                        {f.away?.name}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                        {when(f)}
                        {/* round matters for a cup: most of a Conference
                            League season IS qualifying */}
                        {f.round ? ` · ${f.round}` : ""}
                        {f.venue ? ` · ${f.venue}` : ""}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center text-right">
                      {!f.market_vs_read?.available && (
                        <Read s={f.strength} home={f.home?.name}
                          away={f.away?.name} />
                      )}
                      <MarketVsReadInline d={f.market_vs_read} />
                    </div>
                  </summary>
                  <div className="px-4 pb-4">
                    {/* what the match MEANS — derived context, never a
                        model input. Rendered ABOVE the numbers because
                        "second leg, trailing 3-1" changes how every
                        number below should be read. */}
                    {(f.meaning?.tie?.means || f.meaning?.stakes) && (
                      <div className="mt-3 rounded-xl border border-line bg-elev px-4 py-3">
                        {f.meaning?.tie?.means && (
                          <p className="text-sm leading-relaxed text-ink-mid">
                            {f.meaning.tie.means}
                          </p>
                        )}
                        {f.meaning?.stakes?.home && (() => {
                          const rec = (r?: { played?: number; w?: number;
                            d?: number; d_shootout?: number; l?: number;
                            points?: number | null;
                            points_range?: number[] | null }) => r
                            // d: standard draws (ASEAN); d_shootout:
                            // Leagues Cup's shootout-decided draws
                            ? `${r.w}W ${r.d ?? r.d_shootout ?? 0}D ${r.l}L · ` +
                              (r.points != null ? `${r.points} pts`
                                : r.points_range
                                  ? `${r.points_range[0]}–${r.points_range[1]} pts`
                                  : "0 pts")
                            : "no matches yet";
                          return (
                            <p className="font-mono text-[11px] leading-relaxed text-ink-low">
                              group phase · {shortClub(f.home?.name)}{" "}
                              {rec(f.meaning?.stakes?.home)}
                              <span className="px-1.5 text-ink-faint">·</span>
                              {shortClub(f.away?.name)}{" "}
                              {rec(f.meaning?.stakes?.away)}
                            </p>
                          );
                        })()}
                        {f.meaning?.stakes?.means && !f.meaning?.stakes?.home && (
                          <p className="font-mono text-[11px] text-ink-low">
                            {f.meaning.stakes.means}
                          </p>
                        )}
                        {f.meaning?.stakes?.format && (
                          <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-ink-faint">
                            {f.meaning.stakes.format}
                          </p>
                        )}
                        {f.weather?.available && (
                          <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-ink-faint">
                            kickoff weather · {f.weather.temperature_c}°C
                            {f.weather.precipitation_probability_pct != null &&
                              ` · rain ${f.weather.precipitation_probability_pct}%`}
                            {f.weather.wind_speed_kmh != null &&
                              ` · wind ${f.weather.wind_speed_kmh} km/h`}
                            {f.weather.place && ` · ${f.weather.place}`}
                          </p>
                        )}
                        {f.news && (f.news.absences?.length ?? 0) > 0 && (
                          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-accent">
                            {f.news.absences?.length} reported absence(s) —
                            see match news
                          </p>
                        )}
                      </div>
                    )}
                    <MarketVsRead d={f.market_vs_read} s={f.strength} />
                  </div>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>
        ))}

        {!groups.length && !err && (
          <p className="mt-6 rounded-xl border border-line px-4 py-6 text-center font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            no upcoming fixtures in this window
          </p>
        )}

        <details className="mt-10 rounded-xl border border-line bg-elev">
          <summary className="cursor-pointer px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            what these numbers are, and are not
          </summary>
          <div className="space-y-2 px-4 pb-4 font-mono text-[10px] leading-relaxed text-ink-faint">
            <p>{d?.framing}</p>
            {d?.strength_notes?.estimate_meaning && (
              <p>{d.strength_notes.estimate_meaning}</p>
            )}
            <p>
              The strength read is an expected POINTS share with draws
              counted as half — not a win probability — from clubelo.com or
              worldclubratings.com, whichever covers both clubs. The two
              publish different expectation scales and are never mixed
              inside one pairing.
            </p>
            {mk?.listed_events != null && mk?.tradeable_events != null && (
              <p>
                Kalshi {mk.series} carries {mk.listed_events} events but only{" "}
                {mk.tradeable_events} have an open market; the rest are
                settled.
              </p>
            )}
          </div>
        </details>
      </main>
    </div>
  );
}
