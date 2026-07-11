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
