// "ASK VAR" on a board card (C7, 2026-10-25): a link to this match on
// /bet-suggester/var?league=&id=, in the card's footer beside the WATCH box
// and the model box, in the WATCH box's own shape (WATCH_BOX).
//
// Drawn only for the four leagues VAR reads (epl, laliga, mls, ligamx),
// only while VAR is switched on, and never on a finished match. The switch
// is the same once-per-page /api/analyst/status read the top bar's VAR chip
// already makes (useAnalystStatus shares one promise), so a board with this
// chip on every card sends no request it did not send before.
// A link to an analysis page, never an order (AGENTS.md §2).
import Link from "next/link";
import { WATCH_BOX } from "../WatchDeclaration";
import { isAnalystLeague } from "../../lib/analyst/demos";
import { useAnalystStatus } from "./useAnalystStatus";

function Chip({ league, eventId, label }: { league: string; eventId: string; label: string }) {
  if (useAnalystStatus() !== "on") return null;
  return (
    <Link data-testid="ask-var-chip" data-league={league} data-event={eventId}
      href={`/bet-suggester/var?league=${encodeURIComponent(league)}&id=${encodeURIComponent(eventId)}`}
      aria-label={`ask Trivela VAR about ${label}`}
      title="Ask Trivela VAR about this match: a verified read of Trivela's numbers. Analysis, not advice."
      className={`${WATCH_BOX} ml-2 inline-flex flex-none items-center whitespace-nowrap border-line text-ink-low hover:border-line-strong hover:text-ink-hi`}>
      ask VAR
    </Link>
  );
}

export default function AskVarChip({ league, eventId, label, ended = false }: {
  league: string; eventId: string; label: string; ended?: boolean;
}) {
  // outside VAR's leagues the hook is never mounted, so no status read
  if (ended || !isAnalystLeague(league) || !/^\d{1,12}$/.test(eventId)) return null;
  return <Chip league={league} eventId={eventId} label={label} />;
}
