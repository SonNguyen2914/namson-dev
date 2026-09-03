import type { IncomingHttpHeaders } from "node:http";

type Bucket = { count: number; resetsAt: number };
const buckets = new Map<string, Bucket>();

export function studyHubClientAddress(headers: IncomingHttpHeaders) {
  const forwarded = headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(",")[0]?.trim() || "unknown";
}

export function consumeStudyHubRateLimit(
  key: string,
  maximum: number,
  windowMs: number,
  now = Date.now(),
) {
  const existing = buckets.get(key);
  if (!existing || existing.resetsAt <= now) {
    buckets.set(key, { count: 1, resetsAt: now + windowMs });
    return true;
  }

  if (existing.count >= maximum) return false;
  existing.count += 1;
  return true;
}
