// Catch-all proxy for the La Liga read surface (read-only GETs). The
// backend has served these since 2026-07-30 and nothing could reach them:
// this file did not exist, so the board rendered "coming soon" for a
// competition that was fully wired.
import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

// No `approval` here: the backend has never served /api/laliga/approval
// (mls, epl and ligamx have one; La Liga's approval state is read from
// /status). The entry was copied from the EPL list and forwarded to a
// backend 404 — e2e/proxy-allowlists.spec.ts pins the refusal.
const ALLOWED = new Set(["scoreboard", "schedule", "standings", "markets",
                         "odds", "status"]);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  const ok = ALLOWED.has(segs) || /^match\/\d{1,12}$/.test(segs);
  if (req.method !== "GET" || !ok) {
    return res.status(404).json({ error: "unknown laliga route" });
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/laliga/${segs}${qs}`);
}
