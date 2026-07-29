// Matchday grouping + date formatting, shared by every league surface.
//
// Extracted verbatim from MlsDashboard (ui-matchday-grouping, 32777bf) so
// the friendlies page could IMPORT the rules instead of copying them —
// the same discipline as the backend's league-neutral parsers. Each rule
// here encodes a defect fixed the expensive way:
//
//  - ESPN's scoreboard bucket is a MATCHDAY, not a calendar day: when
//    nothing is on today it serves the next one. The heading must be
//    DERIVED from the fixtures, never asserted ("Today's slate" once sat
//    over a fixture two days away).
//  - Grouping is by LOCAL day, not the ISO date: a 23:30Z and a 00:30Z
//    kickoff are one evening in the Americas; splitting them renders an
//    artefact of the wire format.

// Local calendar-day identity. Deliberately not the ISO date (see above).
export const dayKeyOf = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export function localDay(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dayKeyOf(d);
}

export function dayLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "long", month: "short", day: "numeric",
  });
}

export function groupByDay<T extends { id: string; date: string }>(
  fixtures: T[],
) {
  const groups = new Map<string, T[]>();
  for (const f of [...fixtures].sort((a, b) => a.date.localeCompare(b.date))) {
    const list = groups.get(localDay(f.date));
    if (list) list.push(f);
    else groups.set(localDay(f.date), [f]);
  }
  return [...groups.entries()].map(([key, list]) => ({ key, list }));
}

// One date formatter for every dashboard, in the VIEWER's timezone.
// `month: "short"` on fixture cards: a bare 7/29 is ambiguous outside
// the US and the card has room for three letters.
export function fmtDate(iso?: string, month: "short" | "numeric" = "numeric") {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    weekday: "short", month, day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}
