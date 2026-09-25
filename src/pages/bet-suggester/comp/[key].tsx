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
import { usePoll } from "../../../lib/usePoll";
import { failureOf, NEVER_ANSWERED } from "../../../lib/httpFailure";
import FieldAxes, { Ratings } from "../../../components/FieldAxes";
import { fetchRatings } from "../../../lib/fieldApi";

import { ARCHIVE, ArchiveMenu } from "../../../components/ArchiveMenu";
import { RouteProgress, TopBar } from "../../../components/chrome";
import { Eyebrow, Reveal } from "../../../components/ui";
import MarketVsRead, { MarketVsReadInline, type MarketVsReadData }
  from "../../../components/MarketVsRead";
import TournamentView from "../../../components/TournamentView";
import { hueOf } from "../../../components/PickerColumn";
import { shortClub } from "../../../lib/clubName";
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
  // NAMED, NOT A BOOLEAN (audit F10): the status and the backend's own
  // sentence, so a failed read says what failed.
  const [err, setErr] = useState<string | null>(null);
  // A key the backend does not serve is PERMANENT, not a blip. Kept
  // apart from `err` because the two need opposite behaviour: a
  // transient failure should keep retrying, and a retired competition
  // polled every 60s forever is an outage that never resolves.
  const [gone, setGone] = useState<string | null>(null);
  /* THE CROSS-LEAGUE FIELD. Its own request, deliberately: it is a
     frozen artifact read and does not change on the 60s fixture poll,
     so it is fetched once per key and never on the interval. */
  const [rat, setRat] = useState<Ratings | null>(null);
  /* A FAILED READ IS NOT AN ABSENT FIELD. Rendering nothing here would
     say this competition has no cross-league rating, which is a claim
     about the measurement rather than about the request. */
  const [ratErr, setRatErr] = useState<string | null>(null);

  // THE FIXTURES AND THE BOOK, every 60s through lib/usePoll (audit F5):
  // never overlapping, paused in a hidden tab, backing off while they
  // fail. A 404 on the fixtures means this key is not served — a
  // retirement or a typo, either way permanent — so the poll STOPS there;
  // the backend sends the reason in `detail`. Anything else is a failure
  // worth retrying, and it is named rather than folded into a boolean.
  usePoll(async (signal) => {
    if (!key) return "stop";
    const markets = fetch(`/api/comp/${key}/markets`, { signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => { if (!signal.aborted) setMk(j); })
      .catch(() => {
        /* SWALLOWED(comp:kalshi-market-counts) — registered in
           e2e/missing-is-not-zero.spec.ts with its closes_when. */
      });
    let r: Response;
    try {
      r = await fetch(`/api/comp/${key}/fixtures?days=${days}`, { signal });
    } catch {
      if (!signal.aborted) setErr(NEVER_ANSWERED);
      await markets;
      return "failed";
    }
    if (r.status === 404) {
      const body = await r.json().catch(() => null);
      const why = body && typeof body.detail === "string" ? body.detail : null;
      if (!signal.aborted) setGone(why || "this competition is not served here");
      return "stop";
    }
    if (!r.ok) {
      const why = await failureOf(r);
      if (!signal.aborted) setErr(why);
      await markets;
      return "failed";
    }
    const j = await r.json();
    if (signal.aborted) return "stop";
    setD(j); setErr(null);
    await markets;
    return "ok";
  }, 60000, [key, days]);

  useEffect(() => {
    if (!key) return;
    let alive = true;
    /* THE FIELD READ GETS AN ABORT OF ITS OWN. `alive` already stops a
       late answer reaching setState, but it cannot stop the request, and
       `fetchRatings` takes the signal the way the field page's own load
       passes it. It is a frozen artifact read, so it is fetched once per
       key and never on the fixtures poll. */
    const ac = new AbortController();
    /* THE FIELD IS READ THROUGH `fetchRatings`, NOT BY HAND.
       ------------------------------------------------------------------
       This was its own `fetch(...).then(r => r.ok ? r.json() : reject)`,
       and what that skipped is the guard `fieldApi` writes out in
       capitals: A 200 IS NOT A PAYLOAD. `r.json()` alone hands a literal
       `null` back TYPED as `Ratings`, so a backend answering `200 null`
       set `rat = null` with `ratErr = null` — and the two states this
       page is careful to keep apart everywhere else collapse into one.
       `FieldAxes` then hits `if (!data) return null` and THE WHOLE PANEL
       DISAPPEARS with no message: not "the field could not be read", not
       "nobody has measured this competition", just an absence where a
       table was, which is indistinguishable from a page that never had
       one.
       IT IS THE SAME PANEL AS THE PAGE NEXT DOOR. `/bet-suggester/ratings`
       draws this component off this endpoint through this function; a
       viewer that reached it by a weaker route was one surface of one
       read holding itself to a lower standard than the other.
       AND THE SENTENCES COME WITH IT. `fetchRatings` names each failure
       in words the reader can act on — a dead connection, a non-JSON
       body, the backend's own `detail` — where this branch could only
       ever say "answered 503". `readFailure` in the component is written
       against those sentences. */
    void fetchRatings(key, ac.signal)
      .then((j) => { if (alive) setRat(j); })
      .catch((e) => {
        if (!alive || (e instanceof DOMException && e.name === "AbortError")) {
          return;
        }
        setRatErr(e instanceof Error ? e.message
                                     : "the field read did not answer");
      });
    return () => {
      alive = false;
      ac.abort();
    };
  }, [key]);

  const all = d?.fixtures || [];
  const shown = onlyRated ? all.filter((f) => f.strength?.available) : all;
  const ratedCount = all.filter((f) => f.strength?.available).length;
  const groups = groupByDay(shown
    .map((f) => ({ id: String(f.fixture_id), date: f.kickoff_utc || "", f }))
    .filter((x) => x.date));
  const byDesign = d?.model?.state === "no_model_by_design";
  /* THE HUE IS A REFERENCE, NOT A COLOUR. `accent` arrives as
     `var(--lg-{key}, var(--lg-cup))` — see Viewer.accent in the
     backend's src/competitions.py — so the value resolves against the
     one place the colour lives, the `--lg-*` tokens in globals.css.
     Before the payload lands there is nothing to resolve, and `hueOf`
     answers from those same tokens rather than from a fourth copy of a
     hex: the page opens on the competition's own light instead of
     flashing an unrelated blue and correcting itself. */
  const vars = {
    "--accent": d?.accent || hueOf(key ?? ""),
  } as React.CSSProperties;

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
        <Eyebrow>{(d?.display || String(key || "competition")).toLowerCase()} · viewer</Eyebrow>
        {/* A FAILED READ IS NOT A LOADING ONE (audit F10). The H1 said
            "Loading" for ever when the fixtures read failed; before a
            payload the page names the key it was asked for, and says
            that the read failed and how. */}
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-hi">
          {d?.display || (err ? String(key || "Competition") : "Loading")}
        </h1>
        {err && !d && (
          <p data-testid="comp-read-failed" role="status"
            className="mt-4 rounded-xl border border-warn/40 bg-warn/5 px-4 py-3 text-[12px] leading-relaxed text-warn">
            The competition read failed: {err}. Nothing on this page is a
            claim about this competition until it answers — retrying, less
            often while it keeps failing.
          </p>
        )}

        {/* The missing model, with the reason — and the two reasons are
            NOT the same claim. A cup can never support one; a league
            simply has not had one built. DRAWN ONLY OFF A PAYLOAD
            (audit F10): before one arrives, "no model · not built yet"
            would be a claim this page never read. */}
        {d && (
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
        )}

        {/* THE CROSS-LEAGUE FIELD, directly under the "no model" block
            because it is what that block's `instead` sentence points at:
            the competition has no rating of its own, and this is the
            strength read used in its place. Above the fixtures, so a
            reader meets the field before the individual ties. */}
        <FieldAxes data={rat} error={ratErr} />

        {/* WC26-style tournament surface — groups, bracket, champion
            forecast. Mounts unconditionally; the backend's 404 is the
            feature switch, so no per-competition frontend code. */}
        {key && <TournamentView compKey={key} />}

        <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-wide">
          {/* MISSING IS NOT ZERO. This read `{d?.count ?? 0} upcoming`
              and `ratedCount` off an empty array, so a fixtures read
              that never landed printed "0 UPCOMING · 0 WITH A STRENGTH
              READ" — a count of the competition — directly above the
              line saying the fixtures were unavailable. The counts are
              a fact about a payload, so they are drawn only when there
              is a payload. */}
          {d ? (
            <span className="text-ink-faint">
              {d.count} upcoming · {ratedCount} with a strength read
              {d.finished_hidden ? ` · ${d.finished_hidden} finished hidden` : ""}
              {mk?.tradeable_events != null
                ? ` · ${mk.tradeable_events} tradeable on kalshi` : ""}
            </span>
          ) : (
            <span className="text-ink-faint">
              fixture counts not read
            </span>
          )}
          <button onClick={() => setOnlyRated((v) => !v)}
            className={`rounded-md border px-2 py-1 ${onlyRated
              ? "border-accent/50 text-accent" : "border-line text-ink-faint"}`}>
            {onlyRated ? `rated only · ${ratedCount}`
              : d ? `all ${d.count}` : "all"}
          </button>
          {[3, 7, 14, 30].map((n) => (
            <button key={n} onClick={() => setDays(n)}
              className={`rounded-md border px-2 py-1 ${days === n
                ? "border-accent/50 text-accent" : "border-line text-ink-faint"}`}>
              {n}d
            </button>
          ))}
        </div>


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
                          // MISSING IS NOT ZERO, AND HERE THE ZERO WAS
                          // ARITHMETICALLY IMPOSSIBLE. A record with no
                          // points figure printed "0 pts" beside its own
                          // wins — "3W 1D 0L · 0 pts" — which no reader
                          // can reconcile with the numbers next to it,
                          // and which is a claim about a group table.
                          // Same for the draw count: `d` is ASEAN's key
                          // and `d_shootout` is Leagues Cup's, so a
                          // competition that sends neither was drawn as
                          // nil draws rather than as unread. Every part
                          // is now derived from the field that carries
                          // it, and an absent field says so.
                          const rec = (r?: { played?: number; w?: number;
                            d?: number; d_shootout?: number; l?: number;
                            points?: number | null;
                            points_range?: number[] | null }) => {
                            if (!r) return "no matches yet";
                            const draws = r.d ?? r.d_shootout;
                            const wdl = [
                              r.w != null ? `${r.w}W` : null,
                              draws != null ? `${draws}D` : null,
                              r.l != null ? `${r.l}L` : null,
                            ].filter(Boolean).join(" ");
                            const pts = r.points != null ? `${r.points} pts`
                              : r.points_range
                                ? `${r.points_range[0]}–${r.points_range[1]} pts`
                                : "points not published";
                            return wdl ? `${wdl} · ${pts}`
                              : `record not published · ${pts}`;
                          };
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
