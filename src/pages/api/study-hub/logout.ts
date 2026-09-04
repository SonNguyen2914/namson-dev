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
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!requestHasSameOrigin(req.headers)) {
    res.status(403).json({ error: "Origin rejected" });
    return;
  }

  res.setHeader(
    "Set-Cookie",
    clearStudyHubSessionCookie(requestUsesHttps(req.headers)),
  );
  res.status(204).end();
}
