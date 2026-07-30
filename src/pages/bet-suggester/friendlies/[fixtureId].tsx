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
import { unitFeeDollars } from "../../../lib/fee";

type Side = { name?: string; crest?: string | null };
type Strength = {
  estimate_class?: string;
  estimate_meaning?: string;
  available?: boolean;
  expected_points_share?: { home: number; away: number } | null;
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
  elo?: number; country?: string | null; league_level?: string | null;
  match_tier?: string;
};
type BookRow = {
  ticker?: string; yes_sub_title?: string;
  yes_ask_dollars?: string | null; yes_bid_dollars?: string | null;
};
type Books = {
  status?: string; means?: string;
  markets?: BookRow[]; families?: Record<string, BookRow[]>;
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
  const rows = books?.markets || [];
  const e = strength?.expected_points_share;
  return (
    <section className="mt-10">
      <Eyebrow tone="accent">market · kalshi</Eyebrow>
      <h2 className="mt-3 text-lg text-ink-hi">
        What the exchange charges, and how the clubs compare
      </h2>

      {(!rows.length) && (
        <p className="mt-4 rounded-xl border border-line bg-elev px-4 py-4 font-mono text-[11px] uppercase leading-relaxed tracking-wide text-ink-faint">
          {books?.status === "unavailable"
            ? (books.means
               || "the book could not be read — not “no book exists”")
            : "no kalshi book matched this fixture"}
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
                const p = impliedFromAsk(m.yes_ask_dollars);
                return (
                  <tr key={m.ticker ?? i} className="border-b border-line/60">
                    <td className="py-2 text-ink-mid">
                      {m.yes_sub_title ?? m.ticker}
                    </td>
                    <td className="py-2 text-right font-mono text-ink-hi">
                      {cents(m.yes_ask_dollars)}
                    </td>
                    <td className="py-2 text-right font-mono text-ink-low">
                      {cents(m.yes_bid_dollars)}
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
            <div className="mt-3 flex h-2 overflow-hidden rounded-full border border-line">
              <div style={{ width: `${e.home * 100}%` }}
                className="bg-accent/70" />
              <div style={{ width: `${e.away * 100}%` }} className="bg-line" />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px]">
              <span className="text-accent">{(e.home * 100).toFixed(1)}%</span>
              {typeof strength?.elo_difference === "number" && (
                <span className="text-ink-faint">
                  ΔElo {strength.elo_difference > 0 ? "+" : ""}
                  {strength.elo_difference.toFixed(0)}
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
  return (
    <div className="rounded-xl border border-line p-3">
      <div className="font-mono text-[10px] uppercase tracking-wide text-ink-faint">
        {label}
      </div>
      <div className="mt-1 truncate text-sm text-ink-hi">{r?.club ?? "—"}</div>
      {r?.rated ? (
        <dl className="mt-2 space-y-1 font-mono text-[10px] text-ink-low">
          <div className="flex justify-between">
            <dt>elo</dt><dd className="text-ink-mid">{r.elo?.toFixed(0)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>country</dt><dd>{r.country ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>league tier</dt><dd>{r.league_level ?? "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt>name match</dt><dd>{r.match_tier ?? "—"}</dd>
          </div>
        </dl>
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

            {d?.strength?.estimate_meaning && (
              <p className="mt-10 text-[11px] leading-relaxed text-ink-faint">
                {d.strength.estimate_meaning}
              </p>
            )}
            {d?.strength?.home_field_advantage && (
              <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
                Home field: {d.strength.home_field_advantage}
              </p>
            )}
            {d?.strength?.attribution && (
              <p className="mt-2 text-[11px] leading-relaxed text-ink-faint">
                {d.strength.attribution}
              </p>
            )}
            {d?.framing && (
              <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">
                {d.framing}
              </p>
            )}
          </Reveal>
        )}
      </main>
    </div>
  );
}
