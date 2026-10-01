// Serie A match hub — a thin config over the shared MatchHub (2026-10-01).
// No model is fitted for this competition: every model slot states that
// by name (lib/compHub.ts), and the payload is the generic per-match
// route /api/comp/seriea/match/{event_id}.
import MatchHub from "../../../components/MatchHub";
import { noModelHubCfg } from "../../../lib/compHub";

const CFG = noModelHubCfg("seriea");

export default function SerieaMatchPage() {
  return <MatchHub cfg={CFG} />;
}
