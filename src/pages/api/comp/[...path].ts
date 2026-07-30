// Catch-all proxy for the viewer competitions (read-only GETs).
// Deliberately no odds route: these competitions have no model, so there is
// nothing for one to serve. See src/competitions.py.
import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const segs = ((req.query.path as string[]) || []).join("/");
  // "" is the listing; otherwise {key}/{fixtures|markets|status}
  const ok = segs === "" || /^[a-z]{2,16}\/(fixtures|markets|status)$/.test(segs);
  if (req.method !== "GET" || !ok) {
    return res.status(404).json({ error: "unknown comp route" });
  }
  const qs = req.url?.includes("?") ? "?" + req.url.split("?")[1] : "";
  return proxy(req, res, `/api/comp${segs ? "/" + segs : ""}${qs}`);
}
