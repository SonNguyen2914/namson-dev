// One club friendly's own page.
//
// Named [fixtureId], not [eventId], because the id space genuinely differs
// from the three league match pages: those key on ESPN event ids, this
// keys on the API-Football fixture id — the only identifier stable across
// ALL friendlies rather than the ESPN-visible subset.
//
// Uses src/lib/fee.ts from the start. The three league match pages have
// already drifted on exactly this point (EPL uses the exact-decimal
// helpers; MLS and Liga MX still carry an inline float approximation), and
// a fourth page repeating the older mistake is not worth the copy-paste
// convenience.
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { RouteProgress, TopBar } from "../../../components/chrome";
import { Eyebrow, Reveal } from "../../../components/ui";
import MarketVsRead, { type MarketVsReadData }
  from "../../../components/MarketVsRead";
import { unitFeeDollars } from "../../../lib/fee";

type Side = { name?: string; crest?: string | null };
type Calibrated = {
  expected_points_share?: { home: number; away: number };
  shrink_k?: number; source?: string; measured_at?: string;
  basis?: string; corrects?: string; scope?: string;
};
type Strength = {
  calibrated?: Calibrated;
  estimate_class?: string;
  estimate_meaning?: string;
  available?: boolean;
  expected_points_share?: { home: number; away: number } | null;
  rating_difference?: number | null;
  elo_difference?: number | null;
  pair_confidence?: string;
  pair_confidence_words?: string;
  semantics?: string;
  home_field_advantage?: string;
  attribution?: string;
  as_of?: string;
  unavailable_reason?: string;
  home?: SideRating;
  away?: SideRating;
};
type SideRating = {
  club?: string; rated?: boolean; reason?: string; reason_words?: string;
  // `rating`, not `elo`: the backend serves one field for both providers
  // since their scales differ (ClubElo 400 / worldclubratings 600). Reading
  // `elo` here is why every club panel rendered a blank value next to its
  // label.
  rating?: number; source?: string; scale?: string;
  provider_rank?: number | null; provider_id?: string;
  country?: string | null; league_level?: string | null;
  match_tier?: string;
};
// The real shape, read off the served payload rather than assumed:
// books.book.markets[] with `label` / `yes_ask` / `yes_bid`. A first pass
// guessed `markets[].yes_sub_title` / `yes_ask_dollars` and rendered an
// empty table for every fixture that HAD a book.
type BookRow = {
  ticker?: string; label?: string; status?: string;
  yes_ask?: string | null; yes_bid?: string | null;
};
type Books = {
  status?: string; means?: string; event_ticker?: string;
  book?: { event_ticker?: string; title?: string; markets?: BookRow[] };
  freshness?: { state?: string; age_seconds?: number | null };
};
type Detail = {
  fixture?: {
    fixture_id?: number; kickoff_utc?: string; status?: string;
    status_long?: string; elapsed?: number | null; league_name?: string;
    venue?: string | null; venue_city?: string | null;
    home: Side; away: Side;
    goals?: { home: number | null; away: number | null };
    kalshi?: { state?: string; event_ticker?: string };
  };
  strength?: Strength;
  books?: Books;
  market_vs_read?: MarketVsReadData | null;
  framing?: string | null;
};

const VARS = {
  "--accent": "#5eead4",
  "--accent-dim": "rgba(94,234,212,0.35)",
  "--accent-faint": "rgba(94,234,212,0.10)",
} as React.CSSProperties;

function cents(v?: string | null) {
  const n = v ? Math.round(parseFloat(v) * 100) : NaN;
  return Number.isFinite(n) ? `${n}¢` : "—";
}

/** Market-implied probability from an ask, display-only. Carries the
 *  exchange's spread — it is NOT a de-vigged fair value, and is labelled
 *  as such wherever it is shown. */
function impliedFromAsk(v?: string | null) {
  const n = v ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

function TeamRow({ s, goals, live }: {
  s?: Side; goals?: number | null; live?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {s?.crest
        ? <img src={s.crest} alt="" className="h-7 w-7 shrink-0" />
        : <div className="h-7 w-7 shrink-0 rounded-full border border-line" />}
      <span className="min-w-0 flex-1 truncate text-base text-ink-hi">
        {s?.name ?? "—"}
      </span>
      <span className={`font-mono text-lg ${
        live ? "text-accent" : "text-ink-mid"}`}>
        {goals === null || goals === undefined ? "–" : goals}
      </span>
    </div>
  );
}

/** The comparison the page exists for: what the exchange is charging,
 *  beside an independent read of relative club strength. Deliberately NOT
 *  framed as an edge — the two numbers are not the same KIND of quantity
 *  (one carries a spread and covers a three-way market including the draw;
 *  the other is a two-way points share with draws counted as half), so
 *  subtracting them would be arithmetic without a referent. */
function MarketVsStrength({ books, strength }: {
  books?: Books; strength?: Strength;
}) {
  const rows = books?.book?.markets || [];
  const e = strength?.expected_points_share;
  return (
    <section className="mt-10">
      <Eyebrow tone="accent">market · kalshi</Eyebrow>
      <h2 className="mt-3 text-lg text-ink-hi">
        What the exchange charges, and how the clubs compare
      </h2>

      {(!rows.length) && (
        <p className="mt-4 rounded-xl border border-line bg-elev px-4 py-4 font-mono text-[11px] uppercase leading-relaxed tracking-wide text-ink-faint">
          {books?.means
            || (books?.status === "no_event_bridged"
              ? "no tradeable kalshi event bridges to this fixture"
              : "the book could not be read — not “no book exists”")}
        </p>
      )}

      {!!rows.length && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                <th className="py-2 text-left font-normal">outcome</th>
                <th className="py-2 text-right font-normal">ask</th>
                <th className="py-2 text-right font-normal">bid</th>
                <th className="py-2 text-right font-normal">implied</th>
                <th className="py-2 text-right font-normal">fee / contract</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m, i) => {
                const p = impliedFromAsk(m.yes_ask);
                return (
                  <tr key={m.ticker ?? i} className="border-b border-line/60">
                    <td className="py-2 text-ink-mid">
                      {m.label ?? m.ticker}
                    </td>
                    <td className="py-2 text-right font-mono text-ink-hi">
                      {cents(m.yes_ask)}
                    </td>
                    <td className="py-2 text-right font-mono text-ink-low">
                      {cents(m.yes_bid)}
                    </td>
                    <td className="py-2 text-right font-mono text-ink-mid">
                      {p === null ? "—" : `${(p * 100).toFixed(1)}%`}
                    </td>
                    <td className="py-2 text-right font-mono text-ink-faint">
                      {p === null ? "—"
                        : `$${unitFeeDollars(p).toFixed(4)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
            implied % contains the exchange&apos;s spread — it is not a
            de-vigged fair value. Fees from the canonical exact-decimal
            helper, not an approximation.
          </p>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-line bg-elev p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
            strength read · {strength?.estimate_class ?? "unavailable"}
          </span>
          {strength?.pair_confidence && (
            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              {strength.pair_confidence.replace(/_/g, " ")}
            </span>
          )}
        </div>

        {e ? (
          <>
            {/* The club NAME sits with its own number. A bare
                "20.5% … 79.5%" cannot be read: nothing on the bar says
                which side is which, and the reader has to infer it from
                row order. */}
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate text-sm text-accent">
                {strength?.home?.club ?? "home"}
              </span>
              <span className="min-w-0 truncate text-right text-sm text-ink-mid">
                {strength?.away?.club ?? "away"}
              </span>
            </div>
            <div className="mt-1.5 flex h-2 overflow-hidden rounded-full border border-line">
              <div style={{ width: `${e.home * 100}%` }}
                className="bg-accent/70" />
              <div style={{ width: `${e.away * 100}%` }} className="bg-line" />
            </div>
            <div className="mt-2 flex items-baseline justify-between font-mono text-[11px]">
              <span className="text-accent">{(e.home * 100).toFixed(1)}%</span>
              {typeof (strength?.rating_difference
                ?? strength?.elo_difference) === "number" && (
                <span className="text-ink-faint">
                  Δ{(strength.rating_difference
                    ?? strength.elo_difference)! > 0 ? "+" : ""}
                  {(strength.rating_difference
                    ?? strength.elo_difference)!.toFixed(0)}
                </span>
              )}
              <span className="text-ink-mid">{(e.away * 100).toFixed(1)}%</span>
            </div>
          </>
        ) : (
          <p className="mt-3 font-mono text-[11px] leading-relaxed text-ink-faint">
            {strength?.unavailable_reason
              || "no strength read for this pairing"}
            {strength?.home?.rated === false && strength.home.reason_words
              ? ` · home: ${strength.home.reason_words}`
              : ""}
            {strength?.away?.rated === false && strength.away.reason_words
              ? ` · away: ${strength.away.reason_words}`
              : ""}
          </p>
        )}

        {/* BOTH numbers. The bar above is the PROVIDER's published
            expectation and stays citable as such; this is OURS, measured
            here, and shown beside it rather than quietly replacing it —
            a locally fitted number wearing a provider's name would be a
            different claim than the one the label makes. */}
        {strength?.calibrated?.expected_points_share && e && (
          <div className="mt-4 rounded-lg border border-line/70 p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                calibrated on our own measurement
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
                shrink {strength.calibrated.shrink_k} · {strength.calibrated.measured_at}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between font-mono text-[11px]">
              <span className="text-accent">
                {(strength.calibrated.expected_points_share.home * 100)
                  .toFixed(1)}%
              </span>
              <span className="text-ink-faint">
                was {(e.home * 100).toFixed(1)}% / {(e.away * 100).toFixed(1)}%
              </span>
              <span className="text-ink-mid">
                {(strength.calibrated.expected_points_share.away * 100)
                  .toFixed(1)}%
              </span>
            </div>
            {strength.calibrated.basis && (
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
                {strength.calibrated.basis}
              </p>
            )}
            {strength.calibrated.corrects && (
              <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-ink-faint">
                {strength.calibrated.corrects}
              </p>
            )}
          </div>
        )}
        {strength?.semantics && (
          <p className="mt-4 text-[11px] leading-relaxed text-ink-low">
            {strength.semantics}
          </p>
        )}
        {strength?.pair_confidence_words && (
          <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
            {strength.pair_confidence_words}
          </p>
        )}
      </div>

      <p className="mt-4 font-mono text-[10px] leading-relaxed text-ink-faint">
        THE TWO NUMBERS ARE NOT THE SAME KIND OF QUANTITY AND ARE NOT
        SUBTRACTED. The market column is a three-way price carrying a
        spread; the strength read is a two-way expected points share with
        draws counted as half. No difference between them is computed, and
        none should be read as value.
      </p>
    </section>
  );
}

function ClubProfile({ r, label }: { r?: SideRating; label: string }) {
  const src = r?.source === "worldclubratings" ? "worldclubratings"
    : r?.source === "clubelo" ? "clubelo" : null;
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
          {label}
        </span>
        {src && (
          <span className="font-mono text-[9px] uppercase tracking-wide text-ink-faint">
            {src}
          </span>
        )}
      </div>
      <div className="mt-1 truncate text-sm text-ink-hi">{r?.club ?? "—"}</div>
      {r?.rated ? (
        <>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl text-accent">
              {r.rating?.toFixed(0) ?? "—"}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
              {r.scale === "fifa_adapted_600" ? "pts · fifa-adapted"
                : "elo"}
            </span>
          </div>
          <dl className="mt-2 space-y-1 font-mono text-[10px] text-ink-low">
            {r.provider_rank != null && (
              <div className="flex justify-between">
                <dt>world rank</dt><dd className="text-ink-mid">
                  #{r.provider_rank}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>country</dt><dd className="text-ink-mid">
                {r.country ?? "—"}</dd>
            </div>
            {r.league_level && (
              <div className="flex justify-between">
                <dt>league tier</dt><dd className="text-ink-mid">
                  {r.league_level}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>name match</dt><dd>{r.match_tier ?? "—"}</dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
          {r?.reason_words || "not rated"}
        </p>
      )}
    </div>
  );
}

export default function FriendlyMatchPage() {
  const router = useRouter();
  const fixtureId = typeof router.query.fixtureId === "string"
    ? router.query.fixtureId : null;
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!fixtureId) return;
    let alive = true;
    const load = () => {
      fetch(`/api/friendlies/fixtures/${fixtureId}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j) => { if (alive) { setD(j); setErr(false); } })
        .catch(() => alive && setErr(true));
    };
    load();
    const t = setInterval(load, 30000);
    return () => { alive = false; clearInterval(t); };
  }, [fixtureId]);

  const f = d?.fixture;
  const live = f?.status === "1H" || f?.status === "2H" || f?.status === "HT";
  const title = f ? `${f.home?.name} v ${f.away?.name}` : "Friendly";

  return (
    <div style={VARS} className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>{title} · club friendly · namson.dev</title></Head>
      <RouteProgress />
      <TopBar back={{ href: "/bet-suggester/friendlies", label: "friendlies" }}
        title="Club friendly" />
      <main className="mx-auto max-w-2xl px-5 pb-24 pt-10">
        {err && !d && (
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            match feed unavailable — retrying every 30s
          </p>
        )}
        {f && (
          <Reveal>
            <section className="rounded-2xl border border-line bg-elev p-4">
              <div className="flex flex-wrap justify-between gap-2 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                <span>
                  {f.kickoff_utc
                    ? new Date(f.kickoff_utc).toLocaleString()
                    : ""}
                </span>
                <span className="truncate">
                  {f.venue || "venue not listed"}
                  {f.venue_city ? ` · ${f.venue_city}` : ""}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <TeamRow s={f.home} goals={f.goals?.home} live={live} />
                <div className="h-px bg-line" />
                <TeamRow s={f.away} goals={f.goals?.away} live={live} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-[0.14em]">
                <span className="rounded-md border border-line px-2 py-0.5 text-ink-faint">
                  {live ? `live ${f.elapsed ?? ""}'`
                    : (f.status_long || f.status || "scheduled")}
                </span>
                <span className="rounded-md border border-line px-2 py-0.5 text-ink-faint">
                  {f.league_name || "club friendly"}
                </span>
                <span className="rounded-md border border-line px-2 py-0.5 text-ink-faint">
                  no model · friendlies are not modelled here
                </span>
              </div>
            </section>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ClubProfile r={d?.strength?.home} label="home" />
              <ClubProfile r={d?.strength?.away} label="away" />
            </div>

            <MarketVsStrength books={d?.books} strength={d?.strength} />

            <MarketVsRead d={d?.market_vs_read} />

            {/* One compact footer instead of five stacked paragraphs. The
                previous version put ~250 words of disclaimer under every
                fixture, which buried the data it was qualifying. Every
                claim below is still made — just once, and briefly. */}
            <details className="mt-10 rounded-xl border border-line bg-elev">
              <summary className="cursor-pointer px-4 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                what these numbers are, and are not
              </summary>
              <div className="space-y-2 px-4 pb-4 font-mono text-[10px] leading-relaxed text-ink-faint">
                <p>
                  The strength read is an EXTERNAL, unevaluated orientation
                  figure — not a forecast, not a model output, and below
                  every evidence class an approved model here is judged
                  against. No home-field term is applied.
                </p>
                <p>
                  It is an expected POINTS share with draws counted as half,
                  not a win probability, and carries no draw number.
                </p>
                <p>
                  The market table above still shows no difference column:
                  a raw three-way price and a points share are not the same
                  quantity. The block beneath it computes one only after
                  converting the book onto the SAME scale — P(win) plus half
                  P(draw), vig removed — which is what makes subtraction
                  mean anything.
                </p>
                <p>
                  That difference is a DISAGREEMENT between two sources, not
                  a verified mispricing. Our read beats a coin flip only
                  narrowly, and the market&apos;s own accuracy on friendlies
                  is unmeasured here.
                </p>
                {d?.strength?.attribution && <p>{d.strength.attribution}</p>}
                {d?.strength?.as_of && <p>ratings as of {d.strength.as_of}.</p>}
              </div>
            </details>
          </Reveal>
        )}
      </main>
    </div>
  );
}
