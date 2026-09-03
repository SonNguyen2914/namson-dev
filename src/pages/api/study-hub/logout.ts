import type { NextApiRequest, NextApiResponse } from "next";
import {
  clearStudyHubSessionCookie,
  requestHasSameOrigin,
  requestUsesHttps,
} from "@/server/studyHubAuth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!requestHasSameOrigin(req.headers)) {
    return res.status(403).json({ error: "Origin rejected" });
  }

  res.setHeader(
    "Set-Cookie",
    clearStudyHubSessionCookie(requestUsesHttps(req.headers)),
  );
  return res.status(204).end();
}
