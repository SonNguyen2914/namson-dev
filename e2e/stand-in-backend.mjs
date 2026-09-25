// THE STAND-IN BACKEND — what the default suite talks to instead of
// production.
//
// WHY IT EXISTS (2026-09-25). The suite used to forward every unmocked
// read to the production Railway backend through the board hold-out.
// Measured that day against a counting stand-in: 1,786-2,072 GETs per
// run, mostly reads nobody meant to make (CompRail's UCL and EFL Cup
// fixtures on every landing-page test, the operator-only watched strip
// polled from every anonymous tab, the Leagues Cup field read that
// three "mocked" tests never mocked). The same morning that backend hung
// twice from worker-pool starvation, and every PR run was adding load to
// it.
//
// WHAT IT DOES. It answers every request with a NAMED 503 in JSON — the
// vocabulary every reader in src/lib already carries forward to the page
// — and it writes down every path it was asked for. Nothing here is
// recorded data: a spec that needs a payload serves it with page.route,
// and a spec that needs the real backend is tagged `@live` and runs in
// the small, explicit, rate-limited live set (SUGGESTER_E2E_MODE=live).
//
// THE LOG IS THE EVIDENCE. `GET /__standin/log` returns every request
// received so far, so a guard can assert what did and did not reach the
// backend socket (e2e/proxy-traversal.spec.ts), and "how many reads did
// this run send upstream" is a count rather than a belief. Pointed at a
// file with SUGGESTER_E2E_STANDIN_LOG, the log also survives the run.
import http from "node:http";
import fs from "node:fs";

const PORT = Number(process.env.SUGGESTER_E2E_STANDIN_PORT || 3125);
const LOG_PATH = process.env.SUGGESTER_E2E_STANDIN_LOG || "";

/** Every request received, in order. The stand-in's own `/__standin/*`
 *  routes are not recorded: they are the log being read, not traffic. */
const log = [];

const sendJson = (res, status, body) => {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(raw),
  });
  res.end(raw);
};

const server = http.createServer((req, res) => {
  const url = req.url || "/";
  if (url === "/__standin/log" || url.startsWith("/__standin/log?")) {
    return sendJson(res, 200, { count: log.length, requests: log });
  }
  const entry = { at: new Date().toISOString(), method: req.method, url };
  log.push(entry);
  if (LOG_PATH) {
    try { fs.appendFileSync(LOG_PATH, `${entry.at} ${entry.method} ${url}\n`); }
    catch { /* the log is evidence, never a reason to fail a request */ }
  }
  // READY, so the hold-out and anything that asks "is there a backend"
  // get a real answer about the stand-in rather than a refusal.
  if (url === "/api/ready") {
    return sendJson(res, 200, { ready: true, e2e_stand_in: true });
  }
  return sendJson(res, 503, {
    detail: "the e2e stand-in backend answered this request: the default "
      + "suite is hermetic and never reaches a real backend. Serve the "
      + "payload with page.route in your spec, or tag the test @live if "
      + "it genuinely needs the deployed backend.",
    reason: "e2e_stand_in",
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[stand-in] :${PORT} answering every read with a named 503`);
});
