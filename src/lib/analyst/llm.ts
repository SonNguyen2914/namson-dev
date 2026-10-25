// Ported from trivela-analyst lib/llm.ts (ccb8f07). One interface, three
// adapters. LLM_PROVIDER picks one; keys come only from the environment and
// are never logged or returned to the browser.
//
// THE MOCK IS THE DEFAULT. A real model is used only when LLM_PROVIDER names
// it AND its key is set, so CI, local runs and a preview deploy without the
// key never reach a paid API. Neither real adapter sends `temperature`
// (current Claude models reject it); both stop waiting after 55 s.
/* eslint-disable @typescript-eslint/no-explicit-any */

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type LlmResult = { text: string; provider: string; model: string };

export interface LlmClient {
  name: string;
  complete(system: string, messages: ChatMessage[], maxTokens?: number): Promise<LlmResult>;
}

export const LLM_TIMEOUT_MS = 55_000;
export const DEFAULT_CLAUDE_MODEL = "claude-haiku-5-5";

class ClaudeClient implements LlmClient {
  name = "claude";
  constructor(private key: string, private model: string) {}
  async complete(system: string, messages: ChatMessage[], maxTokens = 4000): Promise<LlmResult> {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": this.key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: this.model, max_tokens: maxTokens, system, messages }),
      signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    });
    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      throw new Error(`Claude API ${r.status}: ${String(e?.error?.message ?? "").slice(0, 80)}`);
    }
    const j = await r.json();
    const text = (j.content ?? []).filter((c: any) => c.type === "text").map((c: any) => c.text).join("");
    return { text, provider: "claude", model: this.model };
  }
}

class GeminiClient implements LlmClient {
  name = "gemini";
  constructor(private key: string, private model: string) {}
  async complete(system: string, messages: ChatMessage[], maxTokens = 4000): Promise<LlmResult> {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": this.key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { maxOutputTokens: maxTokens },
      }),
      signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    });
    if (!r.ok) throw new Error(`Gemini API ${r.status}`);
    const j = await r.json();
    const text = (j.candidates?.[0]?.content?.parts ?? []).map((p: any) => p.text ?? "").join("");
    return { text, provider: "gemini", model: this.model };
  }
}

// Deterministic stand-in for tests and for running without a key. It answers
// with placeholders only, so it always verifies.
export class MockClient implements LlmClient {
  name = "mock";
  constructor(private script?: string[]) {}
  private i = 0;
  async complete(_system?: string, messages?: ChatMessage[]): Promise<LlmResult> {
    if (this.script) return { text: this.script[Math.min(this.i++, this.script.length - 1)], provider: "mock", model: "mock" };
    // a preview asks for JSON; an Ask question gets a plain-text answer
    const isPreview = messages?.[0]?.content === PREVIEW_REQUEST;
    const text = isPreview || !messages ? JSON.stringify({
      headline: "The model leans home at {{F1}}, with the draw at {{F2}}.",
      why: ["Home win sits at {{F1}} in Trivela's simulation.", "Expected goals favour the home side: {{F4}} to {{F5}}."],
      risks: ["The away side still wins {{F3}} of simulations."],
      market_view: "The market prices are on the fact sheet; compare them with the model's numbers.",
      confidence: "medium",
    }) : "Trivela's model has the draw at {{F2}}, roughly one game in four. Confidence: medium";
    return { text, provider: "mock", model: "mock" };
  }
}

/** The first user turn of a preview; the mock reads it to pick its shape. */
export const PREVIEW_REQUEST = "Write the match preview now.";

export function getClient(): LlmClient {
  const p = (process.env.LLM_PROVIDER ?? "").toLowerCase();
  if (p === "gemini" && process.env.GEMINI_API_KEY) return new GeminiClient(process.env.GEMINI_API_KEY, process.env.GEMINI_MODEL ?? "gemini-2.5-flash");
  if (p === "claude" && process.env.ANTHROPIC_API_KEY) return new ClaudeClient(process.env.ANTHROPIC_API_KEY, process.env.ANTHROPIC_MODEL ?? DEFAULT_CLAUDE_MODEL);
  return new MockClient();
}
