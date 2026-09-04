import type { NextApiRequest, NextApiResponse } from "next";
import { loadStudyHubManifest } from "@/lib/studyHubManifest";
import {
  getStudyHubAuthConfiguration,
  isStudyHubSessionValid,
  requestHasSameOrigin,
} from "@/server/studyHubAuth";
import {
  getStudyPromptProvider,
} from "@/server/studyHubProvider";
import {
  consumeStudyHubRateLimit,
  studyHubClientAddress,
} from "@/server/studyHubRateLimit";

const MAX_PROMPT_LENGTH = 4_000;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!requestHasSameOrigin(req.headers)) {
    res.status(403).json({ error: "Origin rejected" });
    return;
  }
  if (!getStudyHubAuthConfiguration().configured) {
    res.status(503).json({ error: "Study Hub access is not configured" });
    return;
  }
  if (!isStudyHubSessionValid(req.headers.cookie)) {
    res.status(401).json({ error: "Study Hub session required" });
    return;
  }

  const client = studyHubClientAddress(req.headers);
  if (!consumeStudyHubRateLimit(`prompt:${client}`, 12, 60_000)) {
    res.status(429).json({ error: "Prompt limit reached; wait a minute" });
    return;
  }

  const courseSlug = typeof req.body?.courseSlug === "string"
    ? req.body.courseSlug
    : "";
  const prompt = typeof req.body?.prompt === "string"
    ? req.body.prompt.trim()
    : "";
  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    res.status(400).json({
      error: `Prompt must contain 1–${MAX_PROMPT_LENGTH} characters`,
    });
    return;
  }

  const studyHubManifest = loadStudyHubManifest();
  const course = studyHubManifest.courses.find(
    (candidate) => candidate.slug === courseSlug,
  );
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const provider = getStudyPromptProvider();
  if (!provider) {
    res.status(503).json({ error: "Live prompting is not configured" });
    return;
  }

  try {
    const { getStudyHubDatabase, retrieveStudySources } = await import("@/server/studyHubDb");
    const sources = retrieveStudySources(getStudyHubDatabase(), course.slug, prompt);
    const result = await provider.complete(course, prompt, sources);
    res.status(200).json({
      answer: result.answer,
      provider: result.provider,
      citations: result.citations,
      reviewStatus: "draft",
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "Prompt provider timed out"
      : "Prompt provider failed";
    res.status(502).json({ error: message });
  }
}
