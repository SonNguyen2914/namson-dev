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
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!requestHasSameOrigin(req.headers)) {
    return res.status(403).json({ error: "Origin rejected" });
  }
  if (!getStudyHubAuthConfiguration().configured) {
    return res.status(503).json({ error: "Study Hub access is not configured" });
  }
  if (!isStudyHubSessionValid(req.headers.cookie)) {
    return res.status(401).json({ error: "Study Hub session required" });
  }

  const client = studyHubClientAddress(req.headers);
  if (!consumeStudyHubRateLimit(`prompt:${client}`, 12, 60_000)) {
    return res.status(429).json({ error: "Prompt limit reached; wait a minute" });
  }

  const courseSlug = typeof req.body?.courseSlug === "string"
    ? req.body.courseSlug
    : "";
  const prompt = typeof req.body?.prompt === "string"
    ? req.body.prompt.trim()
    : "";
  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      error: `Prompt must contain 1–${MAX_PROMPT_LENGTH} characters`,
    });
  }

  const studyHubManifest = loadStudyHubManifest();
  const course = studyHubManifest.courses.find(
    (candidate) => candidate.slug === courseSlug,
  );
  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  const provider = getStudyPromptProvider();
  if (!provider) {
    return res.status(503).json({ error: "Live prompting is not configured" });
  }

  try {
    const result = await provider.complete(course, prompt);
    return res.status(200).json({
      answer: result.answer,
      provider: result.provider,
      reviewStatus: "draft",
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "Prompt provider timed out"
      : "Prompt provider failed";
    return res.status(502).json({ error: message });
  }
}
