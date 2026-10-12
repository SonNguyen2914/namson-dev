import { execFileSync } from "node:child_process";
import os from "node:os";

/* BUILD BEACON (2026-10-12). This repo is public, so anyone can clone it
   and build the site. When a production build runs somewhere that is not
   Son's own deployment — not his Vercel project, not this repo's CI —
   the build sends ONE anonymous GET saying where it was built, so a copy
   of the frontend does not go unnoticed. The README says so.

   What counts as OURS:
     - Vercel, building SonNguyen2914/namson-dev (VERCEL_GIT_REPO_OWNER /
       VERCEL_GIT_REPO_SLUG), or a project whose production domain is
       namson.dev;
     - GitHub Actions running in SonNguyen2914/namson-dev (this covers
       pull requests from forks too: their GITHUB_REPOSITORY is ours);
     - any build with NAMSON_BEACON=off — Son's own machine and his
       agents' worktrees set that, since a local clone is otherwise
       indistinguishable from someone else's.

   The call never fails or slows the build: fire-and-forget, 2 s
   timeout, every error swallowed, nothing awaited. No secret is involved
   (the repo is public): the receiving route on the backend is open and
   only records what it is told. Until that route ships, the call simply
   gets a 404 — harmless. */

const OWNER = "SonNguyen2914";
const REPO = "namson-dev";
const OUR_DOMAINS = new Set(["namson.dev", "www.namson.dev"]);
export const BEACON_URL =
  "https://wc26-bet-suggester-production.up.railway.app/api/site/beacon";

type Env = Record<string, string | undefined>;

export function isOurBuild(env: Env): boolean {
  if ((env.NAMSON_BEACON ?? "").toLowerCase() === "off") return true;
  if (env.VERCEL) {
    if (env.VERCEL_GIT_REPO_OWNER === OWNER && env.VERCEL_GIT_REPO_SLUG === REPO) return true;
    if (OUR_DOMAINS.has(env.VERCEL_PROJECT_PRODUCTION_URL ?? "")) return true;
  }
  if (env.GITHUB_ACTIONS && env.GITHUB_REPOSITORY === `${OWNER}/${REPO}`) return true;
  return false;
}

function gitOrigin(): string {
  try {
    return execFileSync("git", ["config", "--get", "remote.origin.url"], {
      timeout: 1000,
      stdio: ["ignore", "pipe", "ignore"],
    }).toString().trim().replace(/^https?:\/\/[^@/]*@/, "https://"); // drop any embedded credentials
  } catch {
    return "";
  }
}

function platform(env: Env): string {
  if (env.VERCEL) return "vercel";
  if (env.GITHUB_ACTIONS) return "github-actions";
  if (env.NETLIFY) return "netlify";
  if (env.CF_PAGES) return "cloudflare-pages";
  if (env.RENDER) return "render";
  if (env.RAILWAY_ENVIRONMENT) return "railway";
  if (env.CI) return "ci";
  return "local";
}

export function beaconUrl(env: Env, now = new Date()): string {
  const repo =
    env.GITHUB_REPOSITORY ||
    (env.VERCEL_GIT_REPO_OWNER ? `${env.VERCEL_GIT_REPO_OWNER}/${env.VERCEL_GIT_REPO_SLUG ?? ""}` : "") ||
    env.REPOSITORY_URL || // Netlify
    gitOrigin();
  const host =
    env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL || env.URL || env.CF_PAGES_URL || os.hostname();
  const q = new URLSearchParams({
    h: host.slice(0, 200),
    r: repo.slice(0, 200),
    p: platform(env),
    t: now.toISOString(),
  });
  return `${env.NAMSON_BEACON_URL || BEACON_URL}?${q}`; // override only for testing the beacon itself
}

/** Fire the beacon at most once per build process tree. Never throws. */
export function fireBuildBeacon(env: Env = process.env): void {
  try {
    if (env.__NAMSON_BEACON_SENT || isOurBuild(env)) return;
    process.env.__NAMSON_BEACON_SENT = "1"; // build workers inherit this
    fetch(beaconUrl(env), { signal: AbortSignal.timeout(2000) }).catch(() => {});
  } catch {
    /* a tripwire must never trip the build */
  }
}
