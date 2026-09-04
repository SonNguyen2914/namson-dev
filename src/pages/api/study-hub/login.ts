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

  const client = studyHubClientAddress(req.headers);
  if (!consumeStudyHubRateLimit(`login:${client}`, 8, 15 * 60_000)) {
    res.status(429).json({ error: "Too many attempts; try again later" });
    return;
  }

  const password = typeof req.body?.password === "string"
    ? req.body.password
    : "";
  if (password.length > 256) {
    res.status(401).json({ error: "Access phrase not accepted" });
    return;
  }
  const session = createStudyHubSession(password);
  if (!session) {
    res.status(401).json({ error: "Access phrase not accepted" });
    return;
  }

  res.setHeader(
    "Set-Cookie",
    studyHubSessionCookie(session, requestUsesHttps(req.headers)),
  );
  res.status(204).end();
}
