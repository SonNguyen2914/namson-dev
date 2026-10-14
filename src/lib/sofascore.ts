// SOFASCORE'S ATTACK-MOMENTUM EMBED, OPTIONAL AND OFF BY DEFAULT (2026-10-13).
//
// Sofascore publishes a free official widget,
//   https://widgets.sofascore.com/embed/attackMomentum?id=<id>&widgetTheme=dark
// keyed by SOFASCORE's own match id. This site never looks that id up: it
// never calls Sofascore's API, and it never guesses an id from team names.
// A hub draws the panel ONLY for a fixture listed below, by hand, and draws
// nothing at all otherwise — not an empty frame and not a placeholder.
//
// Keyed `<hub key>:<ESPN event id>` (the hub's own route), valued by the
// Sofascore match id. EMPTY on purpose: Son's Sofascore partnership enquiry
// (Oct 13) is pending, and an entry is added only for a fixture someone
// has matched by hand.
export const SOFASCORE_MATCH_IDS: Readonly<Record<string, number>> = {};

export const sofascoreIdFor = (hubKey: string, eventId: string): number | null => {
  const id = SOFASCORE_MATCH_IDS[`${hubKey}:${eventId}`];
  return typeof id === "number" && Number.isInteger(id) && id > 0 ? id : null;
};

export const sofascoreMomentumUrl = (id: number) =>
  `https://widgets.sofascore.com/embed/attackMomentum?id=${id}&widgetTheme=dark`;
