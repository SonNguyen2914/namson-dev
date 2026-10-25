// The "Analyst" chip in the bet-suggester top bar. Drawn only while the
// Analyst is switched on (ANALYST_ENABLED, read via /api/analyst/status).
import { NavChip } from "../chrome";
import { useAnalystStatus } from "./useAnalystStatus";

export default function AnalystNavChip({ active = false }: { active?: boolean }) {
  return useAnalystStatus() === "on"
    ? <NavChip href="/bet-suggester/analyst" active={active}>Analyst</NavChip>
    : null;
}
