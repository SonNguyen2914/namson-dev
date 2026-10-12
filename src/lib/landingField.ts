// THE HOME PAGE'S FIELD — eleven competitions on two planes, and the
// geometry that draws them. Pure: no DOM, no React, so the server and the
// client draw the same field and a test can ask it a question.
//
// THE TWO PLANES. The eight leagues' 154 clubs share ONE rating scale
// (the club plane, 1,300–2,100). The three national competitions' 139
// teams have a scale of their own (the national plane, 900–2,100). The
// two never share an axis: a club's rating and a national team's rating
// are not comparable, and the page says so under each plane's heading.
//
// THE HERO IS THE STORY'S FIRST STATE. The club dots here ARE the scroll
// story's dots: the hero maps the story's own beeswarm into the left
// column with one uniform scale `b` (dots stay round, x stays linear in
// rating), and lifting a competition moves dots by transform and opacity
// only. Everything below that is derived from the numbers beside it.
import { FIELD, FOCUS, NATIONS } from "./landingData";

export const E0 = 1300;
export const E1 = 2100;
/** every shown tick label keeps at least this far from the screen's edge */
export const TICK_EDGE = 16;
export const TICKS: number[] = Array.from(
  { length: (E1 - E0) / 10 + 1 }, (_, i) => E0 + i * 10);
/** the hero's own horizontal padding inside the planes' column */
export const HPAD = 18;

export const fmtElo = (v: number) => Math.round(v).toLocaleString("en-US");

/** the board's address, for the panel's door */
export const SHOWN_NAME: Record<string, string> = {
  "Atletico Madrid": "Atlético Madrid" };

/** where each competition is played, for the panel's kicker */
export const REGION: Record<string, string> = {
  epl: "England", laliga: "Spain", mls: "USA · Canada", ligamx: "Mexico",
  bundesliga: "Germany", seriea: "Italy", ligue1: "France",
  eredivisie: "Netherlands", unl: "Europe", cnl: "Concacaf", afcon: "Africa" };
/** the switch's keys */
export const SHORT: Record<string, string> = {
  epl: "EPL", laliga: "La Liga", mls: "MLS", ligamx: "Liga MX",
  bundesliga: "Bundesliga", seriea: "Serie A", ligue1: "Ligue 1",
  eredivisie: "Eredivisie", unl: "UNL", cnl: "CNL", afcon: "AFCON Q" };

/** The live plane's registry (backend src/live/competitions.py @1317f4f5,
 *  = prod code_revision, read 7 Oct; /api/ready planes.registry.modelled):
 *  an in-play model is registered for these three. The other eight are
 *  state-only with inplay_anchor "market_t10": their hubs' minute-by-minute
 *  line (GET /api/minutes/{key}/{id}, model_label "NO MODEL") is the
 *  in-play engine started from the de-vigged market price at T-10, not a
 *  model. */
export const INPLAY_MODEL: Record<string, boolean> = {
  epl: true, laliga: true, mls: true };

export type Half = "L" | "N";
export type Plane = { lo: number; hi: number; who: string; plane: string; passes: number };
export const PLANE: Record<Half, Plane> = {
  L: { lo: E0, hi: E1, who: "clubs", plane: "club plane", passes: FIELD.passes },
  N: { lo: 900, hi: 2100, who: "national teams", plane: "national plane", passes: NATIONS.passes },
};

export type Team = { key?: string; n: string; v: number };
export type Comp = {
  i: number; k: string; name: string; half: Half; items: Team[];
  n: number; pl: Plane; lo: number; hi: number; idx: string; med: number;
  /** the top three by rating, leagues only */
  top: Team[] | null; grp: "Leagues" | "Championships";
};

export const COMPS: Comp[] = (() => {
  const raw = [
    ...FIELD.columns.map((c) => ({ k: c.key, name: c.display, half: "L" as Half,
      items: FIELD.clubs.filter((x) => x.column === c.key)
        .map((x) => ({ key: x.club, n: SHOWN_NAME[x.club] ?? x.club, v: x.elo })) })),
    ...NATIONS.competitions.map((c) => ({ k: c.key, name: c.display, half: "N" as Half,
      items: c.teams.map((t) => ({ n: t.team, v: t.elo })) })),
  ];
  return raw.map((c, i) => {
    const items = [...c.items].sort((a, b) => a.v - b.v);
    const n = items.length;
    return {
      ...c, items, i, n, pl: PLANE[c.half], lo: items[0].v, hi: items[n - 1].v,
      idx: String(i + 1).padStart(2, "0"),
      med: n % 2 ? items[(n - 1) / 2].v : (items[n / 2 - 1].v + items[n / 2].v) / 2,
      top: c.half === "L" ? items.slice(-3).reverse() : null,
      grp: c.half === "L" ? "Leagues" : "Championships",
    } satisfies Comp;
  });
})();
export const NC = COMPS.length;
export const N_TEAMS = COMPS.reduce((a, c) => a + (c.half === "N" ? c.n : 0), 0);
/** club → [its competition, its rank inside it] */
export const RANK: Record<string, [number, number]> = (() => {
  const out: Record<string, [number, number]> = {};
  COMPS.forEach((c) => {
    if (c.half === "L") c.items.forEach((t, ri) => { out[t.key!] = [c.i, ri]; });
  });
  return out;
})();

export const CLUB_ARIA = `Club plane: ${FIELD.clubs.length} clubs from eight leagues on one rating scale, from ${
  fmtElo(Math.min(...FIELD.clubs.map((c) => c.elo)))} to ${
  fmtElo(Math.max(...FIELD.clubs.map((c) => c.elo)))}.`;
export const NAT_ARIA = `National plane: ${N_TEAMS} national teams from three competitions on their own rating axis, ${
  fmtElo(PLANE.N.lo)} to ${fmtElo(PLANE.N.hi)}, never on the club axis.`;
/** what the plane's name adds once a competition is lit */
export const litAria = (c: Comp) =>
  ` Lit: ${c.name}, ${c.n} ${c.pl.who}, ${fmtElo(c.lo)} to ${fmtElo(c.hi)}.`;

// ── the swarm ────────────────────────────────────────────────────────

/** A beeswarm along the rating axis: every dot at its own x, nudged up or
 *  down only as far as it takes not to cover a neighbour. Pure and
 *  deterministic. `xs` is ascending. */
export function swarm(xs: number[], gap: number): number[] {
  const placed: { x: number; y: number }[] = [];
  return xs.map((x) => {
    const blocks: [number, number][] = [];
    for (const p of placed) {
      const dx = Math.abs(p.x - x);
      if (dx < gap) {
        const dy = Math.sqrt(gap * gap - dx * dx);
        blocks.push([p.y - dy, p.y + dy]);
      }
    }
    const cands = [0, ...blocks.flat()].sort((a, b) => Math.abs(a) - Math.abs(b));
    const y = cands.find((v) => blocks.every(([lo, hi]) => v <= lo + 1e-6 || v >= hi - 1e-6));
    const pt = { x, y: y ?? 0 };
    placed.push(pt);
    return pt.y;
  });
}

export type Dot = {
  x: number; y: number; column: string; club: string; elo: number; focus: boolean };
export type Layout = {
  r: number; X: (e: number) => number; dots: Dot[]; home: Dot; away: Dot;
  fx: number; fy: number; S: number; cy: number; narrow: boolean; perElo: number };

/** The story's own layout of the club plane at a given size. */
export function layoutField(w: number, h: number): Layout {
  const narrow = w < 640;
  const r = narrow ? 2.9 : w < 1024 ? 3.6 : 4.4;
  const padX = Math.max(18, w * 0.05);
  const X = (e: number) => padX + ((e - E0) / (E1 - E0)) * (w - 2 * padX);
  const gap = 2 * r + (narrow ? 1.4 : 2.4);
  const cy = h / 2;
  const clubs = [...FIELD.clubs].sort((a, b) => a.elo - b.elo);
  const ys = swarm(clubs.map((c) => X(c.elo)), gap);
  const dots: Dot[] = clubs.map((c, i) => ({
    x: X(c.elo), y: cy + ys[i], column: c.column, club: c.club, elo: c.elo,
    focus: c.club === FOCUS.home.key || c.club === FOCUS.away.key }));
  const home = dots.find((d) => d.club === FOCUS.home.key)!;
  const away = dots.find((d) => d.club === FOCUS.away.key)!;
  return { r, X, dots, home, away, fx: (home.x + away.x) / 2, fy: (home.y + away.y) / 2,
    S: ((narrow ? 0.5 : 0.42) * w) / (away.x - home.x), cy, narrow,
    perElo: (w - 2 * padX) / (E1 - E0) };
}

/** The hero's own rest swarm: the same x (one scale), the largest dot
 *  radius from r down to rMin whose natural swarm fits ±cap. The story
 *  keeps its own layout; the dots ease back to it when the story begins. */
function restSwarm(xs: number[], r: number, rMin: number, gap: number, cap: number) {
  let ys: number[], m: number;
  for (;; r -= 0.25) {
    ys = swarm(xs, 2 * r + gap);
    m = Math.max(1, ...ys.map(Math.abs));
    if (m + r <= cap || r - 0.25 < rMin) break;
  }
  const k = Math.min(1, (cap - r) / m);
  return { r, ys: ys.map((y) => y * k) };
}

// ── a lit strip's labels ─────────────────────────────────────────────

/** One mark on a lit competition: its range line, a label, or a leader
 *  from a label down to the dot it names. `style` carries the position
 *  (transform) and size; the component draws it. */
export type StripMark =
  | { kind: "rng"; c: number; hue: string; width: number; x: number; y: number }
  | { kind: "lab"; c: number; x: number; y: number; align: "r" | "l" | "c";
      rank?: number; name?: string; value: string; word?: string }
  | { kind: "lead"; c: number; x: number; y: number; height: number };

function marksOf(c: Comp, xOf: (v: number) => number, yLit: (ri: number) => number,
  RH: number, r1: number, yBr: number): StripMark[] {
  const n = c.n;
  const out: StripMark[] = [{ kind: "rng", c: c.i, hue: c.k, width: xOf(c.hi) - xOf(c.lo),
    x: xOf(c.lo), y: yBr }];
  const mid = n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2];
  type Row = { ris: number[]; row: number; al: "r" | "l" | "c"; v: number;
    rank?: number; name?: string; word?: string };
  const rows: Row[] = c.top
    ? c.top.map((t, j) => ({ ris: [n - 1 - j], row: j, al: "r" as const, v: t.v,
        rank: j + 1, name: t.n }))
    : [{ ris: mid, row: 0, al: "c", v: c.med, word: "median" },
       { ris: [n - 1], row: 1, al: "r", v: c.hi, word: "high" },
       { ris: [0], row: 1, al: "l", v: c.lo, word: "low" }];
  for (const r of rows) {
    const x = xOf(r.v), y0 = r.row * RH;
    const top = r.al === "c" ? y0 + 14 : y0 + 1;
    const bot = Math.min(...r.ris.map(yLit)) - r1 - 2;
    // the label's anchor: its right edge, its left edge or its middle
    const lx = r.al === "r" ? x - 4 : r.al === "l" ? x + 4 : x;
    out.push({ kind: "lab", c: c.i, x: lx, y: y0, align: r.al, rank: r.rank,
      name: r.name, word: r.word, value: fmtElo(r.v) });
    out.push({ kind: "lead", c: c.i, x, y: top, height: Math.max(0, bot - top) });
  }
  return out;
}

// ── the hero's geometry ──────────────────────────────────────────────

export type HeroDot = { ly: number; sy: number; hy: number };
export type NatDot = { c: number; ri: number; v: number; n: string; r: number;
  x: number; y: number; ly: number; sy: number };
export type NatGeo = {
  height: number; axisY: number; nm: number; dots: NatDot[]; marks: StripMark[];
  axis: { left: number; right: number; top: number };
  ticks: { x: number; label: string | null }[];
};
export type HeroGeo = {
  /** the uniform scale mapping the story's plane into the hero's slot */
  b: number; mh: number; hm: number;
  slotH: number; axisY: number; restY: number; ph: boolean;
  marks: StripMark[];
  /** per club dot (same order as Layout.dots): the three places its dot
   *  rests, in the story plane's own coordinates */
  dots: HeroDot[];
  nat: NatGeo;
};

function natBuild(w: number, o: { ph: boolean; RH: number; laneMax: number;
  r0: number; r1: number; rRest: number }): NatGeo {
  const pl = PLANE.N;
  const X = (v: number) => HPAD + ((v - pl.lo) / (pl.hi - pl.lo)) * (w - 2 * HPAD);
  const NS = COMPS.filter((c) => c.half === "N");
  const all: { c: number; ri: number; v: number }[] = [];
  NS.forEach((c) => c.items.forEach((t, ri) => all.push({ c: c.i, ri, v: t.v })));
  all.sort((a, b) => a.v - b.v);
  /* the national plane is the second read: dots at 0.8 of the club size
     (at rest, 0.8 of the club rest size) and a flatter swarm for the
     lift; lit, they grow to the club plane's lit size (r1) */
  const r = o.r0 * 0.8;
  const xs = all.map((d) => X(d.v));
  const ys = swarm(xs, 2 * r + (o.ph ? 0.8 : 1.2));
  const m0 = Math.max(1, ...ys.map(Math.abs));
  const k = Math.min(1, (o.ph ? 16 : 20) / m0);
  const half = m0 * k;
  const laneY = 2 * o.RH + 8 + o.laneMax + o.r1, yBr = laneY + o.laneMax + o.r1 + 5;
  const homeY = yBr + 9 + half + r, axisY = Math.round(homeY + half + r + 12);
  const lanes: Record<number, number[]> = {};
  const marks: StripMark[] = [];
  NS.forEach((c) => {
    const cx = c.items.map((t) => X(t.v));
    const cy = swarm(cx, 2 * o.r1 + 1);
    const kk = Math.min(1, o.laneMax / Math.max(1, ...cy.map(Math.abs)));
    lanes[c.i] = cy.map((y) => y * kk);
    marks.push(...marksOf(c, X, (ri) => laneY + lanes[c.i][ri], o.RH, o.r1, yBr));
  });
  const ticks: NatGeo["ticks"] = [];
  for (let v = pl.lo, j = 0; v <= pl.hi; v += 100, j++) {
    ticks.push({ x: X(v), label: j % (o.ph ? 6 : 3) === 0 ? fmtElo(v) : null });
  }
  const b0 = 6, b1 = axisY - 14;
  const RS = restSwarm(xs, Math.max(r, 0.8 * o.rRest), r, o.ph ? 0.8 : 1.2, (b1 - b0) / 2);
  const cR = (b0 + b1) / 2;
  const dots: NatDot[] = all.map((d, i) => ({
    ...d, n: COMPS[d.c].items[d.ri].n, r, x: xs[i] - r, y: cR + RS.ys[i] - r,
    ly: laneY + lanes[d.c][d.ri] - r, sy: homeY + ys[i] * k * 0.8 + 8 - r }));
  return { height: axisY + 22, axisY, nm: RS.r / r, dots, marks,
    axis: { left: HPAD - 10, right: HPAD - 10, top: axisY }, ticks };
}

/** The hero's geometry for a slot `slotW` wide, given the story's layout. */
export function heroBuild(L: Layout, slotW: number): HeroGeo {
  /* laneMax: how far a lit strip may spread up and down; at 10/12px the
     dense picks (MLS, UNL, AFCON Q) spread out instead of stacking */
  const ph = slotW < 560, RH = 15, laneMax = ph ? 10 : 12;
  const b = (slotW - 2 * HPAD) / (L.X(E1) - L.X(E0));
  const mh = Math.min(1.25, Math.max(1, (ph ? 2.5 : slotW < 760 ? 2.9 : 3.2) / (L.r * b)));
  const r0 = L.r * b * mh, r1 = r0 * 1.4;
  const half = Math.max(...L.dots.map((d) => Math.abs(d.y - L.cy))) * b;
  const xS = (v: number) => HPAD + ((v - E0) / (E1 - E0)) * (slotW - 2 * HPAD);
  const laneY = 3 * RH + 8 + laneMax + r1, yBr = laneY + laneMax + r1 + 5;
  const homeY = yBr + 9 + half + r0, axisY = Math.round(homeY + half + r0 + 12);
  const restY = Math.round((laneY + homeY) / 2);   // at rest the swarm sits mid-slot
  const lane: Record<string, number> = {};
  const marks: StripMark[] = [];
  COMPS.forEach((c) => {
    if (c.half !== "L") return;
    const xs = c.items.map((t) => xS(t.v));
    const ys = swarm(xs, 2 * r1 + 1);
    const k = Math.min(1, laneMax / Math.max(1, ...ys.map(Math.abs)));
    c.items.forEach((t, ri) => { lane[t.key!] = ys[ri] * k; });
    marks.push(...marksOf(c, xS, (ri) => laneY + ys[ri] * k, RH, r1, yBr));
  });
  const b0 = 6, b1 = axisY - 14, cR = (b0 + b1) / 2;
  const RS = restSwarm(L.dots.map((d) => xS(d.elo)), ph ? 3.5 : 4.5, r0, ph ? 1.2 : 1.5, (b1 - b0) / 2);
  const nat = natBuild(slotW, { ph, RH, laneMax, r0, r1, rRest: RS.r });
  // story-plane coordinates: the plane is scaled by b about its own
  // origin, so a hero-slot offset is (offset − restY) / b from the centre
  const dots = L.dots.map((d, i) => ({
    ly: L.cy + (laneY + lane[d.club] - restY) / b,
    sy: L.cy + (d.y - L.cy) * 0.8 + (homeY - restY + 8) / b,
    hy: L.cy + (cR + RS.ys[i] - restY) / b }));
  return { b, mh, hm: RS.r / (L.r * b), slotH: axisY + 22, axisY, restY, ph, marks, dots, nat };
}
