import type { NextApiRequest, NextApiResponse } from "next";
import { proxy } from "../../../lib/suggesterProxy";

// `hours_ahead` is an integer the backend bounds to 1..720
// (`Query(48, ge=1, le=720)`); anything else is refused here rather than
// interpolated into the query string.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = req.query.hours_ahead ?? "72";
  const hours = typeof raw === "string" && /^\d{1,4}$/.test(raw)
    ? Number(raw) : NaN;
  if (!(hours >= 1 && hours <= 720)) {
    return res.status(400).json({
      error: "invalid_parameter",
      reason: "invalid_parameter",
      parameter: "hours_ahead",
      detail: "`hours_ahead` must be an integer between 1 and 720. This "
        + "refusal is authored here: no backend was contacted.",
    });
  }
  return proxy(req, res, `/api/matches/upcoming?hours_ahead=${hours}`,
               "/api/matches/upcoming");
}
