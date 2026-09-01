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

// EVERY time on this site renders in ONE fixed zone, whoever is looking
// and wherever the machine rendering it happens to be.
//
// It used to render in the VIEWER's timezone, which is not the same thing
// even when the viewer is local: server-side rendering runs in the
// container's timezone (UTC on Railway), so the first paint and the
// rehydrated paint could disagree about which day a fixture belongs to.
// One fixed zone makes the board deterministic — the same page for
// everyone, and the same page twice.
//
// WHICH fixed zone is a separate decision from THAT it is fixed, and it
// is the OPERATOR'S, not an inference. On 2026-08-06 this was changed to
// Asia/Ho_Chi_Minh because an agent inferred the operator's location from
// the competitions being worked on. They are in California. Every kickoff
// on the site rendered ~15 hours off for a day, and a whole matchday of
// fixtures appeared under the wrong day heading.
//
// The rule that follows: this constant is set from what the operator has
// SAID, and from nothing else. If it is ever unclear, ask.
export const TZ = "America/Los_Angeles";

// Calendar-day identity IN LA. Deliberately not the ISO date (see above):
// a 23:30Z and a 00:30Z kickoff are one evening here, and splitting them
// renders an artefact of the wire format. en-CA gives YYYY-MM-DD, which
// sorts lexicographically — the old key was `${y}-${m}-${d}` with an
// unpadded month, where "2026-9-1" sorts before "2026-10-1".
const _dayKey = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
});
export const dayKeyOf = (d: Date) => _dayKey.format(d);

export function localDay(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : dayKeyOf(d);
}

export function dayLabel(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    timeZone: TZ, weekday: "long", month: "short", day: "numeric",
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

// One date formatter for every dashboard, in LA time.
// `month: "short"` on fixture cards: a bare 7/29 is ambiguous outside
// the US and the card has room for three letters.
export function fmtDate(iso?: string, month: "short" | "numeric" = "numeric") {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    timeZone: TZ, weekday: "short", month, day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}


/** Clock time in LA, for a fixture row. */
export function fmtTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-US", {
    timeZone: TZ, hour: "numeric", minute: "2-digit",
  });
}


