// Ported from trivela-analyst lib/factSheet.ts (ccb8f07); buildRungSheet (VAR v2) added 2026-10-25.
/* eslint-disable @typescript-eslint/no-explicit-any */
// Turns one Trivela match payload into a fact sheet: every number the
// Analyst may say, each with a stable id. The LLM only ever sees this sheet,
// and the verifier only ever accepts numbers that are in it.

export type Fact = {
  id: string;
  label: string;
  value: number;
  // How the number is meant to be read: a probability (0-1) is said as a
  // percent, a price in dollars (0-1) is said in cents, the rest as is.
  kind: "prob" | "price" | "goals" | "rating" | "count" | "score";
  source: string;
};

export type FactSheet = {
  league: string;
  eventId: string;
  match: {
    home: string;
    away: string;
    homeAbbrev: string;
    awayAbbrev: string;
    kickoff: string;
    venue: string | null;
    state: string;
  };
  facts: Fact[];
  notes: string[]; // non-numeric context: form strings, data-quality flags
  generatedAt: string | null;
  /** Where the priced numbers came from, when it is not the live match
   *  read: the archive's frozen pre-kickoff rung (VAR v2). Absent on a
   *  live or demo sheet. */
  basis?: SheetBasis;
  /** Set when the match has kicked off and no saved pre-kickoff rung could
   *  be read: every PRICED fact was taken out (the live read is in-play by
   *  then, and VAR never reads in-play prices as if they were the pre-match
   *  read). The sentence says why; the preview does not ask the model and
   *  is never cached. */
  frozenUnavailable?: string;
};

export type SheetBasis = {
  kind: "saved_rung";
  rung: string;            // "t10" | "t60"
  capturedAt: string;      // ISO, the rung's own clock
  label: string;           // "frozen pre-kickoff read (captured HH:MM UTC)"
};

type Json = any; // the Trivela payload is wide and versioned; read it defensively

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
};

export function buildFactSheet(league: string, eventId: string, d: Json): FactSheet {
  const m = d?.match ?? {};
  const home = m.home?.name ?? "Home";
  const away = m.away?.name ?? "Away";
  const facts: Fact[] = [];
  const notes: string[] = [];
  let n = 0;
  const add = (label: string, value: unknown, kind: Fact["kind"], source: string) => {
    const v = num(value);
    if (v === null) return;
    n += 1;
    facts.push({ id: `F${n}`, label, value: v, kind, source });
  };

  // 1. Trivela's model: the league plane's latest simulation run.
  const run = d?.model?.primary ?? d?.model?.latest;
  if (run?.outcomes) {
    const src = `Trivela model ${d.model.model_version ?? ""} (${run.n_simulations ?? "?"} simulations)`.trim();
    add(`${home} win probability`, run.outcomes.home_win, "prob", src);
    add("Draw probability", run.outcomes.draw, "prob", src);
    add(`${away} win probability`, run.outcomes.away_win, "prob", src);
    add(`${home} expected goals`, run.xg?.home, "goals", src);
    add(`${away} expected goals`, run.xg?.away, "goals", src);
    const p = run.props ?? {};
    add("Both teams score probability", p.btts, "prob", src);
    add("Over 2.5 goals probability", p.over_2_5, "prob", src);
    add(`${home} scores first probability`, p.home_first_goal, "prob", src);
    add(`${away} scores first probability`, p.away_first_goal, "prob", src);
    add("No goals probability", p.no_goal, "prob", src);
    for (const s of (run.scorelines ?? []).slice(0, 3)) {
      add(`Exact score ${s.score} probability`, s.prob, "prob", src);
    }
    const b = run.basis ?? {};
    add(`${home} attack rating (1.00 = league average)`, b.home_attack, "rating", src);
    add(`${home} defence rating (lower is better)`, b.home_defence, "rating", src);
    add(`${away} attack rating (1.00 = league average)`, b.away_attack, "rating", src);
    add(`${away} defence rating (lower is better)`, b.away_defence, "rating", src);
    add("League average goals per game", b.league_gpg, "goals", src);
    add("Home advantage multiplier", b.venue_home, "rating", src);
    const q = run.input_quality ?? {};
    if (q.LINEUP_CONFIRMED === false) notes.push("Lineups are not confirmed yet.");
    if (q.AVAILABILITY_COMPLETE === false) notes.push("Injury and availability data is incomplete.");
  } else if (d?.model_refusal) {
    notes.push(`Trivela's model declined to price this match: ${JSON.stringify(d.model_refusal).slice(0, 160)}`);
  }

  // 2. The trading model (a second, independent Trivela model).
  const t = d?.traders_model;
  if (t?.available) {
    const src = `Trivela trading model ${t.model ?? ""}`.trim();
    add(`${home} win probability (trading model)`, t.p_home, "prob", src);
    add("Draw probability (trading model)", t.p_draw, "prob", src);
    add(`${away} win probability (trading model)`, t.p_away, "prob", src);
  }

  // 3. The prediction market: what the crowd's money says (Kalshi asks).
  for (const mk of d?.book?.markets ?? []) {
    const who = mk.label === "Tie" ? "Draw" : mk.label;
    add(`Market price for ${who} (cents, ask)`, mk.yes_ask, "price", "Kalshi order book");
  }

  // 4. Form and head-to-head (ESPN results).
  for (const side of m.scouting?.last_five ?? []) {
    const games = side.games ?? [];
    const w = games.filter((g: Json) => g.result === "W").length;
    const dr = games.filter((g: Json) => g.result === "D").length;
    const l = games.filter((g: Json) => g.result === "L").length;
    add(`${side.team} wins in last ${games.length}`, w, "count", "ESPN results");
    add(`${side.team} draws in last ${games.length}`, dr, "count", "ESPN results");
    add(`${side.team} losses in last ${games.length}`, l, "count", "ESPN results");
    add(`${side.team} games in recent form sample`, games.length, "count", "ESPN results");
    if (side.form) notes.push(`${side.team} recent form (oldest to newest): ${side.form}`);
  }
  const h2h = m.scouting?.head_to_head ?? [];
  if (h2h.length) {
    const persp = h2h[0].perspective;
    const team = persp === m.home?.abbrev ? home : persp === m.away?.abbrev ? away : persp;
    add(`Head-to-head meetings listed`, h2h.length, "count", "ESPN results");
    add(`${team} wins in those meetings`, h2h.filter((g: Json) => g.result === "W").length, "count", "ESPN results");
    add(`Draws in those meetings`, h2h.filter((g: Json) => g.result === "D").length, "count", "ESPN results");
  }

  return {
    league,
    eventId,
    match: {
      home,
      away,
      homeAbbrev: m.home?.abbrev ?? "",
      awayAbbrev: m.away?.abbrev ?? "",
      kickoff: m.date ?? "",
      venue: m.venue ?? null,
      state: m.state ?? "",
    },
    facts,
    notes,
    generatedAt: d?.generated_at ?? null,
  };
}

// --- VAR v2: the saved pre-kickoff rung ------------------------------------
// The backend's /api/<league>/match/<id>/saved-rung (var-saved-rung-v1):
// the archive's frozen t10/t60 board rung, cut to the shadow model 3-way,
// the trading model 3-way and the Kalshi legs, with the rung's capture
// time. It holds no outcome field, so a sheet built from it says nothing
// about how the match went.

/** "HH:MM" of an ISO instant, UTC (the server has no viewer zone). */
export function hhmmUtc(iso: string): string | null {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toISOString().slice(11, 16);
}

export const rungLabel = (capturedAt: string): string =>
  `frozen pre-kickoff read (captured ${hhmmUtc(capturedAt) ?? "time unknown"} UTC)`;

/** True when a saved-rung answer carries at least one number to read. */
export function rungUsable(r: Json): boolean {
  return !!r && r.available === true && typeof r.captured_at === "string"
    && (!!r.model || !!r.trader_model || !!r.market);
}

/** A live payload with every PRICED read taken out: what is left (the
 *  match identity, form and head-to-head) is pre-match context that the
 *  live read still owns after kickoff. */
export const unpriced = (d: Json): Json => {
  if (!d || typeof d !== "object") return {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { model, traders_model, book, model_refusal, ...rest } = d;
  return rest;
};

/** The fact sheet from the saved rung, with the live read's unpriced
 *  context (names, venue, form, head-to-head) when the live read is still
 *  there. Every priced fact names the rung and its capture time in its
 *  source, so a ✓ tooltip says which read the number is. */
export function buildRungSheet(league: string, eventId: string, r: Json, live?: Json): FactSheet {
  const base = live ? buildFactSheet(league, eventId, unpriced(live)) : null;
  const home = base?.match.home && base.match.home !== "Home" ? base.match.home : (r.home ?? "Home");
  const away = base?.match.away && base.match.away !== "Away" ? base.match.away : (r.away ?? "Away");
  const label = rungLabel(r.captured_at);
  const facts: Fact[] = [];
  const add = (lab: string, value: unknown, kind: Fact["kind"], source: string) => {
    const v = num(value);
    if (v === null) return;
    facts.push({ id: "", label: lab, value: v, kind, source });
  };
  const m = r.model;
  if (m) {
    const src = `Trivela model ${m.model_version ?? ""} (${m.n_simulations ?? "?"} simulations), ${label}`.replace("  ", " ");
    add(`${home} win probability`, m.home_win, "prob", src);
    add("Draw probability", m.draw, "prob", src);
    add(`${away} win probability`, m.away_win, "prob", src);
  }
  const t = r.trader_model;
  if (t) {
    const src = `Trivela trading model ${t.name ?? ""}, ${label}`.replace("  ", " ");
    add(`${home} win probability (trading model)`, t.h, "prob", src);
    add("Draw probability (trading model)", t.d, "prob", src);
    add(`${away} win probability (trading model)`, t.a, "prob", src);
  }
  const legs = r.market?.legs;
  if (legs) {
    const src = `Kalshi order book, ${label}`;
    const cents = (c: unknown) => { const v = num(c); return v === null ? null : v / 100; };
    add(`Market price for ${home} (cents, ask)`, cents(legs.h?.ask_c), "price", src);
    add("Market price for Draw (cents, ask)", cents(legs.d?.ask_c), "price", src);
    add(`Market price for ${away} (cents, ask)`, cents(legs.a?.ask_c), "price", src);
  }
  const all = [...facts, ...(base?.facts ?? [])].map((f, i) => ({ ...f, id: `F${i + 1}` }));
  const notes = [
    `Trivela's numbers here are its ${label}, saved before kickoff; they are not a live read.`,
    ...(r.model ? [] : [`The model's frozen read is missing (${String(r.model_missing_reason ?? "not saved").slice(0, 60)}).`]),
    ...(r.market ? [] : [`The market's frozen read is missing (${String(r.market_missing_reason ?? "not saved").slice(0, 60)}).`]),
    ...(base?.notes ?? []),
  ];
  return {
    league,
    eventId,
    match: base ? { ...base.match, home, away } : {
      home, away, homeAbbrev: "", awayAbbrev: "",
      kickoff: typeof r.kickoff === "string" ? r.kickoff : "", venue: null, state: "",
    },
    facts: all,
    notes,
    generatedAt: r.captured_at,
    basis: { kind: "saved_rung", rung: String(r.rung ?? ""), capturedAt: r.captured_at, label },
  };
}

// How a fact is shown to people (and how {{F#}} placeholders render).
export function displayValue(f: Fact): string {
  switch (f.kind) {
    case "prob":
      return `${(f.value * 100).toFixed(0)}%`;
    case "price":
      return `${Math.round(f.value * 100)}¢`;
    case "goals":
    case "rating":
      return f.value.toFixed(2);
    default:
      return String(f.value);
  }
}

// The sheet as the LLM sees it: one line per fact, ids first.
export function sheetForPrompt(s: FactSheet): string {
  const lines = [
    `MATCH: ${s.match.home} vs ${s.match.away} (${s.league.toUpperCase()}), kickoff ${s.match.kickoff}, ${s.match.venue ?? "venue unknown"}`,
    ...(s.basis ? [`DATA: Trivela's ${s.basis.label}. Speak of these numbers as the pre-kickoff read, never as live.`] : []),
    "FACTS (id | label | value as you must say it | source):",
    ...s.facts.map((f) => `${f.id} | ${f.label} | ${displayValue(f)} | ${f.source}`),
  ];
  if (s.notes.length) lines.push("NOTES (no numbers to cite):", ...s.notes.map((x) => `- ${x}`));
  return lines.join("\n");
}
