// Ported from trivela-analyst lib/verify.ts (ccb8f07); tightened 2026-10-25.
// The verification ladder, step 3: every number in the Analyst's text must
// trace to a fact. Numbers written as {{F#}} placeholders are rendered from
// the sheet (correct by construction). Any raw number must match a fact's
// displayed value within rounding, or it is a violation.
//
// TIGHTENED 2026-10-25 (review finding 1). The port only looked for ASCII
// digits with an optional %/¢ and matched them on VALUE alone, so these all
// passed unverified: numbers in words ("sixty-four percent", "seven of their
// last ten"), a leading decimal (".64"), ordinals ("2nd"), suffixed numbers
// ("9pp", "2x", "64pct", "60k"), a sign the sheet does not carry ("-0.04"),
// non-ASCII digits ("６４%"), vocabulary masks for lines and samples the
// sheet does not hold ("last 9", "Over 4.5"), scorelines ("2-1") and goal
// margins ("by 3 goals") that matched an unrelated count, and a percent
// matched to a fact the sentence does not name ("Everton are 22% to draw"
// against Everton's WIN probability). Each is now a violation, with the
// rule that catches it named below. The backend's copy (src/loop/verify.py)
// mirrors these rules.

import { displayValue, type Fact, type FactSheet } from "./factSheet";

export type Violation = { text: string; reason: string };
export type Segment =
  | { type: "text"; text: string }
  | { type: "fact"; text: string; factId: string; label: string; source: string }
  | { type: "flag"; text: string; reason: string };

export type CheckOptions = {
  /** Every value must be a {{F#}} placeholder: a raw number is a violation
   *  even when it matches a fact (the preview's contract — the ladder says
   *  "never as digits"). Scorelines and fixed vocabulary still pass, since
   *  no placeholder can write them. */
  placeholderOnly?: boolean;
};

const PLACEHOLDER = /\{\{\s*(F\d+)\s*\}\}/g;

// Fixed football vocabulary that is never a claim, whatever the sheet says.
const VOCAB = [/\b1X2\b/gi, /\b(?:3|three)[-\s]way\b/gi, /\bthe\s+two\s+(?:sides|teams|clubs|of\s+them)\b/gi];

// Numbers in words. "one" alone is too common in English to flag ("one of
// the", "no one"); in a number it is caught by its neighbour ("one in four",
// "twenty-one") or by the ratio rule.
const UNITS_W = "two|three|four|five|six|seven|eight|nine";
const TEENS_W = "ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen";
const TENS_W = "twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety";
const NUMWORD = new RegExp(
  `\\b(?:zero|${UNITS_W}|${TEENS_W}|(?:${TENS_W})(?:[-\\s](?:one|${UNITS_W}))?|hundred|thousand|million|dozen)\\b` +
  `(?:[-\\s]+(?:percent|per\\s+cent|cents?))?`, "gi");
const ONE_IN = /\bone\s+(?:in|of|out\s+of)\s+(?:every\s+)?\w+/gi;

// Any digit that is not ASCII 0-9 (fullwidth, Arabic-Indic, superscripts,
// vulgar fractions): it cannot be compared to the sheet, so it is flagged.
const ODD_DIGITS = /[\p{Nd}\p{No}]+/gu;

// A ratio or fraction: "7/2", "2:1", "1 in 2", "3 out of 5". Nothing on the
// sheet is a ratio.
const RATIO = /(?<![\w.])\d+(?:\.\d+)?\s*[/:]\s*\d+(?:\.\d+)?(?![\w.])|(?<![\w.])\d+\s+(?:in|out\s+of)\s+(?:every\s+)?\d+(?![\w.])/gi;

// A scoreline, "2-1" / "2–1": a claim about a score, which must be one of
// the sheet's exact-score facts.
const SCORE = /(?<![\w.\-–—])(\d{1,2})\s*[-–—]\s*(\d{1,2})(?![\w%¢]|\.\d)/g;

// A number: optional sign (only where it cannot be a dash between two
// numbers), digits or a leading decimal, then a unit, or letters glued on.
const NUMBER = /(?<![\w.])([-−+])?(\d+(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?|\.\d+)(?:\s*(%|¢)|\s?(cents?|percent|per\s+cent)\b|([A-Za-z]+))?(?![\d])/g;

const COUNT_CONTEXT = /\b(?:wins?|won|winning|draws?|drew|drawn|loss(?:es)?|lost|defeats?|beaten|unbeaten|games?|matches|meetings|met|last|form|head[-\s]to[-\s]head|h2h|played|record)\b/i;
const CTX_DRAW = /\bdraw(?:s|n)?\b|\bdrew\b|\btie[ds]?\b|\bstalemate\b/i;
const CTX_WIN = /\bwins?\b|\bwon\b|\bwinning\b|\bvictory\b|\bbeats?\b|\bbeaten\b/i;
const CTX_MARKET = /\b(?:market|kalshi|price[sd]?|asks?|book)\b/i;
const CTX_MODEL = /\b(?:model|trivela|simulations?|sims?)\b/i;

/** Lines like "Over 2.5" are vocabulary only when the sheet holds that line. */
function lineMasks(sheet: FactSheet): RegExp[] {
  const out: RegExp[] = [];
  const lines = new Set<string>();
  const samples = new Set<string>();
  for (const f of sheet.facts) {
    for (const m of f.label.matchAll(/\b(?:over|under)\s+(\d+\.5)\b/gi)) lines.add(m[1]);
    for (const m of f.label.matchAll(/\blast\s+(\d+)\b/gi)) samples.add(m[1]);
  }
  for (const l of lines) out.push(new RegExp(`\\b(?:over|under)\\s+${l.replace(".", "\\.")}(?![\\d])`, "gi"));
  for (const n of samples) out.push(new RegExp(`\\blast\\s+${n}(?!\\d|\\.\\d)`, "gi"));
  return out;
}

/** Team names (and their distinctive words) as they appear on the sheet:
 *  digits inside a name ("Schalke 04") are part of the name. */
function teamTerms(sheet: FactSheet): { home: string[]; away: string[] } {
  const GENERIC = new Set(["club", "city", "united", "real", "athletic", "atletico", "sporting", "deportivo", "the"]);
  const terms = (name: string, abbrev: string) => {
    const t = new Set<string>();
    if (name && name !== "Home" && name !== "Away") t.add(name);
    for (const w of name.split(/\s+/)) if (w.length >= 4 && !GENERIC.has(w.toLowerCase())) t.add(w);
    if (abbrev && abbrev.length >= 2) t.add(abbrev);
    return [...t];
  };
  const m = sheet.match;
  return { home: terms(m?.home ?? "", m?.homeAbbrev ?? ""), away: terms(m?.away ?? "", m?.awayAbbrev ?? "") };
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (text: string, words: string[]) =>
  words.some((w) => new RegExp(`(?<![\\p{L}\\d])${esc(w)}(?![\\p{L}\\d])`, "iu").test(text));

/** The clause around a hit: from the previous clause break to the next. */
function clauseAt(text: string, start: number, end: number): string {
  const brk = /[;!?\n,]|\.(?=\s|$)/g;
  let a = 0, b = text.length;
  for (const m of text.matchAll(brk)) {
    const i = m.index!;
    if (i < start) a = i + 1;
    else if (i >= end) { b = i; break; }
  }
  return text.slice(a, b);
}

type Teams = ReturnType<typeof teamTerms>;

/** True when the clause names something the fact is not: another team, or
 *  a draw where the fact is a win (or the reverse), or the market where the
 *  fact is the model's. Value alone is not a match. */
function conflicts(f: Fact, ctx: string, teams: Teams): boolean {
  const lab = f.label;
  const labTeams = [has(lab, teams.home) ? "home" : "", has(lab, teams.away) ? "away" : ""].filter(Boolean);
  const ctxTeams = [has(ctx, teams.home) ? "home" : "", has(ctx, teams.away) ? "away" : ""].filter(Boolean);
  if (labTeams.length && ctxTeams.length && !labTeams.some((t) => ctxTeams.includes(t))) return true;
  const labDraw = /\bdraws?\b/i.test(lab);
  const labWin = /\bwins?\b/i.test(lab) && !labDraw;
  const cDraw = CTX_DRAW.test(ctx), cWin = CTX_WIN.test(ctx);
  if (labDraw && cWin && !cDraw) return true;
  if (labWin && cDraw && !cWin) return true;
  if (f.kind === "prob" && !/market/i.test(lab) && CTX_MARKET.test(ctx) && !CTX_MODEL.test(ctx)) return true;
  return false;
}

function valueMatches(raw: number, unit: string, f: Fact, goalsClaim: boolean): boolean {
  const u = unit.trim().toLowerCase();
  const pctUnit = u === "%" || u.startsWith("percent") || u.startsWith("per");
  if (goalsClaim && f.kind !== "goals") return false;
  if (f.kind === "prob") {
    const pct = f.value * 100;
    if (pctUnit) return raw >= 0 && Math.abs(raw - pct) <= 0.6;
    if (!u) return raw >= 0 && raw <= 1 && Math.abs(raw - f.value) <= 0.006;
    return false;
  }
  if (f.kind === "price") {
    return (u === "¢" || u.startsWith("cent")) && Math.abs(raw - f.value * 100) <= 0.6;
  }
  if (u) return false;
  const shown = displayValue(f);
  const decimals = (shown.split(".")[1] ?? "").length;
  const tol = decimals ? 0.5 * 10 ** -decimals + 1e-9 : 0;
  return Math.abs(raw - f.value) <= Math.max(tol, 0.0051 * (f.kind === "count" ? 0 : 1));
}

function pickFact(raw: number, unit: string, ctx: string, sheet: FactSheet, teams: Teams, goalsClaim: boolean):
    { fact: Fact | null; nearMiss: Fact | null } {
  const byValue = sheet.facts.filter((f) => valueMatches(raw, unit, f, goalsClaim))
    // a bare small integer is a count only where the clause talks of results
    .filter((f) => f.kind !== "count" || COUNT_CONTEXT.test(ctx));
  const fact = byValue.find((f) => !conflicts(f, ctx, teams)) ?? null;
  return { fact, nearMiss: fact ? null : byValue[0] ?? null };
}

export function checkText(text: string, sheet: FactSheet, opts: CheckOptions = {}):
    { segments: Segment[]; violations: Violation[] } {
  const byId = new Map(sheet.facts.map((f) => [f.id, f]));
  const teams = teamTerms(sheet);
  const segments: Segment[] = [];
  const violations: Violation[] = [];

  // Mask vocabulary and team names so their digits and words are not checked.
  const blank = (s: string) => s.replace(/[\p{L}\p{N}]/gu, "#");
  let masked = text;
  for (const re of [...VOCAB, ...lineMasks(sheet)]) masked = masked.replace(re, blank);
  for (const name of [...teams.home, ...teams.away].filter((n) => /\d/.test(n))) {
    masked = masked.replace(new RegExp(esc(name), "gi"), blank);
  }

  type Hit = { start: number; end: number; seg: Segment; violation?: Violation };
  const hits: Hit[] = [];
  const taken = (s: number, e: number) => hits.some((h) => s < h.end && h.start < e);
  const flag = (start: number, end: number, reason: string) => {
    const shown = text.slice(start, end).trim();
    const v = { text: shown, reason };
    hits.push({ start, end, seg: { type: "flag", text: "[unverified]", reason: `${shown}: ${reason}` }, violation: v });
  };
  const factHit = (start: number, end: number, f: Fact) =>
    hits.push({ start, end, seg: { type: "fact", text: text.slice(start, end), factId: f.id, label: f.label, source: f.source } });

  // 1. placeholders
  for (const m of text.matchAll(PLACEHOLDER)) {
    const f = byId.get(m[1]);
    const start = m.index!, end = start + m[0].length;
    if (f) hits.push({ start, end, seg: { type: "fact", text: displayValue(f), factId: f.id, label: f.label, source: f.source } });
    else {
      const v = { text: m[0], reason: `${m[1]} is not a fact id on this sheet` };
      hits.push({ start, end, seg: { type: "flag", text: "[unverified]", reason: v.reason }, violation: v });
    }
  }
  masked = masked.replace(PLACEHOLDER, blank);

  // 2. digits that are not ASCII
  for (const m of masked.matchAll(ODD_DIGITS)) {
    if (/^[0-9]+$/.test(m[0])) continue;
    const start = m.index!, end = start + m[0].length;
    if (!taken(start, end)) flag(start, end, "a number in non-ASCII digits cannot be checked against the sheet");
  }
  // 3. numbers in words
  for (const re of [ONE_IN, NUMWORD]) {
    for (const m of masked.matchAll(re)) {
      const start = m.index!, end = start + m[0].length;
      if (!taken(start, end)) flag(start, end, "a number written in words cannot be traced to the sheet; use its {{F#}} placeholder");
    }
  }
  // 4. ratios and fractions
  for (const m of masked.matchAll(RATIO)) {
    const start = m.index!, end = start + m[0].length;
    if (!taken(start, end)) flag(start, end, "a ratio or fraction is not on the sheet");
  }
  // 5. scorelines
  for (const m of masked.matchAll(SCORE)) {
    const start = m.index!, end = start + m[0].length;
    if (taken(start, end)) continue;
    const want = `${Number(m[1])}-${Number(m[2])}`;
    const f = sheet.facts.find((x) => x.kind === "score" ? displayValue(x) === want
      : new RegExp(`\\bscore\\s+${want}\\b`).test(x.label));
    if (f) factHit(start, end, f);
    else flag(start, end, "a scoreline that is not one of the sheet's exact-score facts");
  }
  // 6. every other number
  for (const m of masked.matchAll(NUMBER)) {
    const start = m.index!, end = start + m[0].length;
    if (taken(start, end)) continue;
    const [, sign, digits, sym, word, glued] = m;
    if (glued) {
      const g = glued.toLowerCase();
      if (/^(?:st|nd|rd|th)$/.test(g)) { flag(start, end, "an ordinal (a rank or place) is not on the sheet"); continue; }
      if (g !== "xg") { flag(start, end, `"${glued}" is not a unit the sheet uses`); continue; }
    }
    const raw = Number(digits.replace(/,/g, "")) * (sign === "-" || sign === "−" ? -1 : 1);
    const unit = sym ?? word ?? "";
    const after = masked.slice(end, end + 24);
    const goalsClaim = !unit && /^\s*(?:clear\s+)?goals?\b/i.test(after);
    const ctx = clauseAt(text, start, end);
    const { fact, nearMiss } = pickFact(raw, unit, ctx, sheet, teams, goalsClaim);
    if (fact) {
      if (opts.placeholderOnly) flag(start, end, `write it as its placeholder {{${fact.id}}}, not as digits`);
      else factHit(start, end, fact);
    } else if (nearMiss) {
      flag(start, end, `matches "${nearMiss.label}" in value, but the sentence names something else`);
    } else {
      flag(start, end, "not traceable to any fact on the sheet");
    }
  }

  hits.sort((a, b) => a.start - b.start);
  let at = 0;
  for (const h of hits) {
    if (h.start > at) segments.push({ type: "text", text: text.slice(at, h.start) });
    segments.push(h.seg);
    if (h.violation) violations.push(h.violation);
    at = h.end;
  }
  if (at < text.length) segments.push({ type: "text", text: text.slice(at) });
  return { segments, violations };
}
