// The three saved demo matches (pre-match facts only), as the client lists
// them. The payloads themselves are public/analyst-demo/<slug>.json and are
// read only on the server (analyst.ts); this file carries no numbers, so
// the /bet-suggester/var page does not ship 75 KB of JSON to draw a
// picker. e2e/analyst-verify.spec.ts checks it against the payloads.

export const ANALYST_LEAGUES = ["epl", "laliga", "mls", "ligamx"] as const;
export type AnalystLeague = (typeof ANALYST_LEAGUES)[number];
export const isAnalystLeague = (v: unknown): v is AnalystLeague =>
  typeof v === "string" && (ANALYST_LEAGUES as readonly string[]).includes(v);

export const ANALYST_LEAGUE_NAMES: Record<AnalystLeague, string> = {
  epl: "Premier League", laliga: "La Liga", mls: "MLS", ligamx: "Liga MX",
};

export type DemoMatch = {
  slug: string; league: AnalystLeague; eventId: string;
  home: string; away: string; date: string;
};

export const DEMO_MATCHES: readonly DemoMatch[] = [
  { slug: "arsenal-everton", league: "epl", eventId: "401878768",
    home: "Arsenal", away: "Everton", date: "2026-10-24T14:00Z" },
  { slug: "montreal-nashville", league: "mls", eventId: "761903",
    home: "CF Montréal", away: "Nashville SC", date: "2026-10-24T17:30Z" },
  { slug: "rayo-elche", league: "laliga", eventId: "401882830",
    home: "Rayo Vallecano", away: "Elche", date: "2026-10-24T12:00Z" },
];
