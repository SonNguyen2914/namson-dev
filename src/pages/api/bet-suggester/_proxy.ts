// Shared proxy helper for all bet-suggester API routes.
import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND = process.env.SUGGESTER_BACKEND_URL || "http://localhost:8000";

export async function proxy(
  req: NextApiRequest,
  res: NextApiResponse,
  backendPath: string
) {
  try {
    const r = await fetch(`${BACKEND}${backendPath}`, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: ["POST", "PUT"].includes(req.method || "") ? JSON.stringify(req.body) : undefined,
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ error: "Backend unreachable", detail: String(err) });
  }
}
