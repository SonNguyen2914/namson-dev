// National-kit colors for data visuals (stat bars): primary = the iconic
// shirt, secondary = the recognised alternate. When both sides' primaries
// clash (Spain red vs Switzerland red), the AWAY side falls back to its
// secondary so the bar always reads as two teams.
const TEAM_COLORS: Record<string, { primary: string; secondary: string }> = {
  France:        { primary: "#2563eb", secondary: "#f5f5f7" },
  Spain:         { primary: "#dc2626", secondary: "#facc15" },
  Argentina:     { primary: "#7cc4f5", secondary: "#f5f5f7" },
  England:       { primary: "#f5f5f7", secondary: "#dc2626" },
  Norway:        { primary: "#dc2626", secondary: "#1e40af" },
  Switzerland:   { primary: "#dc2626", secondary: "#f5f5f7" },
  Belgium:       { primary: "#dc2626", secondary: "#fbbf24" },
  Morocco:       { primary: "#dc2626", secondary: "#16a34a" },
  Portugal:      { primary: "#b91c1c", secondary: "#16a34a" },
  Brazil:        { primary: "#facc15", secondary: "#16a34a" },
  Mexico:        { primary: "#16a34a", secondary: "#f5f5f7" },
  "United States": { primary: "#1e40af", secondary: "#dc2626" },
  Colombia:      { primary: "#facc15", secondary: "#1e40af" },
  Egypt:         { primary: "#dc2626", secondary: "#f5f5f7" },
  Canada:        { primary: "#dc2626", secondary: "#f5f5f7" },
  Paraguay:      { primary: "#dc2626", secondary: "#1e40af" },
  Netherlands:   { primary: "#f97316", secondary: "#f5f5f7" },
  Uruguay:       { primary: "#38bdf8", secondary: "#f5f5f7" },
};

const FALLBACK = { primary: "#34d399", secondary: "#6e6e78" };

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16),
          parseInt(h.slice(4, 6), 16)];
}

function clash(a: string, b: string): boolean {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2) < 110;
}

// --- CLUBS, AND WHY THEIR MARK COLOURS ARE DERIVED ----------------------
//
// THE TABLE ABOVE IS NATIONAL TEAMS AND ONLY NATIONAL TEAMS. Every club
// fixture falls through to FALLBACK on BOTH sides, which then clashes
// with itself and collapses the two ends of a bar into one pair — a
// two-segment bar whose two segments say nothing.
//
// NO PROVIDER ON THIS PLANE SENDS A CLUB COLOUR, AND NONE SENDS A CREST.
// The watched-strip match block carries `home` and `away` as names and
// nothing else (backend api/main.py: fixture_id / competition_slug /
// home / away / espn_event_id / state / coverage / read / positions), so
// there is no registered club colour to render, and a colour that
// CLAIMED to be the club's would be a fact this surface cannot support.
//
// So the mark colour is DERIVED from the name — a hash into a fixed
// ladder of hues at one saturation and lightness, so the two sides of a
// fixture always differ, the same club always draws the same, and a poll
// never repaints a card. IT IS WAYFINDING, NEVER DATA INK: every bar
// this colour fills prints its own number at the end it belongs to, and
// every drawn crest prints its own three-letter code, so nothing on the
// card MEANS anything by the hue and a reader who cannot see it loses
// nothing. A real crest image, if the provider ever sends one, replaces
// the drawn mark outright.
//
// HEX, NOT hsl(): `clash()` above parses hex, and a colour it cannot
// measure would silently skip the one check that keeps two sides apart.
const MARK_HUES = [
  "#d45c49", "#d49849", "#d4c249", "#81d449", "#49d493",
  "#49c2d4", "#4986d4", "#6049d4", "#b449d4", "#d449a1",
];

function hashOf(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** A stable mark colour for one club name. Deterministic, never random:
 *  the same name draws the same hue on every render and every poll. */
export function clubMark(name: string): string {
  return MARK_HUES[hashOf(name) % MARK_HUES.length];
}

/** The two mark colours for one fixture, GUARANTEED TO DIFFER — checked,
 *  not assumed. Two names can hash to one rung, and two adjacent rungs
 *  can still be too close for `clash()`; either would turn a two-segment
 *  bar into one segment. The away side walks the ladder until the pair
 *  separates and, if the whole ladder is exhausted, falls back to the
 *  neutral gray, which is at least honestly a different thing.
 *
 *  A NATIONAL SIDE KEEPS ITS KIT COLOUR: a recorded fact is preferred
 *  over a derived one wherever the table has one. */
export function clubColors(home: string, away: string):
    { home: string; away: string } {
  const known = (n: string) => TEAM_COLORS[n]?.primary ?? null;
  const h = known(home) ?? clubMark(home);
  const start = hashOf(away) % MARK_HUES.length;
  let a = known(away) ?? MARK_HUES[start];
  for (let i = 1; i <= MARK_HUES.length && clash(h, a); i += 1) {
    a = i > MARK_HUES.length - 1
      ? FALLBACK.secondary
      : MARK_HUES[(start + i) % MARK_HUES.length];
  }
  return { home: h, away: a };
}

// {home, away} bar colors for a fixture, clash-resolved.
export function matchColors(home: string, away: string):
    { home: string; away: string } {
  const h = TEAM_COLORS[home] ?? FALLBACK;
  const a = TEAM_COLORS[away] ?? FALLBACK;
  if (!clash(h.primary, a.primary)) {
    return { home: h.primary, away: a.primary };
  }
  if (!clash(h.primary, a.secondary)) {
    return { home: h.primary, away: a.secondary };
  }
  return { home: h.secondary, away: a.primary };
}
