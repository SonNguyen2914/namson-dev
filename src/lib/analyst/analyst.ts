// Ported from trivela-analyst lib/analyst.ts (ccb8f07). Orchestration: fact
// sheet -> prompt -> LLM -> verify -> one retry with the violations listed
// -> strip and flag anything still unverified. If the LLM fails, the caller
// gets the raw model numbers instead of a blank card.
//
// WHAT CHANGED IN THE PORT, and nothing else did:
//   - the match is read through this site's own server-side backend helper
//     (`reach` / `readJson` in lib/suggesterProxy.ts, SUGGESTER_BACKEND_URL),
//     on the one route the match page already loads, /api/<league>/match/<id>,
//     admitted by the same LEAGUE_PROXY_ALLOWED rule the proxy enforces. No
//     hard-coded backend URL, and never an admin or board route.
//   - the prompts are bundled TS strings (./prompts), not files read at
//     request time, so the serverless bundle carries them.
//   - the demo payloads are imported, so they are bundled too.
//   - the model run id travels with the sheet, for the preview cache key.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { buildFactSheet, sheetForPrompt, type FactSheet } from "./factSheet";
import { checkText, type Segment, type Violation } from "./verify";
import { getClient, PREVIEW_REQUEST, type ChatMessage, type LlmClient } from "./llm";
import { ASK, FEW_SHOT, PERSONA, TEMPLATE, VERIFICATION_LADDER } from "./prompts";
import { ANALYST_LEAGUES, DEMO_MATCHES, isAnalystLeague } from "./demos";
import { confinementBreach, leagueRouteAllowed, reach, readJson } from "../suggesterProxy";
import arsenalEverton from "../../../public/analyst-demo/arsenal-everton.json";
import montrealNashville from "../../../public/analyst-demo/montreal-nashville.json";
import rayoElche from "../../../public/analyst-demo/rayo-elche.json";

export const LEAGUES = ANALYST_LEAGUES;
export type League = (typeof LEAGUES)[number];

/** THE KILL SWITCH. Everything the Analyst serves answers 404 unless this
 *  is exactly "true"; the client reads it from /api/analyst/status. */
export const analystEnabled = () => process.env.ANALYST_ENABLED === "true";

const BACKEND = process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";
const MATCH_TIMEOUT_MS = 45_000;

export function systemPrompt(kind: "preview" | "ask", sheet: FactSheet): string {
  const parts = [PERSONA, VERIFICATION_LADDER];
  if (kind === "preview") parts.push(TEMPLATE, FEW_SHOT);
  else parts.push(ASK);
  parts.push("FACT SHEET (Source A)\n" + sheetForPrompt(sheet));
  return parts.join("\n\n---\n\n");
}

const DEMO_PAYLOADS: Record<string, any> = {
  "arsenal-everton": arsenalEverton,
  "montreal-nashville": montrealNashville,
  "rayo-elche": rayoElche,
};
export const demoPayload = (slug: string): any | null =>
  Object.prototype.hasOwnProperty.call(DEMO_PAYLOADS, slug) ? DEMO_PAYLOADS[slug] : null;
export const demoList = () => DEMO_MATCHES;

/** The model run a payload was priced from: the cache key's third part. */
export function runIdOf(d: any): string {
  const run = d?.model?.primary ?? d?.model?.latest;
  return String(run?.run_id ?? run?.id ?? "no-run");
}

/** A failure loading the match, with the HTTP status the route should use. */
export class LoadError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export const isLoadError = (e: unknown): e is LoadError => e instanceof LoadError;

export type Loaded = { sheet: FactSheet; runId: string };

export async function loadMatch(league: string, eventId: string, demo?: string): Promise<Loaded> {
  if (demo) {
    const d = demoPayload(demo);
    if (!d) throw new LoadError("unknown demo match", 400);
    return { sheet: buildFactSheet(d._demo.league, d._demo.event_id, d), runId: runIdOf(d) };
  }
  if (!isAnalystLeague(league)) throw new LoadError("VAR is not available for this competition", 400);
  if (!/^\d{1,12}$/.test(eventId)) throw new LoadError("bad match id", 400);
  const sub = `match/${eventId}`;
  const path = `/api/${league}/${sub}`;
  // the same two walls the league proxy puts in front of the backend
  if (!leagueRouteAllowed(league, sub) || confinementBreach(path, `/api/${league}/`)) {
    throw new LoadError("bad match id", 400);
  }
  const got = await reach(`${BACKEND}${path}`, { signal: AbortSignal.timeout(MATCH_TIMEOUT_MS) });
  if (!got.reached) {
    throw new LoadError(got.timedOut ? "the backend did not answer in time" : "the backend could not be reached", got.timedOut ? 504 : 502);
  }
  if (!got.res.ok) throw new LoadError(`the backend answered ${got.res.status}`, 502);
  const parsed = await readJson(got.res);
  if (!parsed.ok) throw new LoadError(parsed.why, 502);
  return { sheet: buildFactSheet(league, eventId, parsed.body), runId: runIdOf(parsed.body) };
}

export async function loadSheet(league: string, eventId: string, demo?: string): Promise<FactSheet> {
  return (await loadMatch(league, eventId, demo)).sheet;
}

export type Trace = { attempt: number; raw: string; violations: Violation[] }[];
export type Rendered = { segments: Segment[]; flagged: number };

const render = (text: string, sheet: FactSheet): Rendered => {
  const { segments, violations } = checkText(text, sheet);
  return { segments, flagged: violations.length };
};

function parseJson(text: string): any | null {
  const s = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  try { return JSON.parse(s); } catch { return null; }
}

// All the strings in a preview, for checking in one pass.
const previewStrings = (p: any): string[] =>
  [p?.headline, ...(p?.why ?? []), ...(p?.risks ?? []), p?.market_view].filter((x) => typeof x === "string");

export type PreviewOut = {
  ok: boolean;
  sheet: FactSheet;
  preview?: { headline: Rendered; why: Rendered[]; risks: Rendered[]; market_view: Rendered; confidence: string };
  trace: Trace;
  provider: string;
  model: string;
  system: string;
  fallbackReason?: string;
  cached?: boolean;
};

export const PREVIEW_MAX_TOKENS = 4000;
export const ASK_MAX_TOKENS = 2500;

export async function runPreview(sheet: FactSheet, client: LlmClient = getClient()): Promise<PreviewOut> {
  const system = systemPrompt("preview", sheet);
  const messages: ChatMessage[] = [{ role: "user", content: PREVIEW_REQUEST }];
  const trace: Trace = [];
  let provider = client.name, model = "";
  try {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const res = await client.complete(system, messages, PREVIEW_MAX_TOKENS);
      provider = res.provider; model = res.model;
      const p = parseJson(res.text);
      const violations: Violation[] = p
        ? previewStrings(p).flatMap((s) => checkText(s, sheet).violations)
        : [{ text: res.text.slice(0, 80), reason: "reply was not the required JSON object" }];
      trace.push({ attempt, raw: res.text, violations });
      if (p && (violations.length === 0 || attempt === 2)) {
        return {
          ok: true, sheet, trace, provider, model, system,
          preview: {
            headline: render(p.headline ?? "", sheet),
            why: (p.why ?? []).map((s: string) => render(s, sheet)),
            risks: (p.risks ?? []).map((s: string) => render(s, sheet)),
            market_view: render(p.market_view ?? "", sheet),
            confidence: ["low", "medium", "high"].includes(p.confidence) ? p.confidence : "low",
          },
        };
      }
      // Iterative refinement: one retry, listing exactly what failed.
      messages.push({ role: "assistant", content: res.text });
      messages.push({
        role: "user",
        content: "These numbers or parts failed verification against the fact sheet:\n" +
          violations.map((v) => `- "${v.text}": ${v.reason}`).join("\n") +
          "\nRewrite the whole JSON. Use only {{F#}} placeholders for numbers.",
      });
    }
    return { ok: false, sheet, trace, provider, model, system, fallbackReason: "the reply could not be read as the required JSON" };
  } catch (e: any) {
    return { ok: false, sheet, trace, provider, model, system, fallbackReason: `the language model did not answer (${String(e?.message ?? e).slice(0, 60)})` };
  }
}

export type AskOut = { ok: boolean; answer?: Rendered; trace: Trace; provider: string; model: string; fallbackReason?: string };

export async function runAsk(sheet: FactSheet, question: string, client: LlmClient = getClient()): Promise<AskOut> {
  const system = systemPrompt("ask", sheet);
  const messages: ChatMessage[] = [{ role: "user", content: question.slice(0, 300) }];
  const trace: Trace = [];
  let provider = client.name, model = "";
  try {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const res = await client.complete(system, messages, ASK_MAX_TOKENS);
      provider = res.provider; model = res.model;
      const { violations } = checkText(res.text, sheet);
      trace.push({ attempt, raw: res.text, violations });
      if (violations.length === 0 || attempt === 2) return { ok: true, answer: render(res.text, sheet), trace, provider, model };
      messages.push({ role: "assistant", content: res.text });
      messages.push({ role: "user", content: "Unverified numbers: " + violations.map((v) => `"${v.text}"`).join(", ") + ". Answer again using only {{F#}} placeholders." });
    }
  } catch (e: any) {
    return { ok: false, trace, provider, model, fallbackReason: `the language model did not answer (${String(e?.message ?? e).slice(0, 60)})` };
  }
  return { ok: false, trace, provider, model };
}
