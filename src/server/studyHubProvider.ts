import type { StudyCourse } from "@/lib/studyHubManifest";

export type StudyPromptResult = {
  answer: string;
  provider: string;
};

export type StudyPromptProvider = {
  id: string;
  complete(course: StudyCourse, prompt: string): Promise<StudyPromptResult>;
};

export type StudyPromptProviderStatus =
  | { configured: false }
  | { configured: true; provider: string };

type OpenAiCompatibleResponse = {
  choices?: Array<{ message?: { content?: unknown } }>;
  error?: { message?: unknown };
};

function configuredHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    const localDevelopment =
      process.env.NODE_ENV !== "production" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (url.protocol !== "https:" && !localDevelopment) return null;
    return url;
  } catch {
    return null;
  }
}

function openAiCompatibleProvider(): StudyPromptProvider | null {
  const baseUrl = configuredHttpsUrl(process.env.STUDY_HUB_AI_BASE_URL ?? "");
  const apiKey = process.env.STUDY_HUB_AI_API_KEY ?? "";
  const model = process.env.STUDY_HUB_AI_MODEL ?? "";
  if (!baseUrl || !apiKey || !model) return null;

  return {
    id: "openai-compatible",
    async complete(course, prompt) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      try {
        const endpoint = new URL(
          "chat/completions",
          baseUrl.href.endsWith("/") ? baseUrl : `${baseUrl.href}/`,
        );
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content:
                  `You are a study assistant for ${course.title} ` +
                  `(${course.semester}). Your response is a draft for ` +
                  "the student to verify. You do not have access to their " +
                  "Google Drive, NotebookLM, textbooks, lecture files, or " +
                  "private notes. Never claim that you reviewed those sources. " +
                  "State uncertainty plainly and favor explanations that help " +
                  "the student reason in their own words.",
              },
              { role: "user", content: prompt },
            ],
          }),
          signal: controller.signal,
        });

        const payload = await response.json() as OpenAiCompatibleResponse;
        const answer = payload.choices?.[0]?.message?.content;
        if (!response.ok || typeof answer !== "string" || !answer.trim()) {
          const providerMessage = payload.error?.message;
          throw new Error(
            typeof providerMessage === "string"
              ? providerMessage
              : `Prompt provider returned ${response.status}`,
          );
        }

        return { answer: answer.trim(), provider: this.id };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

export function getStudyPromptProviderStatus(): StudyPromptProviderStatus {
  const provider = getStudyPromptProvider();
  return provider
    ? { configured: true, provider: provider.id }
    : { configured: false };
}

export function getStudyPromptProvider(): StudyPromptProvider | null {
  if (process.env.STUDY_HUB_AI_PROVIDER !== "openai-compatible") {
    return null;
  }
  return openAiCompatibleProvider();
}
