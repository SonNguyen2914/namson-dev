import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import type { IncomingHttpHeaders } from "node:http";

export const STUDY_HUB_SESSION_COOKIE = "study_hub_session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 12;

type AuthConfiguration =
  | { configured: true; password: string; sessionSecret: string }
  | { configured: false };

export function getStudyHubAuthConfiguration(): AuthConfiguration {
  const password = process.env.STUDY_HUB_ACCESS_PASSWORD ?? "";
  const sessionSecret = process.env.STUDY_HUB_SESSION_SECRET ?? "";

  if (password.length < 12 || sessionSecret.length < 32) {
    return { configured: false };
  }

  return { configured: true, password, sessionSecret };
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safelyEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right));
}

function signature(expiresAt: number, secret: string) {
  return createHmac("sha256", secret)
    .update(String(expiresAt))
    .digest("base64url");
}

export function createStudyHubSession(
  passwordAttempt: string,
  now = Date.now(),
): string | null {
  const configuration = getStudyHubAuthConfiguration();
  if (!configuration.configured) return null;
  if (!safelyEqual(passwordAttempt, configuration.password)) return null;

  const expiresAt = Math.floor(now / 1000) + SESSION_LIFETIME_SECONDS;
  return `${expiresAt}.${signature(expiresAt, configuration.sessionSecret)}`;
}

function cookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return null;

  for (const entry of cookieHeader.split(";")) {
    const separator = entry.indexOf("=");
    if (separator < 0) continue;
    if (entry.slice(0, separator).trim() !== name) continue;

    try {
      return decodeURIComponent(entry.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }

  return null;
}

export function isStudyHubSessionValid(
  cookieHeader: string | undefined,
  now = Date.now(),
) {
  const configuration = getStudyHubAuthConfiguration();
  if (!configuration.configured) return false;

  const session = cookieValue(cookieHeader, STUDY_HUB_SESSION_COOKIE);
  if (!session) return false;

  const [expiresRaw, suppliedSignature, ...extra] = session.split(".");
  const expiresAt = Number(expiresRaw);
  if (
    extra.length > 0 ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(now / 1000) ||
    !suppliedSignature
  ) {
    return false;
  }

  return safelyEqual(
    suppliedSignature,
    signature(expiresAt, configuration.sessionSecret),
  );
}

export function studyHubSessionCookie(value: string, secure: boolean) {
  const attributes = [
    `${STUDY_HUB_SESSION_COOKIE}=${encodeURIComponent(value)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    `Max-Age=${SESSION_LIFETIME_SECONDS}`,
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
}

export function clearStudyHubSessionCookie(secure: boolean) {
  const attributes = [
    `${STUDY_HUB_SESSION_COOKIE}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Strict",
    "Max-Age=0",
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
}

function firstHeader(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function requestUsesHttps(headers: IncomingHttpHeaders) {
  return firstHeader(headers["x-forwarded-proto"]) === "https";
}

export function requestHasSameOrigin(headers: IncomingHttpHeaders) {
  const origin = firstHeader(headers.origin);
  const host = firstHeader(headers["x-forwarded-host"])
    ?? firstHeader(headers.host);
  if (!origin || !host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
