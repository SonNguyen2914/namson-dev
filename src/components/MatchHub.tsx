// The SHARED match hub — one component behind all four league match
// pages (2026-09-01). They began as forks of the MLS page and drifted
// exactly the way forks do: TWO of the four (MLS, Liga MX) were still
// applying a naive per-contract float fee that src/lib/fee.ts exists
// to forbid, while the other two had the canonical ceil-to-centicent
// whole-order policy. One implementation ends that class of bug: the
// league pages are now thin config files, and every honesty surface —
// dark-model states, the T-10 temporal basis, the absence-null
// semantics, the every-market table — is written once.
//
// League differences live in HubCfg and are COPY AND CAPABILITY, not
// structure: which strings a dark model states, whether a per-player
// strength feed exists, and whether a suggestion-card competition exists. Payload-driven
// sections (xG duel, input quality, absences) render wherever the
// data appears, so a league lighting up needs a config edit only for
// its words.
//
// PARITY ACROSS THE ELEVEN (2026-10-05, Son's "every feature, every
// match"). Four sections are drawn on every hub and name their own gaps
// (registers in lib/hubParity): the venue line (W1.12 — who hosts, only
// from the derived venue class the frozen pre-kickoff read carries),
// provider absences and the XI release minute (W1.6,
// components/HubTeamNews), every Kalshi family present or named with the
// backend's own per-family status (W1.11, `book_meta.families`), and on
// a generic hub the frozen pre-kickoff read — the board's snapshot or
// the match archive's T-60/T-10 rung — or the backend's reason there is
// none (W1.4).
import { TZ } from "../lib/matchday";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { countdown, pct, signedPct } from "../lib/suggesterApi";
import { failureOf, NEVER_ANSWERED } from "../lib/httpFailure";
import { usePoll } from "../lib/usePoll";
import ModelVsMarket from "./ModelVsMarket";
import { FEE_NOT_MODELED, maxContractsForStake, orderCostDollars,
  unitFeeDollars } from "../lib/fee";
import { Eyebrow, Reveal } from "./ui";
import { Collapse, NavChip, TopBar, useScrollSpy } from "./chrome";
import SuggestionCard from "./SuggestionCard";
import RatingsBlock from "./RatingsBlock";
import ErrorBoundary from "./ErrorBoundary";
import HubTeamNews from "./HubTeamNews";
import {
  ARCHIVE_READ_UNKNOWN, ARCHIVE_READ_WORDS, FAMILY_REASON_ORDER,
  FAMILY_REASON_WORDS, VENUE_BASIS_WORDS, VENUE_CLASSES, VENUE_GAP_WORDS,
  VENUE_SOURCE_WORDS, isNationHub, unservedFamilies, venueFrom,
  venueUnresolvedWords, type FamilyReason, type VenueClass,
  type VenueRead, type VenueSource,
} from "../lib/hubParity";

type Side = { name?: string; abbrev?: string; logo?: string; score?: string;
  color?: string; alt_color?: string };
type StatRow = { key: string; label: string; home?: string; away?: string };
type Ev = { minute?: string; type?: string; team?: string; text?: string;
  scoring?: boolean };
// team_score/opponent_score are THIS team's goals first. Never render the
// provider's `score` string: ESPN formats it winner-first, so a 0-1 loss
// arrives as "1-0" and reads as a win (reported Jul 24, 2026).
type FiveGame = { result?: string; team_score?: number | null;
  opponent_score?: number | null; score?: string; at_vs?: string;
  opponent?: string; date?: string };
type LastFive = { team?: string; abbrev?: string; form?: string;
  games: FiveGame[] };
type H2H = { perspective?: string; result?: string; home_score?: string;
  away_score?: string; at_vs?: string; opponent?: string; date?: string };
type Match = { id: string; date?: string; state?: string; detail?: string;
  minute?: string; venue?: string; home: Side; away: Side;
  stats: StatRow[]; events: Ev[];
  scouting?: { last_five: LastFive[]; head_to_head: H2H[] };
  /** ESPN's own flag (comp_match.enrich). NOT a measurement — false on
   *  every recorded national summary, neutral grounds included — so it
   *  is never read as "home" (see VenueLine). */
  neutral_site?: boolean | null };
type XiPlayer = { name?: string; position?: string; jersey?: string;
  xg90?: number | null; apps?: number | null; is_goalkeeper?: boolean };
type Absence = { name?: string; xg90?: number; apps?: number;
  status?: "bench" | "out" };
type SideLineup = { formation?: string; confirmed?: boolean;
  released?: boolean; starters: XiPlayer[]; bench: XiPlayer[];
  goalkeeper?: string | null;
  // null (never []) when the backend could NOT compute absences — the
  // competition has no player-strength feed, or a club did not resolve.
  // [] means it computed them and nobody is missing. Conflating the two
  // is the bug the backend fix exists to prevent; do not "simplify" this
  // to Absence[] with a ?? [] default.
  key_absences: Absence[] | null;
  key_absences_reason?: string | null };
type Lineups = { home: SideLineup | null; away: SideLineup | null;
  strength_available?: boolean };
type BookRow = { ticker: string; label?: string; yes_ask?: string;
  yes_bid?: string; status?: string; model_key?: string | null };
type Book = { event_ticker: string; title?: string; markets: BookRow[] };
type Family = { key: string; label: string; event_ticker: string;
  markets: BookRow[] };
type Basis = { home_games?: number; away_games?: number;
  league_gpg?: number; venue_home?: number;
  home_attack?: number; home_defence?: number;
  away_attack?: number; away_defence?: number };
type ModelRun = { run_type?: string; captured_at?: string; seed?: number;
  n_simulations?: number; outcomes?: Record<string, number>;
  tickers?: Record<string, string>;
  xg?: { home: number; away: number } | null;
  scorelines?: Array<{ score: string; prob: number }>;
  props?: Record<string, number>; basis?: Basis;
  input_quality?: Record<string, boolean> | null };
/** WHY `model` IS NULL, IN THE BACKEND'S OWN WORDS (2026-10-01). The
 *  per-match route for a competition with no fitted model
 *  (`/api/comp/{key}/match/{event_id}`, src/comp_match.py) sends
 *  `model: null` beside `model_refusal` — a stated position, not a gap.
 *  The four league planes never send it; their dark states stay in their
 *  own configs. */
export type ModelRefusal = { state?: string | null; why?: string | null;
  instead?: string | null; note?: string | null };
/** The board's own frozen pre-kickoff read for a fixture, served READ
 *  ONLY beside a `model_refusal` (TRIVELA src/match_hubs.py `board_read`,
 *  labelled by the review card's own builder). Only its label, clock and
 *  notes are drawn here; the hub never redraws the read's numbers. */
export type BoardRead = { origin?: string | null; origin_label?: string | null;
  origin_note?: string | null; captured_at?: string | null;
  captured_lead_band_means?: string | null; corrections?: number | null;
  /** the match archive's rung ("t60" / "t10") when the read was frozen
   *  by the archive rather than the board (parity W1.4) */
  archive_rung?: string | null;
  captured_seconds_before_kickoff?: number | null;
  unavailable_reason?: string | null;
  /** which store served it: "board_snapshot" | "match_archive" */
  source?: string | null;
  /** a league's `not_frozen`: the match archive's own code beside it */
  archive_read?: string | null;
  /** the frozen board row. Only its two NAMES are drawn here (who the
   *  board named the favourite, over whom), plus its derived
   *  `venue_class` on the venue line; its numbers stay on the review
   *  card. A refused read is `{refused: true, ...}` with no favourite. */
  state?: { favourite?: unknown; opponent?: unknown; refused?: unknown;
    venue_class?: unknown } | null };
/** Why the hub's Kalshi book is what it is, in the backend's words
 *  (src/match_hubs.py `book_meta`). "unavailable" is NOT "no book
 *  exists" — its `means` says which. `families` is every non-winner
 *  family's status on the generic route (W1.11) — `{}` when the winner
 *  did not bridge. The four league planes send none. */
type BookMeta = { status?: string | null; means?: string | null;
  families?: unknown; families_read?: number | null;
  winner_means?: string | null;
  /** why every family is unread: the winner did not bridge */
  families_not_read_because?: string | null;
  /** the competition's listed series that are NOT a market on one match
   *  (season and stage outrights), named in the backend's words */
  other_series?: unknown };
/** The backend's prose names a payload key in backticks; the reader gets
 *  words, never the key. */
const plainWords = (t: string) =>
  t.replace(/`board_read`/g, "the board read below")
    .replace(/ \(`traders_model`\)/g, " above")
    .replace(/`traders_model`/g, "the trader's model line above")
    .replace(/`([^`]*)`/g, "$1");
export type ModelInfo = { model_version?: string; shadow?: boolean;
  primary?: ModelRun; latest?: ModelRun; t10_lock?: ModelRun | null };

/** Everything a league is ALLOWED to differ in. Copy and capability
 *  only — the structure is this file's and is not configurable. */
export interface HubCfg {
  /** board deep-link query value ("mls") and API base ("/api/mls") */
  boardQuery: string;
  api: string;
  /** title suffix + fallback words ("MLS" -> "MLS match") */
  tag: string;
  boardLabel: string;
  /** where "back" falls back to on a direct load. Absent = the leagues
   *  carousel at ?league=<boardQuery>, which only the four league planes
   *  have a pane in; the hubs added 2026-10-01 go back to the board. */
  back?: { href: string; label: string };
  accentVars: React.CSSProperties;
  accentHex: string;
  version: string;
  /** the hero chip — each league's exact historical wording */
  chip: (model: ModelInfo | null, run?: ModelRun) => string;
  /** card-v1 competition slug; absent = no suggestion card, no Card nav.
   *  The union is SuggestionCard's own prop type — a league without a
   *  card-v1 backend cannot be wired here by accident. */
  suggestion?: "mls-2026" | "epl-2026" | "la-liga-2026";
  /** the scouting panel's header label. Default SCOUTING_MEASURED: the
   *  form/H2H input class was measured non-predictive on the CLUB
   *  corpus. A national hub says it was never measured there instead
   *  (lib/compHub.ts) — the finding is not stretched past its data. */
  scoutingNote?: string;
  /** extra pill on the market section (Liga MX keeps its dark pill) */
  marketPill?: (run?: ModelRun) => string;
  /** the market section carries the temporal-basis panel */
  temporal: boolean;
  marketFootnote: string;
  modelEmptyText: string;
  likelihoodTooltip: string;
  netEdgeTooltip: string;
  tableFootnote: string;
  howTheyPlayNote: string;
  lineups: {
    title: string;
    /** per-player strength machinery (xg/90 column + absences) */
    rich: boolean;
    /** tail of the fetched-now note's first line */
    fetchedLine: string;
    /** the second line when no run exists */
    darkRunText: string;
    footnote: (strengthAvailable: boolean | undefined) => string;
  };
  footer: string;
}

// the net-edge gate's per-contract fee, unquantized — the same quantity
// the backend compares against a probability (src/lib/fee.ts). ONE
// definition: two of the four forks had quietly regressed to a naive
// per-contract float here.
const fee = unitFeeDollars;
const DRAW_COLOR = "#52525b";          // neutral — no club owns the draw

function fmtTime(iso?: string | number | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    timeZone: TZ,
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** "10m before kickoff" from a second count; null when there is none.
 *  Whole minutes — a freeze clock is not a stopwatch — and a negative
 *  lead is said as AFTER kickoff rather than hidden. */
function leadWords(seconds?: number | null): string | null {
  if (seconds == null || !Number.isFinite(seconds)) return null;
  const s = Math.abs(Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const span = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return seconds < 0 ? `${span} AFTER kickoff` : `${span} before kickoff`;
}

/** THE VENUE, LABELLED (parity W1.12). Who hosts is said only from a
 *  DERIVED venue class: the route's own `venue_class`, which every hub
 *  route serves (match_hubs.venue_class_of — the board column's rule for
 *  the competition), else the class the frozen pre-kickoff read was
 *  computed with (`board_read.state.venue_class`). ESPN's own
 *  `neutralSite` flag was false on every one of 341 recorded national
 *  summaries, neutral grounds included, so it is never read as "home" —
 *  and on neutral ground the listed home side is only ESPN's listing
 *  order. With no class on the page, the line says WHY there is none
 *  (lib/hubParity VenueSource), never just that it is missing. */
function VenueLine({ v, source, m, slug }: {
  v: VenueRead | null; source: VenueSource; m: Match; slug: string;
}) {
  const nation = isNationHub(slug);
  const home = m.home.name || "the listed home side";
  const away = m.away.name || "the listed away side";
  const raw = v?.class ?? null;
  const cls: VenueClass | "absent" | "unrecognised" = raw == null ? "absent"
    : (VENUE_CLASSES as readonly string[]).includes(raw)
      ? raw as VenueClass : "unrecognised";
  const basis = v?.basis && cls !== "UNKNOWN"
    ? VENUE_BASIS_WORDS[v.basis] : undefined;
  const why = v?.unresolved_why ? venueUnresolvedWords(v.unresolved_why)
    : undefined;
  // where the ground is, when the backend placed it (words, not a code)
  const place = [v?.venue?.name, v?.venue?.country ?? v?.country]
    .filter((x): x is string => typeof x === "string" && !!x.trim())
    .join(", ");
  let text: string;
  switch (cls) {
    case "NEUTRAL":
      text = "neutral ground — neither side's country hosts, so “home” "
        + "and “away” here are only ESPN's listing order; no side is "
        + "treated as host";
      break;
    case "TRUE_HOME":
      text = nation
        ? `${home} hosts — the venue is in the listed home side's country`
        : `${home} hosts — the venue is in the country where the listed `
          + "home side's league plays, and the away side's league does not";
      break;
    case "OPPONENT_COUNTRY":
      text = (nation
        ? `${away} hosts — the venue is in the listed away side's country`
        : `${away} hosts — the venue is in the country where the listed `
          + "away side's league plays")
        + `; ESPN lists ${home} first, which is only its listing order`;
      break;
    case "DOMESTIC":
      text = `${home} hosts — both clubs' league plays in the venue's `
        + "country, so the listed home side is taken as host (the board's "
        + "rule; the ground itself is not placed)";
      break;
    case "UNKNOWN":
      text = "venue not placed — the venue could not be resolved to a "
        + "country, so no side is treated as host"
        + (why ? ` (${why})` : "");
      break;
    case "unrecognised":
      text = "the venue class sent is not one this page knows, so the "
        + "ground is not read as home or as neutral";
      break;
    default:
      text = (m.neutral_site === true
        ? "ESPN flags this ground as a neutral site — the provider's flag, "
          + "not a derived class. " : "")
        + "venue class not on this page — "
        + (source === "hub_route"
          ? "this hub's match route sent a venue class with no class in it"
          : source === "frozen_read" ? VENUE_GAP_WORDS.read_without_class
            : VENUE_GAP_WORDS[source])
        + (nation
          ? ". ESPN's own neutral-site flag is not read as a measurement "
            + "(it was false on every recorded national summary, neutral "
            + "grounds included), so “home” here is only ESPN's listing "
            + "order"
            + (slug === "afcon"
              ? "; at the AFCON finals, two non-host nations meet on "
                + "neutral ground" : "")
          : ", so “home” is ESPN's listing and this page does not "
            + "classify the ground");
  }
  return (
    <p data-testid="venue-class" data-class={cls} data-source={source}
      className="mb-3 min-w-0 font-mono text-[10px] leading-relaxed text-ink-faint">
      <span className="uppercase tracking-[0.14em] text-ink-low">venue · </span>
      {text}{basis ? ` · ${basis}` : ""}
      {cls !== "absent" && place ? ` · ${place}` : ""}
      {cls !== "absent" && (source === "hub_route" || source === "frozen_read")
        ? ` · ${VENUE_SOURCE_WORDS[source]}` : ""}
    </p>
  );
}

/* club signature colors: ESPN hex, alternate when the primary would
   vanish on the near-black canvas */
function luminance(hex: string): number {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
function sideColor(s: Side, fallback: string): string {
  for (const c of [s.color, s.alt_color]) {
    const h = (c ?? "").replace(/^#/, "");
    if (/^[0-9a-fA-F]{6}$/.test(h) && luminance(h) > 0.12) return `#${h}`;
  }
  return fallback;
}

/** A PAYLOAD WITH A SECTION MISSING IS NOT A CRASH (2026-10-01).
 *  The hubs added for the seven competitions without a fitted model read
 *  a generic per-match route, and an earlier Safari crash came from
 *  indexing a block that was not there. The arrays every section maps
 *  over are made arrays here, once, and the two sides made objects — a
 *  missing list is drawn as an empty one, which each section already
 *  words ("no stats yet"), never as a thrown render. */
function normalMatch(raw: Match): Match {
  const side = (s: unknown): Side =>
    s && typeof s === "object" ? (s as Side) : {};
  return {
    ...raw,
    home: side(raw.home), away: side(raw.away),
    stats: Array.isArray(raw.stats) ? raw.stats : [],
    events: Array.isArray(raw.events) ? raw.events : [],
    scouting: raw.scouting && typeof raw.scouting === "object" ? {
      last_five: Array.isArray(raw.scouting.last_five)
        ? raw.scouting.last_five.filter(Boolean)
            .map((t) => ({ ...t, games: Array.isArray(t.games) ? t.games : [] }))
        : [],
      head_to_head: Array.isArray(raw.scouting.head_to_head)
        ? raw.scouting.head_to_head : [],
    } : undefined,
  };
}

/** ONE SECTION THAT DID NOT DRAW TAKES ONLY ITSELF DOWN. Each block of
 *  the hub sits in its own boundary (components/ErrorBoundary), so a
 *  shape nobody anticipated costs that block and says so in plain ink —
 *  never the whole page, and never a blank that reads as "nothing to
 *  show". It retries on the next successful read. */
function Guard({ name, k, children }: {
  name: string; k: unknown; children: React.ReactNode;
}) {
  return (
    <ErrorBoundary resetKey={k} fallback={() => (
      <p data-testid="section-down" data-section={name}
        className="mt-6 rounded-xl border border-dashed border-line px-4 py-3 font-mono text-[10px] leading-relaxed text-ink-faint">
        {name} — this section could not be drawn from the payload received.
        Nothing here is a claim about the match; the rest of the page does
        not depend on it.
      </p>
    )}>
      {children}
    </ErrorBoundary>
  );
}

/** THE ONE THING ON THE HUB THAT TICKS, IN A LEAF OF ITS OWN (2026-09-25).
 *  The 1s countdown clock used to be `now` state on the whole hub, so the
 *  entire 1,500-line tree re-rendered every second to move four digits
 *  (audit F6). It renders nothing once kick-off has passed. */
function KickCountdown({ at }: { at: string }) {
  const [now, setNow] = useState(() => Date.now());
  const kick = new Date(at).getTime();
  useEffect(() => {
    if (!(kick > Date.now())) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [kick]);
  const secs = Math.floor((kick - now) / 1000);
  if (!(secs > 0)) return null;
  return (
    <span className="font-mono text-[11px] tabular-nums text-ink-low">
      in {countdown(secs)}
    </span>
  );
}

export default function MatchHub({ cfg }: { cfg: HubCfg }) {
  const router = useRouter();
  const eventId = typeof router.query.eventId === "string"
    ? router.query.eventId : null;
  const [m, setM] = useState<Match | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [books, setBooks] = useState<Family[]>([]);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [refusal, setRefusal] = useState<ModelRefusal | null>(null);
  const [boardRead, setBoardRead] = useState<BoardRead | null>(null);
  const [bookMeta, setBookMeta] = useState<BookMeta | null>(null);
  // the route's own derived venue class, as received (W1.12)
  const [routeVenue, setRouteVenue] = useState<unknown>(null);
  const [lineups, setLineups] = useState<Lineups | null>(null);
  // the trader's model line (Son, 2026-10-06): what the trading agent
  // prices this match from, as the backend's `traders_model` sends it
  const [trader, setTrader] = useState<TradersModel | null>(null);
  // THE FAILURE IS NAMED, NOT A BOOLEAN (2026-09-25). This was `err: true`
  // off `Promise.reject(r.status)` then `.catch(() => setErr(true))`, so
  // the status and the backend's own sentence were thrown away and the
  // page could only say "unavailable".
  const [err, setErr] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState(0);      // when `book` was pulled

  // ONE POLLER (lib/usePoll): no overlap, paused in a hidden tab, backing
  // off while the feed keeps failing — and STOPPED at full time, because a
  // finished match's feed cannot change and every open tab of one used to
  // ask it again every 30s for ever (audit F6).
  usePoll(async (signal) => {
    if (!eventId) return "stop";
    let r: Response;
    try {
      r = await fetch(`${cfg.api}/match/${eventId}`, { signal });
    } catch {
      if (signal.aborted) return "stop";
      setErr(NEVER_ANSWERED);
      return "failed";
    }
    if (!r.ok) {
      setErr(await failureOf(r));
      return "failed";
    }
    const d = await r.json();
    if (signal.aborted) return "stop";
    if (!d?.match || typeof d.match !== "object") {
      setErr("the backend answered with no match block");
      return "failed";
    }
    setM(normalMatch(d.match)); setBook(d.book ?? null);
    setBooks(Array.isArray(d.books) ? d.books : []);
    setModel(d.model ?? null); setLineups(d.lineups ?? null);
    setRefusal(d.model ? null : (d.model_refusal ?? null));
    setBoardRead(d.board_read && typeof d.board_read === "object" ? d.board_read : null);
    setBookMeta(d.book_meta && typeof d.book_meta === "object" ? d.book_meta : null);
    setRouteVenue(d.venue_class ?? null);
    setTrader(d.traders_model && typeof d.traders_model === "object"
      ? d.traders_model : null);
    setErr(null);
    setFetchedAt(Date.now());
    return d.match?.state === "post" ? "stop" : "ok";
  }, 30000, [eventId, cfg.api]);

  const live = m?.state === "in";
  const post = m?.state === "post";
  // the canonical T-10 lock is the fixture's model once it exists —
  // a later scheduled run must never silently supersede it (V8 eval F9)
  const run = model?.primary ?? model?.latest;
  // the derived venue class rides on the frozen pre-kickoff read (W1.12)
  const venue = venueFrom(cfg.boardQuery, routeVenue, boardRead);
  const activeSection = useScrollSpy([
    ...(cfg.suggestion ? ["card"] : []),
    "prediction", "strategy", "markets", "stats"]);

  return (
    <div style={cfg.accentVars} className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>
        {m ? (m.home.score != null && m.away.score != null
          ? `${m.home.abbrev} ${m.home.score}–${m.away.score} ${m.away.abbrev} · ${cfg.tag}`
          : `${m.home.abbrev} vs ${m.away.abbrev} · ${cfg.tag}`) : `${cfg.tag} match`}
      </title></Head>

      <TopBar back={cfg.back ?? {
          href: `/bet-suggester/leagues?league=${cfg.boardQuery}`,
          label: cfg.boardLabel }}
        title={m ? `${m.home.abbrev} vs ${m.away.abbrev}` : cfg.tag}>
        {live && (
          <NavChip href="#stats">
            <span className="pulse-dot mr-1 inline-block h-1 w-1 rounded-full bg-live align-middle" />
            <span className="text-live">
              {m?.home.abbrev} {m?.home.score}–{m?.away.score} {m?.away.abbrev}
            </span>
          </NavChip>
        )}
        {cfg.suggestion && (
          <NavChip href="#card" active={activeSection === "card"}>Card</NavChip>
        )}
        <NavChip href="#markets" active={activeSection === "markets"}>Markets</NavChip>
        <NavChip href="#prediction" active={activeSection === "prediction"}>Prediction</NavChip>
        <NavChip href="#strategy" active={activeSection === "strategy"}>Strategy</NavChip>
        <NavChip href="#stats" active={activeSection === "stats"}>Live</NavChip>
      </TopBar>

      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        {err && !m && (
          <p data-testid="feed-failed" role="status"
            className="mt-10 rounded-2xl border border-dashed border-warn/40 px-4 py-8 text-center font-mono text-[11px] leading-relaxed text-warn">
            the match feed read failed: {err}. Nothing below is a claim about
            this match. Retrying — less often while it keeps failing.
          </p>
        )}
        {/* A REFRESH THAT FAILED IS NOT A PAGE THAT IS UP TO DATE. The
            30s poll keeps the last good payload on screen when it
            fails — which is right, blanking a live page would read as
            the match stopping — but nothing said so, and one panel
            below labels the book it is showing "current market book ·
            live" with an accent dot beside it. Held numbers under a
            live label is a failed read wearing the face of a good one.
            The timestamp beside it is honest (fetchedAt only advances
            on success), so this line is what makes it readable. */}
        {err && m && (
          <p data-testid="feed-stale"
            className="mt-4 rounded-xl border border-warn/40 px-4 py-2.5 font-mono text-[10px] leading-relaxed text-warn">
            the last refresh FAILED ({err}) — every number below is held
            from the previous successful fetch, not current. Retrying —
            less often while it keeps failing.
          </p>
        )}

        {m && (
          <>
            {/* ===== the match-info box (the original hero card) ===== */}
            <Guard name="match" k={fetchedAt}>
            <Reveal>
              <section className="mt-4 rounded-3xl border border-line bg-elev p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex items-baseline gap-3">
                    <Eyebrow tone="accent">
                      {live ? `live · ${m.minute ?? ""}` : m.detail}
                    </Eyebrow>
                    {m.date && !live && !post && <KickCountdown at={m.date} />}
                  </span>
                  <span className="truncate font-mono text-[10px] uppercase tracking-wide text-ink-faint">
                    {m.venue}
                  </span>
                </div>
                <VenueLine v={venue.v} source={venue.source} m={m}
                  slug={cfg.boardQuery} />
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                  <TeamBlock s={m.home} form={formOf(m, m.home.abbrev)} />
                  <div className={`text-center font-mono text-3xl tabular-nums ${
                    live ? "text-accent" : "text-ink-hi"}`}>
                    {(live || post) ? `${m.home.score}–${m.away.score}` : "–"}
                  </div>
                  <TeamBlock s={m.away} right form={formOf(m, m.away.abbrev)} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                    {cfg.chip(model, run)}
                  </span>
                  {model?.t10_lock && (
                    <span className="rounded-md border border-live/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-live">
                      🔒 t-10 shadow lock recorded
                    </span>
                  )}
                </div>
                <TradersModelLine t={trader} home={m.home.abbrev}
                  away={m.away.abbrev} />
                {/* THE MODEL'S ABSENCE, NAMED. A competition with no fitted
                    model sends `model: null` with the backend's reason;
                    drawing only an empty bar would leave a reader to guess
                    whether a read is pending or was never going to exist. */}
                {!model && refusal && (
                  <div data-testid="model-refusal" data-state={refusal.state ?? ""}
                    className="mt-3 rounded-xl border border-dashed border-line px-4 py-3">
                    {/* "no SHADOW model": the trader's model line above is
                        a model read, so this heading names exactly what is
                        absent and never denies that line (hub-champ-fix) */}
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
                      no shadow model for this competition
                    </p>
                    {refusal.why && (
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-faint">
                        {plainWords(refusal.why)}
                      </p>
                    )}
                    <p data-testid="board-read" data-origin={boardRead?.origin ?? "absent"}
                      data-source={boardRead?.source ?? ""}
                      data-reason={boardRead?.unavailable_reason ?? ""}
                      className="mt-2 font-mono text-[10px] leading-relaxed text-ink-faint">
                      {boardRead?.origin === "captured"
                        ? <>board read · {boardRead.origin_label ?? "captured"}
                            {boardRead.archive_rung && (
                              <> <span data-testid="board-read-rung">
                                at {boardRead.archive_rung.toUpperCase()
                                  .replace(/^T(\d+)$/, "T-$1")}
                              </span></>
                            )}
                            {boardRead.captured_at ? ` ${fmtTime(boardRead.captured_at)}` : ""}
                            {boardRead.captured_lead_band_means
                              ? ` · ${boardRead.captured_lead_band_means}`
                              : leadWords(boardRead.captured_seconds_before_kickoff)
                                ? ` · ${leadWords(boardRead.captured_seconds_before_kickoff)}` : ""}
                            {" · "}{boardRead.origin_note} · a read, not a signal</>
                        : <>no board read on record · {boardRead?.origin_note
                            ?? "the payload carried no board read, so whether one was frozen is not known here"}</>}
                    </p>
                    {/* A LEAGUE'S `not_frozen` CARRIES THE ARCHIVE'S OWN
                        ANSWER beside it: no snapshot, and what the match
                        archive said — said, not folded into "none". */}
                    {boardRead?.origin !== "captured" && boardRead?.archive_read && (
                      <p data-testid="board-read-archive"
                        data-archive={boardRead.archive_read}
                        className="mt-1 font-mono text-[10px] leading-relaxed text-ink-faint">
                        and {ARCHIVE_READ_WORDS[boardRead.archive_read]
                          ?? ARCHIVE_READ_UNKNOWN}
                      </p>
                    )}
                    {/* A FROZEN REFUSAL IS A READ, NOT A MISSING ONE: the
                        board declined to name a favourite before kickoff,
                        and that is what it said. */}
                    {boardRead?.origin === "captured"
                      && boardRead.state?.refused === true && (
                      <p data-testid="board-read-refused"
                        className="mt-1 font-mono text-[10px] leading-relaxed text-ink-low">
                        frozen before kickoff, the board refused this
                        pairing and named no favourite — what it said, not
                        a pick
                      </p>
                    )}
                    {boardRead?.origin === "captured" && (() => {
                      const fav = boardRead.state?.favourite;
                      const opp = boardRead.state?.opponent;
                      if (typeof fav !== "string" || !fav
                          || typeof opp !== "string" || !opp) return null;
                      return (
                        <p data-testid="board-read-favourite"
                          className="mt-1 font-mono text-[10px] leading-relaxed text-ink-low">
                          frozen before kickoff, the board named{" "}
                          <span className="text-ink-mid">{fav}</span> the
                          favourite over <span className="text-ink-mid">{opp}</span>{" "}
                          — what it said, not a pick
                        </p>
                      );
                    })()}
                  </div>
                )}
              </section>
            </Reveal>
            </Guard>

            <div className="mt-2 grid items-start gap-x-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]">
            <div className="min-w-0">
            {/* ===== model vs market, minute by minute (round 5) ===== */}
            <Guard name="model vs market" k={fetchedAt}>
            {eventId && <ModelVsMarket api={cfg.api} eventId={eventId} match={m} />}
            </Guard>
            {/* in play, the live read jumps the queue — see bottom */}
            <Guard name="live read" k={fetchedAt}>
            {live && <LiveBlock m={m} promoted hex={cfg.accentHex} />}
            </Guard>
            <Guard name="live ratings" k={fetchedAt}>
            {live && eventId && <RatingsBlock eventId={eventId} />}
            </Guard>

            {/* ===== the suggestion card — every layer present or
                refusing by name (card-v1) ===== */}
            <Guard name="suggestion card" k={fetchedAt}>
            {eventId && cfg.suggestion && (
              <SuggestionCard key={eventId} competition={cfg.suggestion}
                eventId={eventId} />
            )}
            </Guard>

            </div>{/* /main column */}
            <aside className="min-w-0 lg:pt-4">
            {/* ===== xG duel =====
                THE SIMULATOR'S xG, IN EVERY LEAGUE, AND SAID SO. `run.xg`
                is the model's Poisson means — every league's backend model
                (src/live/model_{mls,epl,laliga,ligamx}.py and the four
                European planes' euro_model_core.py) returns the
                simulator's `out["xg"]` — never a provider's measured xG.
                Only Liga MX said "sim"; it was a per-league switch, and
                MLS, the one league with REAL measured xG elsewhere on this
                page (official stats, xg/90 in the lineups), printed its
                model means as plain "xG". What the number IS does not vary
                by league, so the qualifier no longer can. A hub with no
                model has no `run` and draws no rail. */}
            <Guard name="xG" k={fetchedAt}>
            {run?.xg && (
              <Reveal>
                <section className="mt-8">
                  <div className="grid grid-cols-3 gap-3">
                    <Stat label={`${m.home.abbrev} sim xG`}
                      value={run.xg.home.toFixed(2)} />
                    <Stat label={`${m.away.abbrev} sim xG`}
                      value={run.xg.away.toFixed(2)} />
                    <Stat label="sims" value={run.n_simulations?.toLocaleString() ?? "—"} />
                  </div>
                  {run.xg.home + run.xg.away > 0 && (
                    <div className="mt-3">
                      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                        <div className="rounded-full"
                          style={{
                            width: `${(run.xg.home / (run.xg.home + run.xg.away)) * 100}%`,
                            background: sideColor(m.home, cfg.accentHex),
                          }} />
                        <div className="flex-1 rounded-full bg-elev2" />
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                        <span className="min-w-0 truncate">{m.home.abbrev} {pct(run.xg.home / (run.xg.home + run.xg.away))} of sim xG</span>
                        <span className="min-w-0 truncate">{m.away.abbrev}</span>
                      </div>
                    </div>
                  )}
                </section>
              </Reveal>
            )}
            </Guard>

            {/* ===== how they play — fitted ratings, no hand-waving ===== */}
            <Guard name="how they play" k={fetchedAt}>
            <HowTheyPlay m={m} run={run} note={cfg.howTheyPlayNote} />
            </Guard>

            {/* ===== team news: announced XI + notable absentees ===== */}
            <Guard name="lineups" k={fetchedAt}>
            <LineupSection lu={lineups} m={m} run={run} cfg={cfg.lineups} />
            </Guard>

            {/* ===== team news: provider absences, every hub (W1.6) ===== */}
            <Guard name="team news" k={fetchedAt}>
            {eventId && (
              <HubTeamNews eventId={eventId} slug={cfg.boardQuery}
                home={m.home.name ?? ""} away={m.away.name ?? ""}
                post={post} />
            )}
            </Guard>

            {/* ===== ESPN scouting: form + H2H ===== */}
            <Guard name="scouting" k={fetchedAt}>
            <ScoutingSection m={m} note={cfg.scoutingNote ?? SCOUTING_MEASURED} />
            </Guard>

            </aside>{/* /rail */}
            </div>{/* /grid — the decision flow continues full-main below */}
            {/* ===== market vs model — the aligned three-way bars ===== */}
            <Guard name="market and model" k={fetchedAt}>
            <section id="markets" className="mt-10">
              <Reveal>
                <div className="rounded-2xl border border-line bg-elev p-5">
                  <div className="mb-1 flex items-center justify-between">
                    <Eyebrow tone="accent">market · kalshi three-way · open book now</Eyebrow>
                    {cfg.marketPill && (
                      <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-faint">
                        {cfg.marketPill(run)}
                      </span>
                    )}
                  </div>
                  {cfg.temporal && (
                    <TemporalBasis model={model} run={run}
                      fetchedAt={fetchedAt} version={cfg.version} />
                  )}
                  <MarketBar m={m} book={book} run={run} hex={cfg.accentHex} />
                  {/* WHY THERE IS NO BOOK, IN THE BACKEND'S WORDS. Its
                      "unavailable" is not "no book exists" — a failed
                      registry read and a settled book that left the
                      board are different facts, and `means` says which. */}
                  {!book && bookMeta?.means && bookMeta.status !== "ok" && (
                    <p data-testid="book-meta"
                      className="mt-2 font-mono text-[10px] leading-relaxed text-ink-low">
                      why — {plainWords(bookMeta.means)}
                    </p>
                  )}
                  {/* HOW THE OTHER FAMILIES WERE JOINED, in the backend's
                      words, when it read them (generic hubs, W1.11). */}
                  {book && bookMeta?.status === "ok"
                    && typeof bookMeta.families === "object"
                    && bookMeta.families !== null && !!bookMeta.means && (
                    <p data-testid="families-means"
                      className="mt-2 font-mono text-[10px] leading-relaxed text-ink-low">
                      {plainWords(bookMeta.means)}
                    </p>
                  )}
                  {/* THE PANEL AND THE CHART READ DIFFERENT KALSHI CLOCKS
                      (hub-champ-fix). A finished CNL hub drew Kalshi
                      prices in the chart above a panel saying no book
                      matched; both were right, about different moments. */}
                  {!book && (
                    <p data-testid="book-vs-chart"
                      className="mt-1 font-mono text-[10px] leading-relaxed text-ink-faint">
                      this panel reads Kalshi&apos;s CURRENT open list; the
                      model vs market chart above draws the Kalshi quotes
                      stored while the book was open, when any were
                    </p>
                  )}
                  {!book && books.length === 0 && (
                    <p data-testid="families-none"
                      className="mt-1 font-mono text-[10px] leading-relaxed text-ink-faint">
                      {bookMeta?.families_not_read_because
                        ? <>no Kalshi family is on this page for this match
                            — {plainWords(bookMeta.families_not_read_because)}</>
                        : <>no Kalshi family is on this page for this match —
                            every other family is read off the winner book,
                            which is not here, so no price is implied for any
                            of them</>}
                    </p>
                  )}
                  <OtherSeries list={bookMeta?.other_series} />
                  <div className="mt-5 border-t border-line pt-4">
                    {/* NO SHADOW RUN, BUT THE TRADER HAS A READ: draw the
                        trader's own 1X2 here, under its own name, rather
                        than an empty "no model" bar beside it (Son,
                        2026-10-06: "I didn't see any model"). */}
                    {!run && trader?.available ? (
                      <div data-testid="markets-traders-model"
                        data-tested={trader.tested ? "yes" : "no"}>
                        <Eyebrow className="mb-1">
                          {trader.title ?? "trader's model (untested)"} · shadow · not advice
                        </Eyebrow>
                        <TripleBar m={m} probs={traderProbs(trader)} hex={cfg.accentHex}
                          caption={`${trader.model ?? "trader's model"} · ${trader.label ?? "experimental, unproven"} · the trading agent's own pre-match read, not an approved shadow model`}
                          emptyText={cfg.modelEmptyText} />
                      </div>
                    ) : (
                      <>
                        <Eyebrow className="mb-1">model outcome probabilities</Eyebrow>
                        <TripleBar m={m} probs={modelProbs(run)} hex={cfg.accentHex}
                          caption={run ? `${cfg.version} · ${run.n_simulations?.toLocaleString()} sims · seed ${run.seed}${run.run_type === "t10" ? " · T-10 LOCK — frozen pre-kickoff" : ""}` : undefined}
                          emptyText={cfg.modelEmptyText} />
                      </>
                    )}
                  </div>
                  <InputQuality run={run} />
                  <p className="mt-4 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
                    {cfg.marketFootnote}
                  </p>
                </div>
              </Reveal>
            </section>
            </Guard>

            {/* ===== model prediction: scorelines + chance chips ===== */}
            <Guard name="model prediction" k={fetchedAt}>
            {run?.scorelines && run.scorelines.length > 0 && (
              <Reveal>
                <Collapse id="prediction" eyebrow="pure model · shadow"
                  title="Model prediction" className="mt-10 mb-0">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {run.scorelines.slice(0, 6).map((s, i) => (
                      <div key={s.score}
                        className={`rounded-xl border p-3 text-center ${
                          i === 0 ? "border-accent/40 bg-accent/5" : "border-line"}`}>
                        <p className="font-mono text-lg tabular-nums text-ink-hi">{s.score}</p>
                        <p className="mt-1 font-mono text-[11px] tabular-nums text-ink-low">{pct(s.prob)}</p>
                      </div>
                    ))}
                  </div>
                  {run.props && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {([["btts", "Both teams score"], ["over_1_5", "Over 1.5"],
                        ["over_2_5", "Over 2.5"], ["over_3_5", "Over 3.5"]] as const)
                        .filter(([k]) => run.props![k] != null)
                        .map(([k, label]) => (
                          <span key={k}
                            className="rounded-lg border border-line px-3 py-1.5 font-mono text-[11px] text-ink-mid">
                            {label}{" "}
                            <span className="tabular-nums text-ink-hi">{pct(run.props![k])}</span>
                          </span>
                        ))}
                    </div>
                  )}
                </Collapse>
              </Reveal>
            )}
            </Guard>

            {/* ===== every market, right under the pure-model view ===== */}
            <Guard name="every market" k={fetchedAt}>
            <MarketsTable m={m} run={run} book={book} families={books} cfg={cfg}
              familyReport={bookMeta ? bookMeta.families : undefined} />
            </Guard>

            {/* ===== scenario engine ===== */}
            <Guard name="scenario engine" k={fetchedAt}>
            <Reveal>
              <Collapse id="strategy" eyebrow="scenario engine"
                title="Betting strategy" className="mt-10 mb-0" defaultOpen={false}>
                <ScenarioSection book={book} />
              </Collapse>
            </Reveal>
            </Guard>

            {/* ===== live stats + timeline (bottom slot when not live) ===== */}
            <Guard name="live stats" k={fetchedAt}>
            {!live && <LiveBlock m={m} hex={cfg.accentHex} />}
            </Guard>

            <p className="mt-12 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
              {cfg.footer}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- hero building blocks ---------- */

/** Last-≤5 results as five tiny cells, the picker board's own strip
 *  (2026-09-01): W green, L red, draws NEUTRAL gray, oldest→newest so
 *  the rightmost cell is the latest. The letters are the backend's,
 *  derived from the score digits beside them — never the provider's
 *  verdict — and the same string feeds the bigger chips in the
 *  scouting section, so the two can never disagree. */
function FormStrip({ form, name }: { form?: string | null; name?: string }) {
  if (!form) return null;
  const letters = form.split("");
  // THE READING KEY IS NOT A TOOLTIP. Every fact this strip carries —
  // which team, how many matches, which end is the latest, and the
  // W/L/D letters themselves — lived on a `title` attribute under an
  // `aria-hidden`, so the strip was five coloured squares and nothing
  // else to anyone not hovering a mouse over it: colour as the sole
  // carrier of meaning, and the caveat that makes the ORDER readable
  // out of reach. The squares stay decorative (the letters are the
  // fact, not the tint) and the sentence is real text in the
  // accessible tree.
  const key = `${name ?? "this team"} — last ${form.length}, `
    + `oldest to newest: ${letters.join(", ")}; rightmost is latest`;
  return (
    <span data-testid="hero-form"
      className="inline-flex flex-none items-center gap-[2px]">
      <span className="sr-only">{key}</span>
      <span aria-hidden data-testid="hero-form-cells" title={key}
        className="inline-flex flex-none items-center gap-[2px]">
      {letters.map((c, i) => (
        <i key={i} data-r={c}
          className={`h-[7px] w-[7px] rounded-[1.5px] ${
            c === "W" ? "bg-up/85"
            : c === "L" ? "bg-neg/75"
            : "bg-line-strong"}${
            i === letters.length - 1
              ? " ring-1 ring-ink-hi/70 ring-offset-1 ring-offset-bs" : ""}`} />
      ))}
      </span>
    </span>
  );
}

/** The scouting block's form string for one side, by abbreviation —
 *  compacted for the strip ("W L D W W" → "WLDWW"). */
function formOf(m: Match, abbrev?: string): string | undefined {
  if (!abbrev) return undefined;
  return m.scouting?.last_five
    .find((t) => t.abbrev === abbrev)?.form?.replace(/[ ?]/g, "");
}

function TeamBlock({ s, right, form }: {
  s: Side; right?: boolean; form?: string;
}) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${
      right ? "flex-row-reverse text-right" : ""}`}>
      {s.logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.logo} alt="" className="h-10 w-10 shrink-0 object-contain" />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink-hi [font-family:var(--font-archivo)] [font-stretch:97%] sm:text-base">
          {s.name}
        </p>
        <p className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint ${
          right ? "justify-end" : ""}`}>
          <span>{s.abbrev}</span>
          <FormStrip form={form} name={s.name} />
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-elev p-4 text-center">
      <p className="truncate font-mono text-xl tabular-nums text-ink-hi">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>
    </div>
  );
}

/* ---------- input-quality honesty row (Phase 5) ---------- */

// Shows what team-selection data existed when the run was made. The
// model does NOT use lineups yet; this exists so missing data reads as
// PENDING, never as silent confidence.
//
// THE SET IS THE PAYLOAD'S, NOT A LIST TYPED HERE. It used to be three
// hand-written pairs, and the backend has emitted FIVE states since
// Phase 5 (src/live/runs.py `_input_quality`: TEAM_DATA_FRESH,
// PLAYER_DATA_FRESH, AVAILABILITY_COMPLETE, LINEUP_CONFIRMED,
// GOALKEEPER_CONFIRMED). PLAYER_DATA_FRESH and AVAILABILITY_COMPLETE
// ride on every run, are false on most of them, and were drawn on
// none — a panel whose whole reason to exist is that missing data must
// not read as silent confidence was itself silent about two fifths of
// it. A guard that names a rule and then hand-lists a subset stays
// green while the omitted case drifts, so this enumerates what
// ARRIVED and only prettifies the names it happens to know.
const QUALITY_LABELS: Record<string, string> = {
  LINEUP_CONFIRMED: "lineup",
  GOALKEEPER_CONFIRMED: "keeper",
  TEAM_DATA_FRESH: "team form",
  PLAYER_DATA_FRESH: "player data",
  AVAILABILITY_COMPLETE: "availability",
};

function InputQuality({ run }: { run?: ModelRun }) {
  const q = run?.input_quality;
  // null is NOT "everything pending": it means the run recorded no
  // quality block at all, which is a different fact and gets its own
  // words rather than an absent panel that reads as nothing to report.
  if (q === null) {
    return (
      <div className="mt-4 border-t border-line pt-3">
        <p data-testid="input-quality-absent"
          className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.14em] text-ink-faint">
          input quality at run time — not recorded on this run. This is
          NOT a statement that the inputs were complete.
        </p>
      </div>
    );
  }
  if (!q) return null;                 // no run at all: nothing to say
  const keys = Object.keys(q).sort();
  return (
    <div className="mt-4 border-t border-line pt-3">
      <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
        input quality at run time
      </p>
      <div data-testid="input-quality" className="flex flex-wrap gap-1.5">
        {keys.map((key) => {
          const ok = q[key];
          const label = QUALITY_LABELS[key]
            ?? key.toLowerCase().replace(/_/g, " ");
          return (
            <span key={key} data-testid="input-quality-chip" data-key={key}
              className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                ok ? "border-up/40 text-up"
                   : "border-line text-ink-faint"}`}>
              {ok ? "✓" : "·"} {label} {ok ? "" : "pending"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- the three-way stacked bar ---------- */

type Triple = { home: number; draw: number; away: number;
  method?: string } | null;

function modelProbs(run?: ModelRun): Triple {
  const o = run?.outcomes;
  if (!o || o.home_win == null || o.draw == null || o.away_win == null) return null;
  return { home: o.home_win, draw: o.draw, away: o.away_win };
}

// normalized bid/ask midpoints, joined to outcomes by ticker
function impliedProbs(m: Match, run?: ModelRun, book?: Book | null): Triple {
  const rows = book?.markets ?? [];
  if (rows.length === 0) return null;
  const byTicker = new Map(
    Object.entries(run?.tickers ?? {}).map(([o, t]) => [t, o]));
  const mids: Record<string, number> = {};
  let askOnly = 0;
  for (const r of rows) {
    let outcome = byTicker.get(r.ticker);
    if (!outcome && (r.label ?? "").trim().toLowerCase() === "tie") outcome = "draw";
    if (!outcome) {
      // last resort: the ticker's trailing team code vs the abbrevs.
      // NOTE Kalshi codes are its own (CDG for Guadalajara, CRA for
      // Cruz Azul) — this only ever matches when they coincide with
      // ESPN's, which is why the label pass above comes first.
      const tail = r.ticker.split("-").pop() ?? "";
      if (tail === m.home.abbrev) outcome = "home_win";
      else if (tail === m.away.abbrev) outcome = "away_win";
      else if (tail === "TIE") outcome = "draw";
    }
    if (!outcome) {
      // final pass: match the market's LABEL against the two club
      // names (Kalshi labels are ASCII, ESPN names carry accents —
      // strip diacritics on both sides before comparing). This lived
      // only in the Liga MX fork before the merge; La Liga, whose
      // clubs are just as accented, never got it — the exact class of
      // stranded fix the shared hub exists to end.
      const label = strip((r.label ?? "").toLowerCase());
      const hn = strip((m.home.name ?? "").toLowerCase());
      const an = strip((m.away.name ?? "").toLowerCase());
      if (label && hn && (label.includes(hn) || hn.includes(label))) {
        outcome = "home_win";
      } else if (label && an && (label.includes(an) || an.includes(label))) {
        outcome = "away_win";
      }
    }
    const ask = parseFloat(r.yes_ask ?? "");
    const bid = parseFloat(r.yes_bid ?? "");
    let mid = NaN;
    if (Number.isFinite(ask) && Number.isFinite(bid)) mid = (ask + bid) / 2;
    else if (Number.isFinite(ask)) { mid = ask; askOnly += 1; }
    if (outcome && Number.isFinite(mid)) mids[outcome] = mid;
  }
  if (mids.home_win == null || mids.draw == null || mids.away_win == null) return null;
  const total = mids.home_win + mids.draw + mids.away_win;
  if (total <= 0) return null;
  return { home: mids.home_win / total, draw: mids.draw / total,
    away: mids.away_win / total,
    method: askOnly > 0
      ? `${askOnly} side${askOnly > 1 ? "s" : ""} ask-only (no bid)`
      : "bid/ask midpoints" };
}

function strip(s: string): string {
  return s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

/* The four temporal objects the evaluator asked to be labeled explicitly
   (V9 eval F16): the frozen T-10 model, the T-10 frozen book, the latest
   diagnostic model, and the CURRENT market book — so a reader never
   mistakes "frozen model vs current market" for a same-moment edge. */
function TemporalBasis({ model, run, fetchedAt, version }: {
  model: ModelInfo | null; run?: ModelRun; fetchedAt: number;
  version: string;
}) {
  const lock = model?.t10_lock ?? null;
  const latest = model?.latest ?? null;
  const showingLock = run?.run_type === "t10";
  const modelUsed = showingLock ? "T-10 lock" : "latest diagnostic";
  type Row = { label: string; value: string; active: boolean };
  const rows: Row[] = [
    { label: "canonical T-10 model",
      value: lock ? `frozen ${fmtTime(lock.captured_at)}`
        : run ? "not locked yet" : "none — model dark",
      active: showingLock },
  ];
  if (latest && (!lock || latest.captured_at !== lock.captured_at))
    rows.push({ label: "latest diagnostic model",
      value: fmtTime(latest.captured_at), active: !showingLock });
  rows.push({ label: "canonical T-10 frozen book",
    value: lock ? "recorded with the lock" : "—", active: false });
  rows.push({ label: "current market book",
    value: `live · ${fmtTime(fetchedAt || undefined)}`, active: true });
  return (
    <div className="mb-4 rounded-xl border border-line bg-elev2 p-3">
      <Eyebrow className="mb-2">temporal basis</Eyebrow>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label}
            className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-low">
              <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${
                r.active ? "bg-accent" : "bg-line-strong"}`} />
              {r.label}
            </span>
            <span className="font-mono text-[10px] tabular-nums text-ink-mid">
              {r.value}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
        {run
          ? `edge below = ${modelUsed} model (${fmtTime(run?.captured_at)}) vs the CURRENT market ask (${fmtTime(fetchedAt || undefined)}) — two different moments. the T-10 frozen book is recorded (in the corpus) but is not the comparator shown here.`
          : `no model exists to compare — ${version} is dark, so the market bar below stands alone as raw exchange prices.`}
      </p>
    </div>
  );
}

function MarketBar({ m, book, run, hex }: {
  m: Match; book: Book | null; run?: ModelRun; hex: string;
}) {
  const probs = impliedProbs(m, run, book);
  const caption = probs
    ? `implied % — normalized ${probs.method}; contains the exchange's spread`
    : undefined;
  return <TripleBar m={m} probs={probs} caption={caption} hex={hex}
    emptyText="no open kalshi book for this fixture right now" />;
}

function TripleBar({ m, probs, caption, emptyText, hex }: {
  m: Match; probs: Triple; caption?: string; emptyText: string; hex: string;
}) {
  if (!probs) {
    return (
      <p className="mt-3 rounded-xl border border-dashed border-line px-4 py-5 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
        {emptyText}
      </p>
    );
  }
  const hc = sideColor(m.home, hex);
  const ac = sideColor(m.away, "#a1a1aa");
  return (
    <div className="mt-3">
      <div className="flex h-3 gap-px overflow-hidden rounded-full">
        <div style={{ width: `${probs.home * 100}%`, background: hc }} />
        <div style={{ width: `${probs.draw * 100}%`, background: DRAW_COLOR }} />
        <div className="flex-1" style={{ background: ac }} />
      </div>
      <div className="mt-1.5 grid grid-cols-3 font-mono text-[11px] tabular-nums">
        <span className="text-left">
          <span style={{ color: hc }}>{m.home.abbrev}</span>{" "}
          <span className="text-ink-hi">{pct(probs.home)}</span>
        </span>
        <span className="text-center text-ink-low">
          draw {pct(probs.draw)}
        </span>
        <span className="text-right">
          <span className="text-ink-hi">{pct(probs.away)}</span>{" "}
          <span style={{ color: ac }}>{m.away.abbrev}</span>
        </span>
      </div>
      {caption && (
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
          {caption}
        </p>
      )}
    </div>
  );
}

/* ---------- how they play (fitted ratings + form) ---------- */

function ratingLine(label: string, v?: number, invert = false) {
  if (v == null) return null;
  const delta = (v - 1) * 100;
  const good = invert ? delta < 0 : delta > 0;
  return (
    <div key={label} className="flex items-baseline justify-between font-mono text-[11px]">
      <span className="uppercase tracking-[0.12em] text-ink-faint">{label}</span>
      <span className={`tabular-nums ${good ? "text-up" : "text-ink-mid"}`}>
        {v.toFixed(2)}× league {delta >= 0 ? `(+${delta.toFixed(0)}%)` : `(${delta.toFixed(0)}%)`}
      </span>
    </div>
  );
}

function HowTheyPlay({ m, run, note }: {
  m: Match; run?: ModelRun; note: string }) {
  const b = run?.basis;
  if (!b?.home_attack) return null;
  const formFor = (abbrev?: string) =>
    m.scouting?.last_five.find((t) => t.abbrev === abbrev)?.form?.replace(/ /g, "");
  const cards = [
    { s: m.home, attack: b.home_attack, defence: b.home_defence,
      games: b.home_games, note: `at home (venue ×${b.venue_home})` },
    { s: m.away, attack: b.away_attack, defence: b.away_defence,
      games: b.away_games, note: "away side" },
  ];
  return (
    <Reveal>
      <Collapse eyebrow="scouting" title="How they play"
        defaultOpen={false} className="mt-8 mb-0">
        <div className="grid gap-3">
          {cards.map((c) => (
            <div key={c.s.abbrev} className="rounded-2xl border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="truncate text-sm font-medium text-ink-hi">{c.s.name}</p>
                <FormChips form={formFor(c.s.abbrev)} />
              </div>
              <div className="space-y-1.5">
                {ratingLine("attack", c.attack)}
                {ratingLine("defence (lower = tighter)", c.defence, true)}
                <div className="flex items-baseline justify-between font-mono text-[11px]">
                  <span className="uppercase tracking-[0.12em] text-ink-faint">basis</span>
                  <span className="tabular-nums text-ink-low">{c.games} games · {c.note}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
          {note}
        </p>
      </Collapse>
    </Reveal>
  );
}

/** THE COMPETITION'S OTHER LISTED SERIES, NAMED (parity review,
 *  2026-10-05). Kalshi lists season and stage outrights under the same
 *  prefix; they are not markets on this match and are never asked for,
 *  but every listed series is either on this page or named here in the
 *  backend's words (`book_meta.other_series`), so none is silently left
 *  out. Folded: it is about the competition, not the match. */
function OtherSeries({ list }: { list: unknown }) {
  const rows = Array.isArray(list)
    ? list.filter((r): r is { series?: string; means?: string } =>
        !!r && typeof r === "object" && typeof r.means === "string"
        && !!r.means.trim())
    : [];
  if (rows.length === 0) return null;
  return (
    <details data-testid="other-series" className="mt-2 min-w-0">
      <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
        {rows.length} other kalshi series for this competition — not
        markets on this match
      </summary>
      <ul className="mt-1.5 space-y-0.5">
        {rows.map((r, i) => (
          <li key={r.series ?? i} data-testid="other-series-row"
            title={r.series}
            className="min-w-0 font-mono text-[10px] leading-relaxed text-ink-low">
            {plainWords(r.means!)}
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ---------- the every-market table ---------- */

// families whose long tails read better folded away until asked for —
// and the register of families NOT on this page (W1.11), folded too
const UNSERVED = "__unserved";
const COLLAPSED_FAMILIES = new Set(
  ["score", "mov", "h1", "h1_total", "h1_spread", "h1_btts", UNSERVED]);

function MarketsTable({ m, run, book, families, cfg, familyReport }: {
  m: Match; run?: ModelRun; book: Book | null; families: Family[];
  cfg: HubCfg;
  /** `book_meta.families` exactly as received (undefined: not sent) */
  familyReport: unknown;
}) {
  // THE NET EDGE COLUMN AND THE CARD ONE SECTION UP DISAGREE ON A
  // STARTED MATCH, AND THE PAGE SAID SO NOWHERE.
  //
  // Since 2026-09-06 the suggestion card's fee gate refuses by NAME on
  // any started fixture: card.py `_pick` takes the start witness and
  // refuses `repriced_book`, "computing no edge and no disagreement
  // against a book the match has moved", because HOLD-EXIT-DESIGN's own
  // last section forbids claiming an in-play edge — none has been
  // measured and two slates were lost testing one.
  //
  // This table computes exactly that number anyway: modelP minus a
  // CURRENT ask minus the fee, from a T-10 model frozen before
  // kickoff, for every market on a book the match has since repriced —
  // and paints it green when it is positive. SuggestionCard renders
  // INSIDE this component, so on a live fixture one screen carries the
  // refusal and the number it refuses, a few hundred pixels apart.
  //
  // The column is NOT suppressed here: removing a data column from
  // four league hubs on one agent's reading is a product decision, not
  // a render fix, and the numbers are real prices. What is fixed is
  // that the disagreement is now stated where the number is, in the
  // card's own vocabulary, instead of being left for a reader to
  // notice. Recorded in the sweep report as the open item it is.
  const started = m.state === "in";
  const [closed, setClosed] = useState<Set<string>>(
    () => new Set(COLLAPSED_FAMILIES));
  // every probability the stored run knows, keyed the way the backend
  // keys each market row (model_key)
  const probs: Record<string, number> = {
    ...(run?.outcomes ?? {}), ...(run?.props ?? {}),
  };
  for (const s of run?.scorelines ?? []) {
    const [h, a] = s.score.split("-");
    probs[`score_${h}_${a}`] = s.prob;
  }
  // the winner family joins by ticker through the approved mapping
  const winnerByTicker = new Map(
    Object.entries(run?.tickers ?? {}).map(([o, t]) => [t, o]));

  const fams = families.length > 0 ? families
    : book ? [{ key: "winner", label: "Winner · 3-way",
                event_ticker: book.event_ticker,
                markets: book.markets }] : [];
  if (fams.length === 0) return null;
  // EVERY FAMILY NOT IN THE TABLE, WITH THE BACKEND'S OWN REASON per
  // family on a generic hub (book_meta.families), grouped so each reason
  // is said once — the unknowns (a failed read, a status with no words)
  // first, because they are the ones a reader must not take for "none".
  const unserved = unservedFamilies({
    generic: cfg.api.startsWith("/api/comp/"),
    served: new Set(fams.map((f) => f.key)), families: familyReport });
  const byReason = FAMILY_REASON_ORDER
    .map((reason) => ({ reason,
      fams: unserved.filter((f) => f.reason === reason) }))
    .filter((g) => g.fams.length > 0);
  const nMarkets = fams.reduce((n, f) => n + f.markets.length, 0);

  const toggle = (key: string) => setClosed((c) => {
    const next = new Set(c);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const rowsFor = (f: Family) => f.markets.map((r) => {
    let mk = r.model_key ?? null;
    if (f.key === "winner") mk = winnerByTicker.get(r.ticker) ?? null;
    const modelP = mk != null ? probs[mk] ?? null : null;
    const ask = r.yes_ask ? parseFloat(r.yes_ask) : NaN;
    const bid = r.yes_bid ? parseFloat(r.yes_bid) : NaN;
    let label = r.label ?? r.ticker;
    if (f.key === "winner") {
      label = mk === "home_win" ? `${m.home.name} win`
        : mk === "away_win" ? `${m.away.name} win`
        : mk === "draw" ? "Draw" : label;
    }
    return { ticker: r.ticker, label, modelP,
      ask: Number.isFinite(ask) ? ask : null,
      bid: Number.isFinite(bid) ? bid : null };
  }).sort((a, b) => (b.modelP ?? -1) - (a.modelP ?? -1));

  return (
    <Reveal>
      <div className="mt-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          every kalshi market on this match · {nMarkets} markets across{" "}
          {fams.length} families · click a group to fold
        </p>
        <div className="overflow-x-auto rounded-xl border border-line">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_5rem_5.5rem_5.5rem] items-center gap-x-3 border-b border-line bg-elev px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-low">
              <span>Market</span>
              <span className="text-right">Likelihood</span>
              <span className="text-right">Net edge</span>
              <span className="text-right">Mult</span>
              <span className="text-right">Ask / Bid</span>
            </div>
            {/* WHAT THE THREE COMPUTED COLUMNS ARE, as text under the
                header they qualify.

                They were `title` attributes, and the NET EDGE one is
                not a nicety: it is the sentence saying that this column
                subtracts a CURRENT ask from a FROZEN model probability
                — "a frozen-model-vs-current-market gap across two
                moments, not the T-10 frozen-book edge". A signed
                percentage in green or red, with the fact that its two
                halves come from different moments reachable only by
                hovering, is a number that reads as an edge and is not
                one. A tooltip is not in the accessible tree, does not
                exist on touch, and never survives a copy of the page —
                and this is the one table on the site an operator reads
                down looking for something to act on. */}
            <div data-testid="markets-column-basis"
              className="space-y-0.5 border-b border-line px-4 py-2.5 font-mono text-[9px] leading-relaxed text-ink-faint">
              <p>likelihood — {cfg.likelihoodTooltip}</p>
              <p>net edge — {cfg.netEdgeTooltip}</p>
              <p>mult — payout multiple at the buyable ask price</p>
              {started && (
                <p data-testid="edge-vs-repriced-book" className="text-warn">
                  THIS MATCH HAS STARTED. The suggestion card above
                  refuses a fee-inclusive edge on a started fixture by
                  name (<span className="font-mono">repriced_book</span>)
                  and computes none, because no in-play edge has been
                  measured. The net edge column below still subtracts a
                  CURRENT ask from a model frozen before kickoff, against
                  a book this match has already repriced — so it is not
                  the same claim the card makes, and it is not an edge.
                </p>
              )}
            </div>
            {fams.map((f) => {
              const fold = closed.has(f.key);
              return (
                <div key={f.key}>
                  <button onClick={() => toggle(f.key)}
                    className="flex w-full items-center gap-2.5 border-b border-line bg-elev/40 px-4 py-2.5 text-left transition-colors hover:bg-elev">
                    <span className={`text-ink-faint transition-transform ${
                      fold ? "" : "rotate-90"}`}>▸</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mid">
                      {f.label}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-faint">
                      {f.markets.length} market{f.markets.length === 1 ? "" : "s"}
                    </span>
                  </button>
                  {!fold && rowsFor(f).map((j) => {
                    const edge = j.modelP != null && j.ask != null
                      ? j.modelP - (j.ask + fee(j.ask)) : null;
                    return (
                      <div key={j.ticker}
                        className="grid grid-cols-[minmax(0,1fr)_5.5rem_5rem_5.5rem_5.5rem] items-center gap-x-3 border-b border-line px-4 py-3 text-sm transition-colors hover:bg-elev">
                        <span className="min-w-0 truncate pr-2 text-ink-hi" title={j.ticker}>
                          {j.label}
                        </span>
                        <span className="text-right font-mono tabular-nums text-ink-hi">
                          {j.modelP != null ? pct(j.modelP) : "—"}
                        </span>
                        <span className={`text-right font-mono tabular-nums ${
                          edge == null ? "text-ink-faint"
                            : edge >= 0 ? "text-up" : "text-neg"}`}>
                          {edge != null ? signedPct(edge) : "—"}
                        </span>
                        <span className="text-right font-mono tabular-nums text-ink-mid">
                          {j.ask != null && j.ask > 0 ? `${(1 / j.ask).toFixed(2)}x` : "—"}
                        </span>
                        <span className="text-right font-mono tabular-nums text-ink-mid">
                          {j.ask != null ? `${Math.round(j.ask * 100)}¢` : "—"}
                          <span className="text-ink-faint">
                            {j.bid != null ? ` / ${Math.round(j.bid * 100)}¢` : ""}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        {/* EVERY FAMILY THE EXCHANGE CAN LIST, PRESENT OR NAMED (parity
            W1.11). A family this payload does not carry is listed with
            WHY — never left for a reader to assume it was looked for and
            found empty. Outside the wide table so it wraps on a phone. */}
        {unserved.length > 0 && (
          <div className="mt-2 rounded-xl border border-line">
            <button data-testid="families-unserved-toggle"
              onClick={() => toggle(UNSERVED)} aria-expanded={!closed.has(UNSERVED)}
              className="flex w-full items-center gap-2.5 bg-elev/40 px-4 py-2.5 text-left transition-colors hover:bg-elev">
              <span className={`text-ink-faint transition-transform ${
                closed.has(UNSERVED) ? "" : "rotate-90"}`}>▸</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mid">
                other kalshi families
              </span>
              <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-faint">
                {unserved.length} not on this page
              </span>
            </button>
            {!closed.has(UNSERVED) && (
              <div className="space-y-3 border-t border-line px-4 py-3">
                {/* each reason said once, over the families it covers */}
                {byReason.map((g) => (
                  <div key={g.reason} data-testid="families-unserved-group"
                    data-reason={g.reason} className="min-w-0">
                    <p data-testid="families-unserved-why"
                      className={`font-mono text-[10px] leading-relaxed ${
                        g.reason === "unavailable" ? "text-ink-low"
                          : "text-ink-faint"}`}>
                      {FAMILY_REASON_WORDS[g.reason as FamilyReason]}
                    </p>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {g.fams.map((f) => (
                        <li key={f.key} data-testid="family-unserved"
                          data-family={f.key} data-reason={f.reason}
                          className="rounded-md border border-dashed border-line px-2 py-0.5 text-[12px] text-ink-low">
                          {f.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <p className="mt-2 font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-faint">
          {cfg.tableFootnote}
        </p>
      </div>
    </Reveal>
  );
}

/* ---------- scenario engine (fee-aware, price-only) ---------- */

function ScenarioSection({ book }: { book: Book | null }) {
  const rows = (book?.markets ?? []).filter((r) => r.yes_ask);
  const [stakes, setStakes] = useState<Record<string, string>>({});
  if (rows.length === 0) {
    return <Empty>no open book to run scenarios against</Empty>;
  }
  // The CANONICAL fee policy (src/lib/fee.ts), which mirrors the
  // backend's order_fee_dollars: ONE ceil-to-centicent fee on the whole
  // order, in integer arithmetic. This used to apply 0.07·P·(1−P) per
  // contract in binary floating point, which both disagreed with the
  // policy and lost a whole contract to rounding ($10.63 at 10c buys
  // 100, not 99).
  const legs = rows.map((r) => {
    const ask = parseFloat(r.yes_ask!);
    const stake = parseFloat(stakes[r.ticker] ?? "") || 0;
    const contracts = maxContractsForStake(ask, stake);
    const cost = orderCostDollars(ask, contracts);
    return { ...r, ask, stake, contracts, cost };
  });
  const totalCost = legs.reduce((s, l) => s + l.cost, 0);
  return (
    <div>
      <p className="mb-4 text-xs leading-relaxed text-ink-low">
        Stake any mix of outcomes at the real ask plus Kalshi&apos;s
        general taker fee — ceil-to-centicent of 0.07·C·P·(1−P), charged
        once on the whole order, exactly as the backend&apos;s fee policy
        computes it. Pure execution arithmetic — this table does not
        opine on which outcome is likely. Not modelled: {FEE_NOT_MODELED}.
      </p>
      <div className="space-y-2">
        {legs.map((l) => (
          <div key={l.ticker}
            className="grid grid-cols-[minmax(0,1fr)_5rem_6rem_7rem] items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-sm">
            <span className="min-w-0 truncate text-ink-hi">{l.label}</span>
            <span className="text-right font-mono tabular-nums text-ink-mid">
              @{Math.round(l.ask * 100)}¢
            </span>
            <input
              inputMode="decimal"
              placeholder="$0"
              value={stakes[l.ticker] ?? ""}
              onChange={(e) => setStakes((s) => ({ ...s, [l.ticker]: e.target.value }))}
              className="rounded-lg border border-line bg-transparent px-2 py-1.5 text-right font-mono text-sm text-ink-hi outline-none focus:border-accent/60"
            />
            <span data-testid={`scenario-contracts-${l.ticker}`}
              className="text-right font-mono text-[11px] tabular-nums text-ink-low">
              {l.contracts > 0 ? `${l.contracts} × → $${l.contracts.toFixed(0)}` : "—"}
            </span>
          </div>
        ))}
      </div>
      {totalCost > 0 && (
        <div className="mt-4 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
            net if each outcome hits
          </p>
          <div className="mt-2 grid gap-1 sm:grid-cols-3">
            {legs.map((w) => {
              const payout = w.contracts;      // $1 per contract
              const net = payout - totalCost;
              return (
                <p key={w.ticker} className="font-mono text-xs tabular-nums text-ink-mid">
                  {w.label}:{" "}
                  <span className={net >= 0 ? "text-up" : "text-neg"}>
                    {net >= 0 ? "+" : ""}${net.toFixed(2)}
                  </span>
                </p>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-[10px] text-ink-faint">
            total at risk ${totalCost.toFixed(2)} · fees included · $1/contract settlement
          </p>
        </div>
      )}
    </div>
  );
}

/* ---------- live stats + timeline ---------- */

function LiveBlock({ m, promoted, hex }: {
  m: Match; promoted?: boolean; hex: string }) {
  const live = m.state === "in";
  const post = m.state === "post";
  return (
    <section id="stats" className={promoted ? "mt-8" : "mt-10"}>
      <Reveal>
        <Collapse eyebrow={live ? "espn live · in play" : "espn live"}
          title="Match stats" defaultOpen={live || post} className="mb-0">
          {m.stats.length === 0 ? (
            <Empty>stats populate after kickoff</Empty>
          ) : (
            <div className="space-y-3">
              {m.stats.map((s) => <StatBar key={s.key} s={s} m={m} hex={hex} />)}
            </div>
          )}
          {m.events.length > 0 && (
            <div className="mt-6 divide-y divide-line rounded-2xl border border-line">
              {m.events.map((e, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5 text-sm">
                  <span className="w-10 shrink-0 font-mono text-[11px] text-ink-faint">
                    {e.minute}
                  </span>
                  <span className={`shrink-0 font-mono text-[11px] uppercase tracking-wide ${
                    e.scoring ? "text-accent" : "text-ink-low"}`}>
                    {e.scoring ? "⚽ " : ""}{e.type}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink-low">
                    {e.text || e.team}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Collapse>
      </Reveal>
    </section>
  );
}

// THE BAR IS DRAWN FROM THE TWO NUMBERS PRINTED ABOVE IT, OR IT IS NOT
// DRAWN. It used to read `(Number.isFinite(h) ? h : 0)` on each side,
// which folds an unreadable stat into a measured zero: a home value
// ESPN did not send printed as "—" while the bar beneath it gave the
// away side the whole width, so the picture said one team had all of
// something the numbers said was unknown. Missing is never zero, and
// the bar must never tell a different story from the digits beside it.
//
// The 50/50 fallback had the same fault one branch over: with both
// sides unreadable it drew a dead heat. Half a split is not a split
// and no split at all is not parity — the bar is simply absent, the
// dashes stand alone, and nothing is implied.
function StatBar({ s, m, hex }: { s: StatRow; m: Match; hex: string }) {
  const h = parseFloat(s.home ?? "");
  const a = parseFloat(s.away ?? "");
  const both = Number.isFinite(h) && Number.isFinite(a);
  const total = both ? h + a : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between font-mono text-[11px] tabular-nums">
        <span className="text-ink-hi">{s.home ?? "—"}</span>
        <span className="uppercase tracking-[0.14em] text-ink-faint">{s.label}</span>
        <span className="text-ink-hi">{s.away ?? "—"}</span>
      </div>
      {both && total > 0 && (
        <div data-testid={`stat-bar-${s.key}`}
          className="flex h-1 gap-0.5 overflow-hidden rounded-full">
          <div className="rounded-full"
            style={{ width: `${(h / total) * 100}%`,
              background: sideColor(m.home, hex) }} />
          <div className="flex-1 rounded-full bg-elev2" />
        </div>
      )}
      {!both && (
        <p data-testid={`stat-unreadable-${s.key}`}
          className="font-mono text-[9px] leading-relaxed text-ink-faint">
          no bar — {Number.isFinite(h) || Number.isFinite(a)
            ? "one side of this stat is not on the feed, and a share "
              + "cannot be formed from one number"
            : "neither side of this stat is on the feed"}.
        </p>
      )}
    </div>
  );
}

/* ---------- team news: announced XI + notable absentees ----------
   DISPLAY CONTEXT ONLY. The walk-forward tests were explicit: an
   XI-strength adjustment does not beat team-xG, and key-attacker
   availability (+0.0034) is not significant — so nothing here moves a
   probability. It answers "who is actually playing?", nothing more.
   xG/90 has no La Liga source; the backend sends lineups=null and
   this section stays absent — honest, not stripped-down. */

function XiRow({ p, rich }: { p: XiPlayer; rich: boolean }) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-[11px]">
      <span className="w-5 shrink-0 text-right tabular-nums text-ink-faint">
        {p.jersey ?? ""}
      </span>
      <span className="min-w-0 flex-1 truncate text-ink-hi">
        {p.name}
        {p.is_goalkeeper && (
          <span className="ml-1 text-ink-faint">(GK)</span>
        )}
      </span>
      <span className="w-10 shrink-0 text-ink-faint">{p.position ?? ""}</span>
      {rich && (
        <span className="w-12 shrink-0 text-right tabular-nums text-ink-low">
          {typeof p.xg90 === "number" ? p.xg90.toFixed(2) : "—"}
        </span>
      )}
    </div>
  );
}

function SideXi({ side, team, rich }: {
  side: SideLineup | null; team?: string; rich: boolean }) {
  // `undefined` = the group is not drawable at all (see the comment on
  // the first block); `null` = the backend could not compute; `[]` = it
  // computed and found nobody. Three facts, three faces, one source.
  const absences: Absence[] | null | undefined =
    rich && side && side.released ? side.key_absences : undefined;
  return (
    <div className="rounded-2xl border border-line p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-ink-hi">{team}</p>
        {side?.formation && (
          <span className="shrink-0 rounded-full border border-line px-2 py-0.5 font-mono text-[9px] tracking-[0.1em] text-ink-low">
            {side.formation}
          </span>
        )}
      </div>

      {/* "AWAITING" IS A CLAIM ABOUT THE WORLD, and it may only be made
          when there is a side object to have made it from. A null side
          is the backend not resolving this club at all — we could not
          ask — and saying "awaiting team news" there asserts that the
          XI simply has not been announced yet, which we do not know.
          The honest version of this distinction already lives four
          fields down on `key_absences` ("This is NOT a statement that
          nobody is missing"); it is the same distinction and it now
          reads the same way. */}
      {!side ? (
        <p data-testid="xi-side-absent"
          className="rounded-xl border border-dashed border-line px-3 py-4 text-center font-mono text-[10px] leading-relaxed tracking-[0.1em] text-ink-faint">
          no lineup record for this side — the feed carried nothing to
          read. This is NOT a statement that the XI is unannounced.
        </p>
      ) : !side.released ? (
        <p className="rounded-xl border border-dashed border-line px-3 py-4 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
          awaiting team news
        </p>
      ) : side.starters.length === 0 ? (
        <p data-testid="xi-released-empty"
          className="rounded-xl border border-dashed border-line px-3 py-4 text-center font-mono text-[10px] leading-relaxed tracking-[0.1em] text-ink-faint">
          the feed reports this XI as released and carried no players in
          it — an empty list where eleven names should be, not eleven
          names we chose not to show.
        </p>
      ) : (
        <>
          <div className="mb-1 flex items-baseline gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            <span className="w-5 shrink-0" />
            <span className="min-w-0 flex-1">starting xi</span>
            <span className="w-10 shrink-0">pos</span>
            {rich && <span className="w-12 shrink-0 text-right">xg/90</span>}
          </div>
          <div className="space-y-1">
            {side.starters.map((p, i) => <XiRow key={i} p={p} rich={rich} />)}
          </div>
        </>
      )}

      {/* AN ABSENCE IS AN ABSENCE FROM SOMETHING. Every block below
          says what is missing from THIS XI, so none of them can be
          drawn before the XI is released: on an unreleased side the
          backend's `[]` is not a measured zero, it is nobody having
          been named yet, and "computed — nobody of note is missing"
          would be a measurement this fixture never had. Released is
          therefore a precondition of the whole group rather than a
          condition on one branch of it, so a fourth block added later
          inherits it. */}
      {absences === null && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            not starting
          </p>
          <p className="font-mono text-[10px] leading-relaxed text-ink-low">
            not available — {side?.key_absences_reason
              || "the backend did not compute absences for this fixture"}.
            This is NOT a statement that nobody is missing.
          </p>
        </div>
      )}

      {/* A MEASURED ZERO IS A RESULT AND GETS SAID. `[]` means the
          backend computed absences and found nobody missing — the type
          comment above says so in as many words — and it used to render
          as nothing at all, which is the same face this block gives the
          not-rich case and the never-computed case. Three different
          facts, one blank. */}
      {absences?.length === 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            not starting
          </p>
          <p data-testid="absences-none"
            className="font-mono text-[10px] leading-relaxed text-ink-low">
            computed — nobody of note is missing from this XI. This is a
            measured result, not an absent read.
          </p>
        </div>
      )}

      {absences != null && absences.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            not starting
          </p>
          <div className="space-y-1">
            {absences.map((a, i) => (
              <div key={i} className="flex items-baseline gap-2 font-mono text-[11px]">
                <span className="min-w-0 flex-1 truncate text-ink-hi">
                  {a.name}
                </span>
                {/* PLAIN INK (news proposal phase 0): "out" is a fact
                    about the XI, not a verdict, so it never wears the
                    negative traffic-light colour. */}
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] ${
                  a.status === "bench"
                    ? "bg-elev2 text-ink-low" : "border border-line text-ink-mid"}`}>
                  {a.status === "bench" ? "bench" : "out"}
                </span>
                <span className="w-12 shrink-0 text-right tabular-nums text-ink-low">
                  {typeof a.xg90 === "number" ? a.xg90.toFixed(2) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LineupSection({ lu, m, run, cfg }: {
  lu: Lineups | null; m: Match; run?: ModelRun; cfg: HubCfg["lineups"] }) {
  if (!lu || (!lu.home && !lu.away)) return null;
  const anyReleased = Boolean(lu.home?.released || lu.away?.released);
  const post = m.state === "post";
  return (
    <Reveal>
      <Collapse eyebrow="team news" title={cfg.title}
        defaultOpen={anyReleased} className="mt-8 mb-0">
        {/* V9.3 eval F19: this block is CURRENT team news, fetched now —
            it is NOT the lineup evidence frozen into the T-10 lock. A
            reader must never attribute information to the model that was
            not available when the lock was created. */}
        <div className="mb-3 rounded-xl border border-line bg-elev2 px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-low">
            {post ? "as-played / latest" : "current team news"} — fetched
            now, {cfg.fetchedLine}
          </p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
            {run?.captured_at
              ? `the model's frozen input is the ${run.run_type === "t10"
                  ? "T-10 lock" : "latest run"} of ${fmtTime(run.captured_at)}`
              : cfg.darkRunText}
            {run?.input_quality
              ? ` · lineup at run time: ${run.input_quality.LINEUP_CONFIRMED
                  ? "confirmed" : "pending"}`
              : ""}
          </p>
        </div>
        <div className="grid gap-4">
          <SideXi side={lu.home} team={m.home?.name} rich={cfg.rich} />
          <SideXi side={lu.away} team={m.away?.name} rich={cfg.rich} />
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
          {cfg.footnote(lu.strength_available)}
        </p>
      </Collapse>
    </Reveal>
  );
}

/* ---------- scouting (ESPN form + H2H) ---------- */

function fmtShortDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString("en-US", {
    timeZone: TZ, month: "short", day: "numeric", year: "numeric" })
    : iso;
}

function FormChips({ form }: { form?: string }) {
  if (!form) return null;
  return (
    <span className="inline-flex gap-1">
      {form.split("").map((c, i) => (
        <span key={i}
          className={`inline-flex h-5 w-5 items-center justify-center rounded font-mono text-[10px] ${
            c === "W" ? "bg-up/20 text-up"
              : c === "L" ? "bg-neg/20 text-neg" : "bg-elev2 text-ink-low"}`}>
          {c}
        </span>
      ))}
    </span>
  );
}

/** The scouting panel's label on a club hub. Form and H2H (ESPN's
 *  `lastFiveGames` / `seasonseries`, reused by every league module) were
 *  measured on the club corpus: H2H NEGATIVE (the model improved when it
 *  was dropped), form5 +0.0001. Display, never pick support
 *  (research_archive/TEST-LEDGER.md). */
export const SCOUTING_MEASURED = "display only — measured non-predictive";

function ScoutingSection({ m, note }: { m: Match; note: string }) {
  const sc = m.scouting;
  if (!sc || (sc.last_five.length === 0 && sc.head_to_head.length === 0)) {
    return null;
  }
  return (
    <Reveal>
      {/* FORM AND H2H WERE MEASURED, AND THEY DO NOT PREDICT. The label
          sits in the HEADER, not inside the panel: the panel ships
          collapsed, and a reader who never opens it still meets the
          result — the way the card's style notes carry theirs. In the
          title rather than a `title=` hover, so it is in the button's
          accessible name too. A national hub's label says it was never
          measured there (`HubCfg.scoutingNote`). */}
      <Collapse eyebrow="scouting"
        title={<>
          ESPN form + H2H{" "}
          <span data-testid="scouting-display-only"
            className="ml-2 inline-block rounded-md border border-warn/40 px-1.5 py-0.5 align-middle font-mono text-[9px] font-normal uppercase tracking-[0.14em] text-warn">
            {note}
          </span>
        </>}
        defaultOpen={false} className="mt-8 mb-0">
        <div className="grid gap-4">
          {sc.last_five.map((t) => (
            <div key={t.team} className="rounded-2xl border border-line p-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium text-ink-hi">{t.team}</p>
                <FormChips form={t.form?.replace(/ /g, "")} />
              </div>
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                {t.abbrev ?? "their"} score first · oldest to newest
              </p>
              <div className="space-y-1.5">
                {t.games.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-[11px]">
                    <span className={`w-4 text-center ${
                      g.result === "W" ? "text-up"
                        : g.result === "L" ? "text-neg" : "text-ink-low"}`}>
                      {g.result}
                    </span>
                    <span className="w-10 tabular-nums text-ink-hi">
                      {g.team_score != null && g.opponent_score != null
                        ? `${g.team_score}–${g.opponent_score}` : "–"}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-ink-low">
                      {g.at_vs === "@" ? "away at" : "home vs"} {g.opponent}
                    </span>
                    <span className="shrink-0 text-ink-faint">{fmtShortDate(g.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {sc.head_to_head.length > 0 && (() => {
          const persp = sc.head_to_head[0]?.perspective ?? "";
          return (
            <div className="mt-4 rounded-2xl border border-line p-4">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
                recent meetings · {persp} score always shown first
              </p>
              <div className="space-y-1.5">
                {sc.head_to_head.map((g, i) => {
                  // ESPN gives the score in that MATCH's home-away
                  // order; reorder it to perspective-first so W/L/D
                  // always agrees with the numbers the eye reads.
                  //
                  // THE ORIENTATION FLAG IS THE ONLY THING THAT MAKES
                  // THE REORDER TRUE, AND IT CAN BE MISSING. This read
                  // `g.at_vs === "@"`, so ANY value that was not the
                  // string "@" — null, undefined, a drifted provider
                  // token — silently became "home" and the two scores
                  // were printed the wrong way round: a 1-2 defeat
                  // rendered "PERSP 2-1 OPP" beside the letter L. The
                  // backend's own legacy branch (src/mls.py `_h2h`,
                  // still parsed "so a restored old field keeps
                  // working") passes `atVs` through RAW and takes
                  // `result` from the provider's `gameResult` rather
                  // than deriving it from the digits — and its sibling
                  // `_last_five` folds the same unknown the OPPOSITE
                  // way (`== "vs"` else away). Two folds, opposite
                  // defaults, one flag: exactly the ESPN
                  // winner-first bug of 2026-07-24, one branch over.
                  //
                  // An unrecognised value REFUSES. It does not fold
                  // into a meaningful class, and the digits are not
                  // attributed to a side the payload did not name.
                  const known = g.at_vs === "@" || g.at_vs === "vs";
                  const away = g.at_vs === "@";
                  const mine = away ? g.away_score : g.home_score;
                  const theirs = away ? g.home_score : g.away_score;
                  if (!known) {
                    return (
                      <div key={i} data-testid="h2h-unoriented"
                        className="flex items-start gap-2 font-mono text-[11px]">
                        <span className="w-4 text-center text-ink-low">
                          {g.result ?? "?"}
                        </span>
                        <span className="min-w-0 flex-1 leading-relaxed text-ink-faint">
                          {g.home_score}–{g.away_score} vs {g.opponent} —
                          the payload carried no home/away orientation for
                          this meeting, so the two scores are NOT
                          attributed to a side here. Shown in the
                          provider&apos;s own order.
                        </span>
                        <span className="shrink-0 text-ink-faint">
                          {fmtShortDate(g.date)}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="flex items-center gap-2 font-mono text-[11px]">
                      <span className={`w-4 text-center ${
                        g.result === "W" ? "text-up"
                          : g.result === "L" ? "text-neg" : "text-ink-low"}`}>
                        {g.result}
                      </span>
                      <span className="w-24 tabular-nums text-ink-hi">
                        {persp} {mine}–{theirs} {g.opponent}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-ink-low">
                        {away ? `away at ${g.opponent}` : "at home"}
                      </span>
                      <span className="shrink-0 text-ink-faint">
                        {fmtShortDate(g.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </Collapse>
    </Reveal>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-line px-4 py-6 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink-faint">
      {children}
    </p>
  );
}


/** THE TRADER'S MODEL LINE (Son, 2026-10-06). The backend's
 *  `traders_model` (src/trading/hub_line.py) is the trading agent's own
 *  pre-match read of this match, through the same interface it trades
 *  from — so this line and the trader cannot disagree. "tested" means
 *  only that the model passed a pre-registered replay of pre-seal history
 *  against the model it replaced; it is never a claim of an edge. Its
 *  absence is NAMED, never drawn as an empty bar. */
type TradersModel = {
  title?: string; tested?: boolean; available?: boolean; label?: string;
  means?: string; why?: string | null; detail?: string | null;
  model?: string | null; source?: string | null; verdict?: string | null;
  p_home?: number; p_draw?: number; p_away?: number;
  read_at?: string | null;
};

/** The trader's 1X2 as the hub's TripleBar reads it; null unless all
 *  three are real numbers (missing is never zero). */
function traderProbs(t: TradersModel): Triple {
  const ok = (p: unknown): p is number => typeof p === "number" && Number.isFinite(p);
  if (!ok(t.p_home) || !ok(t.p_draw) || !ok(t.p_away)) return null;
  return { home: t.p_home, draw: t.p_draw, away: t.p_away };
}

function tmPct(p: unknown): string {
  return typeof p === "number" && Number.isFinite(p)
    ? `${(p * 100).toFixed(1)}%` : "–";
}

function TradersModelLine({ t, home, away }: {
  t: TradersModel | null; home?: string; away?: string }) {
  // NOT SERVED IS NAMED TOO: an older payload without the key says so
  if (!t) {
    return (
      <p data-testid="traders-model-missing"
        className="mt-3 font-mono text-[10px] leading-relaxed text-ink-faint">
        trader&apos;s model · not in this payload, so whether the trader has a
        read of this match is not known here
      </p>
    );
  }
  const title = t.title ?? "trader's model (untested)";
  return (
    <div data-testid="traders-model" data-tested={t.tested ? "yes" : "no"}
      data-available={t.available ? "yes" : "no"}
      className="mt-3 rounded-xl border border-line px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-low">
          {title} · {t.label ?? "experimental, unproven"}
        </p>
        <span data-testid="traders-model-shadow"
          className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
          shadow · not advice
        </span>
      </div>
      {t.available ? (
        <p data-testid="traders-model-1x2"
          className="mt-1 font-mono text-[12px] tabular-nums text-ink-hi">
          {home ?? "home"} {tmPct(t.p_home)} · draw {tmPct(t.p_draw)} · {away ?? "away"} {tmPct(t.p_away)}
          <span className="ml-2 text-ink-faint">
            {t.model ?? ""}{t.verdict ? ` · ${t.verdict.toLowerCase().replace("_", " ")} vs the model it replaced` : ""}
            {t.read_at ? ` · read as of ${fmtTime(t.read_at)}` : ""}
          </span>
        </p>
      ) : (
        <p data-testid="traders-model-absent"
          className="mt-1 text-[12px] leading-relaxed text-ink-faint">
          the trader has no pre-match read of this match
          {t.why ? ` (${t.why})` : ""}
        </p>
      )}
    </div>
  );
}
