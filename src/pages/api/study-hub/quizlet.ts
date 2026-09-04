import type { NextApiRequest, NextApiResponse } from "next";
import { loadStudyHubManifest } from "@/lib/studyHubManifest";
import {
  getStudyHubAuthConfiguration,
  isStudyHubSessionValid,
  requestHasSameOrigin,
} from "@/server/studyHubAuth";
import { getStudyPromptProvider } from "@/server/studyHubProvider";
import { consumeStudyHubRateLimit, studyHubClientAddress } from "@/server/studyHubRateLimit";

export function quizletCardsFromAnswer(answer: string, maximum: number) {
  const start = answer.indexOf("{");
  const end = answer.lastIndexOf("}");
  if (start < 0 || end <= start) return [];
  try {
    const payload = JSON.parse(answer.slice(start, end + 1)) as { cards?: unknown };
    if (!Array.isArray(payload.cards)) return [];
    return payload.cards.flatMap((raw) => {
      if (!raw || typeof raw !== "object") return [];
      const card = raw as Record<string, unknown>;
      if (typeof card.term !== "string" || typeof card.definition !== "string") return [];
      const term = card.term.replace(/[\t\r\n]+/g, " ").trim();
      const definition = card.definition.replace(/[\t\r\n]+/g, " ").trim();
      return term && definition ? [{ term, definition }] : [];
    }).slice(0, maximum);
  } catch { return []; }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); res.status(405).json({ error: "Method not allowed" }); return; }
  if (!requestHasSameOrigin(req.headers)) { res.status(403).json({ error: "Origin rejected" }); return; }
  if (!getStudyHubAuthConfiguration().configured || !isStudyHubSessionValid(req.headers.cookie)) {
    res.status(401).json({ error: "Study Hub session required" }); return;
  }
  const client = studyHubClientAddress(req.headers);
  if (!consumeStudyHubRateLimit(`quizlet:${client}`, 4, 60_000)) {
    res.status(429).json({ error: "Quizlet export limit reached; wait a minute" }); return;
  }
  const courseSlug = typeof req.body?.courseSlug === "string" ? req.body.courseSlug : "";
  const topic = typeof req.body?.topic === "string" ? req.body.topic.trim().slice(0, 200) : "";
  const requested = Number(req.body?.count);
  const count = [10, 20, 30, 50].includes(requested) ? requested : 20;
  const course = loadStudyHubManifest().courses.find((candidate) => candidate.slug === courseSlug);
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }
  const provider = getStudyPromptProvider();
  if (!provider) { res.status(503).json({ error: "AI provider is not configured" }); return; }

  try {
    const { getStudyHubDatabase, retrieveStudySources } = await import("@/server/studyHubDb");
    const retrievalPrompt = `${course.title} ${topic || "key concepts definitions study guide exam review"}`;
    const sources = retrieveStudySources(getStudyHubDatabase(), course.slug, retrievalPrompt, 12);
    if (sources.length === 0) { res.status(409).json({ error: "Sync course sources before generating a set" }); return; }
    const result = await provider.complete(course,
      `Create ${count} accurate Quizlet flashcards${topic ? ` about ${topic}` : " covering the most important material"}. ` +
      "Use concise questions or terms and self-contained answers. Return only valid JSON in this exact shape: " +
      '{"cards":[{"term":"...","definition":"..."}]}. Do not use Markdown or tabs.', sources);
    const cards = quizletCardsFromAnswer(result.answer, count);
    if (cards.length < 3) { res.status(502).json({ error: "The provider did not return a valid flashcard set; try again" }); return; }
    res.status(200).json({
      title: `${course.title}${topic ? ` — ${topic}` : " — Study Hub review"}`,
      cards: cards.length,
      importText: cards.map((card) => `${card.term}\t${card.definition}`).join("\n"),
      citations: result.citations,
    });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error && error.name === "AbortError" ? "AI provider timed out" : "Quizlet export failed" });
  }
}
