import type { NextApiRequest, NextApiResponse } from "next";
import {
  createStudyHubSession,
  getStudyHubAuthConfiguration,
  requestHasSameOrigin,
  requestUsesHttps,
  studyHubSessionCookie,
} from "@/server/studyHubAuth";
import {
  consumeStudyHubRateLimit,
  studyHubClientAddress,
} from "@/server/studyHubRateLimit";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
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

  const client = studyHubClientAddress(req.headers);
  if (!consumeStudyHubRateLimit(`login:${client}`, 8, 15 * 60_000)) {
    return res.status(429).json({ error: "Too many attempts; try again later" });
  }

  const password = typeof req.body?.password === "string"
    ? req.body.password
    : "";
  if (password.length > 256) {
    return res.status(401).json({ error: "Access phrase not accepted" });
  }
  const session = createStudyHubSession(password);
  if (!session) {
    return res.status(401).json({ error: "Access phrase not accepted" });
  }

  res.setHeader(
    "Set-Cookie",
    studyHubSessionCookie(session, requestUsesHttps(req.headers)),
  );
  return res.status(204).end();
}
