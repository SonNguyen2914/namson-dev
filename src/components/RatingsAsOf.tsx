// The "as of <last finished match>" line every displayed rating carries
// (lib/ratingsAsOf.ts says what the date means). Draws nothing when the
// payload sent no block — never a guessed date.
import { asOfLabel, asOfSentence, type RatingsAsOf } from "../lib/ratingsAsOf";

export function RatingsAsOfLine({ asOf, testid = "ratings-as-of",
                                  className = "" }: {
  asOf: RatingsAsOf | null | undefined;
  testid?: string;
  className?: string;
}) {
  const label = asOfLabel(asOf);
  if (!label) return null;
  const live = asOf?.source === "live";
  return (
    <span data-testid={testid} data-source={asOf?.source ?? undefined}
      title={asOfSentence(asOf) ?? undefined}
      className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
        live ? "text-ink-mid" : "text-ink-faint"} ${className}`}>
      {label}{live ? " · live" : asOf?.source === "mixed" ? " · partly live" : " · frozen"}
    </span>
  );
}
