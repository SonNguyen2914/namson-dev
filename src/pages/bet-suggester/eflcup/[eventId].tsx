// Cup match hub (2026-10-13, "all matches should have a match hub") — a
// thin config over the shared MatchHub, the same template as every league
// hub. The payload is the generic per-match route
// /api/comp/eflcup/match/{event_id}; see lib/compHub.ts cupHubCfg.
import MatchHub from "../../../components/MatchHub";
import { cupHubCfg } from "../../../lib/compHub";

const CFG = cupHubCfg("eflcup");

export default function EflcupMatchPage() {
  return <MatchHub cfg={CFG} />;
}
