// TEAM NEWS ON EVERY HUB — provider absences and the XI release minute
// (parity W1.6; news proposal items 1c/1d, Son's decisions of 2026-10-01).
//
// What it shows is the backend's `GET /api/news/fixture/{ref}` (TRIVELA
// src/live/team_news.py `fixture_news`) for this hub's ESPN event id:
// the absences API-Football lists, IN THE PROVIDER'S OWN WORDS (type and
// reason verbatim), and when each side's XI was first seen released.
// Nothing is re-derived and nothing is aggregated — the backend refuses
// an absence count or a "strength impact" on purpose (an aggregate of
// absences is a model wearing a news label, and the lineup and
// key-attacker features were measured negative-or-marginal), so this
// block prints names and the provider's words and NO COUNT.
//
// DISPLAY-ONLY. A read, not a signal; no model reads any of this.
//
// THE STATES, each named and none of them a zero:
//   failed          the read did not come back (status + the backend's
//                   sentence, or "never answered")
//   dormant         the live plane is not ready: nothing was fetched —
//                   "we did not look", not an empty feed
//   absences, by the block's own freshness state:
//     ok            the provider's list, drawn
//     stale         the same list, HELD: dimmed, with its capture clock
//     empty         "the provider lists none" — never "nobody is missing"
//     unavailable   the last fetch failed: UNKNOWN, not empty
//     never_captured  no absence read recorded under this match's
//                   reference (absences are stored under API-Football's
//                   own fixture id; until the backend joins it to the
//                   hub's ESPN id the page cannot find them)
//     not_sent      the payload carried no absence block at all
//   Each empty state adds the BACKEND'S OWN named gap for the
//   competition — `absences.provider_gap` (team_news ABSENCE_GAPS: today
//   Liga MX's provider wall), verbatim — and says how far the join from
//   ESPN's event to API-Football's fixture got (`absences.resolved_by`:
//   own / archive_bridge / live_plane / none). No competition-specific
//   sentence is typed here: the first cut hard-coded "not swept yet" and
//   "coverage never measured", and the backend's W1.6 sweep made both
//   false on the day they shipped (parity review, 2026-10-05).
//
// SIDES ARE ATTRIBUTED ONLY ON A CLEAR NAME MATCH. API-Football names
// clubs its own way; a group whose provider name does not plainly match
// one of the hub's two sides is shown under the provider's name with no
// side claimed — never folded into "home" or "away".
import { useState } from "react";
import { failureOf, NEVER_ANSWERED } from "../lib/httpFailure";
import { usePoll } from "../lib/usePoll";
import { TZ } from "../lib/matchday";
import {
  LINEUP_STATE_UNKNOWN, LINEUP_STATE_WORDS, NEVER_CAPTURED_WORDS,
  RESOLVED_BY_WORDS, TEAM_NEWS_LABEL, gapWords, resolvedByOf,
} from "../lib/hubParity";
import { Collapse } from "./chrome";
import { Reveal } from "./ui";

type Freshness = { state?: string | null; captured_at?: string | null;
  age_seconds?: number | null; stale?: boolean | null; means?: string | null };
export type AbsenceRecord = { player_name?: string | null;
  team_name?: string | null; provider_type?: string | null;
  provider_reason?: string | null; still_reported?: boolean | null;
  last_seen_at?: string | null; side?: "home" | "away" | null };
type AbsenceBlock = { provider?: string | null; records?: AbsenceRecord[];
  freshness?: Freshness | null; note?: string | null;
  /** the ref the absences are stored under, and how the backend got
   *  there from this hub's ESPN id (team_news `absence_ref_for`) */
  subject_ref?: string | null; resolved_by?: string | null;
  competition?: string | null;
  /** the backend's own words for a competition whose provider does not
   *  publish absences (team_news ABSENCE_GAPS), or null */
  provider_gap?: string | null };
type LineupSide = { team_name?: string | null; lineup_state?: string | null;
  released?: boolean | null; released_minutes_before_kickoff?: number | null;
  first_released_at?: string | null };
type LineupProvider = { sides?: Record<string, LineupSide>;
  freshness?: Freshness | null };
export type FixtureNews = {
  availability?: { state?: string | null; means?: string | null } | null;
  absences?: AbsenceBlock | null;
  lineup?: { by_provider?: Record<string, LineupProvider> } | null;
};

type St =
  | { kind: "loading" }
  | { kind: "failed"; why: string }
  | { kind: "dormant"; means: string | null }
  | { kind: "read"; d: FixtureNews };

const NOT_NOBODY = "This is NOT a statement that nobody is missing.";

const PROVIDER_NAME: Record<string, string> = {
  apifootball: "API-Football", espn: "ESPN",
};
const providerName = (p?: string | null) =>
  (p && PROVIDER_NAME[p]) || "the provider";

function fmtClock(iso?: string | null): string {
  if (!iso) return "an unrecorded time";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "an unrecorded time";
  return d.toLocaleString("en-US", { timeZone: TZ, month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtAge(s?: number | null): string | null {
  if (s == null || !Number.isFinite(s) || s < 0) return null;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h}h ${m % 60}m ago` : `${Math.floor(h / 24)}d ago`;
}

const norm = (s?: string | null) => (s ?? "").normalize("NFKD")
  .replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ")
  .trim();

/** "home" / "away" only when the provider's club name plainly names one
 *  side and not the other; null otherwise. */
export function sideOf(team: string | null | undefined, home: string,
  away: string): "home" | "away" | null {
  const t = norm(team), h = norm(home), a = norm(away);
  if (!t) return null;
  const hit = (x: string) => !!x && (t === x || t.includes(x) || x.includes(t));
  const hh = hit(h), aa = hit(a);
  if (hh && !aa) return "home";
  if (aa && !hh) return "away";
  return null;
}

export default function HubTeamNews({ eventId, slug, home, away, post }: {
  eventId: string; slug: string; home: string; away: string; post: boolean;
}) {
  const [st, setSt] = useState<St>({ kind: "loading" });
  // FIVE MINUTES, and once after full time. Absences move on the scale
  // of hours; the capture job behind them ticks every five minutes.
  usePoll(async (signal) => {
    let r: Response;
    try {
      r = await fetch(`/api/news/fixture/${eventId}`, { signal });
    } catch {
      if (signal.aborted) return "stop";
      setSt({ kind: "failed", why: NEVER_ANSWERED });
      return "failed";
    }
    if (!r.ok) {
      setSt({ kind: "failed", why: await failureOf(r) });
      return "failed";
    }
    let d: FixtureNews;
    try {
      d = await r.json();
    } catch {
      setSt({ kind: "failed",
              why: `HTTP ${r.status} — the answer was not JSON` });
      return "failed";
    }
    if (signal.aborted) return "stop";
    if (!d || typeof d !== "object") {
      setSt({ kind: "failed", why: "the answer carried no news object" });
      return "failed";
    }
    if (d.availability?.state === "plane_dormant") {
      setSt({ kind: "dormant", means: d.availability.means ?? null });
      return post ? "stop" : "ok";
    }
    setSt({ kind: "read", d });
    return post ? "stop" : "ok";
  }, 300_000, [eventId, post]);

  return (
    <Reveal>
      <Collapse eyebrow="team news" title="Absences" className="mt-8 mb-0">
        <section data-testid="team-news" data-state={st.kind} data-hub={slug}
          className="min-w-0">
          <p data-testid="team-news-label"
            className="mb-3 font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-ink-faint">
            {TEAM_NEWS_LABEL}
          </p>
          {st.kind === "loading" && (
            <p className="font-mono text-[10px] text-ink-faint">reading team news…</p>
          )}
          {st.kind === "failed" && (
            <p data-testid="team-news-failed"
              className="rounded-xl border border-dashed border-line px-3 py-3 font-mono text-[10px] leading-relaxed text-ink-low">
              team news unavailable — {st.why}. {NOT_NOBODY}
            </p>
          )}
          {st.kind === "dormant" && (
            <p data-testid="team-news-dormant"
              className="rounded-xl border border-dashed border-line px-3 py-3 font-mono text-[10px] leading-relaxed text-ink-low">
              no team news was fetched for this match — the live plane is
              not running on this deployment, so nothing was looked for.
              This is not an empty result. {NOT_NOBODY}
            </p>
          )}
          {st.kind === "read" && (
            <>
              <Absences block={st.d.absences} home={home} away={away} />
              <Releases lineup={st.d.lineup} />
            </>
          )}
        </section>
      </Collapse>
    </Reveal>
  );
}

function Absences({ block, home, away }: {
  block: AbsenceBlock | null | undefined; home: string; away: string;
}) {
  const box = "rounded-xl border border-dashed border-line px-3 py-3 "
    + "font-mono text-[10px] leading-relaxed text-ink-low";
  if (!block || typeof block !== "object") {
    return (
      <div data-testid="absences" data-state="not_sent" data-held="false">
        <p data-testid="absences-not-sent" className={box}>
          absences — the team-news read carried no absence block for this
          match, so whether the provider lists anyone is not known here.{" "}
          {NOT_NOBODY}
        </p>
      </div>
    );
  }
  const f = block.freshness ?? {};
  const state = f.state ?? "never_captured";
  const recs = Array.isArray(block.records)
    ? block.records.filter((r) => r && typeof r === "object") : [];
  const held = state === "stale";
  const who = providerName(block.provider);
  // the backend's own gap sentence for this competition, verbatim
  const gap = typeof block.provider_gap === "string"
    && block.provider_gap.trim() ? gapWords(block.provider_gap) : undefined;
  const joined = resolvedByOf(block.resolved_by);

  if (state === "never_captured" || (recs.length === 0
      && !["empty", "unavailable", "ok", "stale"].includes(state))) {
    return (
      <div data-testid="absences" data-state="never_captured" data-held="false"
        data-resolved-by={joined}>
        <p data-testid="absences-never" className={box}>
          {NEVER_CAPTURED_WORDS[joined](who)}. {NOT_NOBODY}
        </p>
        <Gap text={gap} />
      </div>
    );
  }
  if (state === "unavailable" && recs.length === 0) {
    return (
      <div data-testid="absences" data-state="unavailable" data-held="false"
        data-resolved-by={joined}>
        <p data-testid="absences-unavailable" className={box}>
          the last absence read from {who} did not succeed
          ({fmtClock(f.captured_at)}), so who is missing is UNKNOWN — not
          empty. {NOT_NOBODY}
        </p>
        <Gap text={gap} />
      </div>
    );
  }
  if (recs.length === 0) {
    return (
      <div data-testid="absences" data-state={state} data-held={String(held)}
        data-resolved-by={joined}
        className={held ? "opacity-50" : undefined}>
        <p data-testid="absences-empty" className={box}>
          the provider lists none — {who} answered with an empty list
          ({fmtClock(f.captured_at)}). {NOT_NOBODY}
        </p>
        <Gap text={gap} />
      </div>
    );
  }

  // group by the provider's own club name, then attribute a side only on
  // a clear match; home first, away second, anything unattributed after
  const groups = new Map<string, AbsenceRecord[]>();
  for (const r of recs) {
    const k = r.team_name?.trim() || "club not named by the provider";
    groups.set(k, [...(groups.get(k) ?? []), r]);
  }
  const rank = (s: "home" | "away" | null) =>
    s === "home" ? 0 : s === "away" ? 1 : 2;
  const ordered = [...groups.entries()].map(([team, rows]) => {
    const sent = rows.find((r) => r.side === "home" || r.side === "away")?.side;
    const side = sent ?? sideOf(team, home, away);
    return { team, rows, side: side ?? null };
  }).sort((x, y) => rank(x.side) - rank(y.side));

  return (
    <div data-testid="absences" data-state={state} data-held={String(held)}
      data-resolved-by={joined}
      className={held ? "opacity-50" : undefined}>
      {held ? (
        <p data-testid="absences-held"
          className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
          held · captured {fmtClock(f.captured_at)}
          {fmtAge(f.age_seconds) ? ` (${fmtAge(f.age_seconds)})` : ""} — older
          than this feed&apos;s tolerance, so it may be out of date
        </p>
      ) : (
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
          listed by {who} · read {fmtClock(f.captured_at)}
          {state === "unavailable" ? " · the latest read failed; these are the last listed" : ""}
        </p>
      )}
      <div className="space-y-3">
        {ordered.map((g) => (
          <div key={g.team} data-testid="absence-group" data-side={g.side ?? ""}
            className="min-w-0">
            <p className="mb-1 truncate text-[12px] font-medium text-ink-hi">
              {g.team}
              {g.side && (
                <span className="ml-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                  {g.side === "home" ? "listed home" : "listed away"}
                </span>
              )}
            </p>
            <ul className="space-y-1">
              {g.rows.map((r, i) => {
                const gone = r.still_reported === false;
                return (
                  <li key={i} data-testid="absence"
                    data-retracted={String(gone)}
                    className={`flex min-w-0 flex-wrap items-baseline gap-x-2 font-mono text-[11px] ${
                      gone ? "text-ink-faint" : "text-ink-mid"}`}>
                    <span className={`min-w-0 truncate ${gone ? "" : "text-ink-hi"}`}>
                      {r.player_name || "unnamed by the provider"}
                    </span>
                    <span className="min-w-0 text-ink-low">
                      {[r.provider_type, r.provider_reason]
                        .filter((x) => x && String(x).trim()).join(" · ")
                        || "no type or reason given"}
                    </span>
                    {gone && (
                      <span className="text-[9px] uppercase tracking-[0.12em]">
                        no longer listed at the latest read
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-2 font-mono text-[9px] leading-relaxed text-ink-faint">
        type and reason are {who}&apos;s own words, shown verbatim — its
        claim, not ours. A player not listed here is not thereby fit.
        {joined === "archive_bridge" || joined === "live_plane"
          ? <span data-testid="absences-joined">
              {" "}This match&apos;s list was {RESOLVED_BY_WORDS[joined]}.
            </span> : null}
      </p>
    </div>
  );
}

function Gap({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p data-testid="absences-gap"
      className="mt-2 font-mono text-[10px] leading-relaxed text-ink-low">
      {text.replace(/[.\s]+$/, "")}.
    </p>
  );
}

/** When each side's XI was first seen released, per provider, never
 *  pooled. The minute is an UPPER BOUND: it is when we first observed a
 *  full XI, not when the provider published it. */
function Releases({ lineup }: { lineup: FixtureNews["lineup"] }) {
  const by = lineup?.by_provider;
  const rows = by && typeof by === "object"
    ? Object.entries(by).flatMap(([prov, blk]) =>
        (["home", "away"] as const).map((side) => ({
          prov, side, s: blk?.sides?.[side] })))
      .filter((x) => x.s)
    : [];
  if (rows.length === 0) {
    return (
      <p data-testid="xi-release-none"
        className="mt-4 font-mono text-[10px] leading-relaxed text-ink-faint">
        xi release — no lineup capture is recorded for this match, so when
        each XI appeared is not known here. That is not a claim that no XI
        has been announced.
      </p>
    );
  }
  return (
    <div className="mt-4 border-t border-line pt-3">
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
        xi release · first seen by our capture
      </p>
      <ul className="space-y-1">
        {rows.map(({ prov, side, s }) => (
          <li key={`${prov}-${side}`} data-testid="xi-release"
            data-side={side} data-provider={prov}
            data-state={s!.released === true ? "released"
              : s!.lineup_state && s!.lineup_state !== "released"
                  && LINEUP_STATE_WORDS[s!.lineup_state]
                ? s!.lineup_state : "unknown"}
            className="min-w-0 font-mono text-[10px] leading-relaxed text-ink-low">
            <span className="text-ink-mid">
              {s!.team_name || (side === "home" ? "listed home" : "listed away")}
            </span>
            {" · "}{providerName(prov)}{" · "}
            {s!.released === true
              ? (s!.released_minutes_before_kickoff != null
                  ? `released, first seen ${Math.round(s!.released_minutes_before_kickoff)} min before kickoff`
                  : `released, first seen ${fmtClock(s!.first_released_at)}`)
              : s!.lineup_state && s!.lineup_state !== "released"
                  && LINEUP_STATE_WORDS[s!.lineup_state]
                ? LINEUP_STATE_WORDS[s!.lineup_state]
                : LINEUP_STATE_UNKNOWN}
          </li>
        ))}
      </ul>
      <p className="mt-1.5 font-mono text-[9px] leading-relaxed text-ink-faint">
        first seen is an upper bound: neither provider timestamps a lineup,
        so a release can only look later than it was.
      </p>
    </div>
  );
}
