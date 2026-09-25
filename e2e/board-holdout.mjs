// THE BOARD HOLD-OUT — the suite may read the backend, but it may not
// make it WRITE.
//
// `GET /api/picker/board` is not a read. `src/picker/board.assemble_board`
// calls `snapshots.capture_rows` unconditionally, so every board GET that
// reaches a real backend FREEZES a pre-kickoff row for every fixture on
// the board. Two properties make that unforgiving:
//
//   * `uq_picker_snapshot_root_once_per_fixture` is FIRST-WRITE-WINS, and
//   * there is no delete path on that table, and there must not be one —
//     append-only is the whole reason any other capture there can be
//     trusted.
//
// So a capture taken at the wrong moment is that fixture's pre-kickoff
// read for ever. It already happened once for real: on 2026-09-14 three
// probe requests froze Champions League matchday 2 TWENTY-NINE DAYS out,
// against a ladder whose comparable rows were taken thirty-seven hours
// out. Correcting it took a migration
// (`live_migrations/versions/e4a1c8b73d52_picker_snapshot_corrections.py`).
// This suite was pointed at that same production backend by default, on
// every PR. MEASURED against a counting stand-in for the backend on
// 2026-09-17: three spec files alone sent 23 board assemblies in a
// single run. (The count is per assembly reaching the backend, not per
// navigation — retries repeat it, and the backend's own 90s cache
// swallows some of it, which is what kept the damage survivable rather
// than what made it safe.)
//
// WHY THIS IS A SERVER AND NOT A RULE ABOUT SPECS. A `page.route` mock
// lives in one spec and protects one spec. The board can be reached
// without any spec meaning to reach it: `/bet-suggester/mls/<id>` carries
// a "MLS board" link, and a CLICK navigates exactly like a `goto` that no
// static reading of the spec files will ever see. The only place that
// catches every route to the board — browser fetch, server render, a
// spec's own `request.get`, a redirect, a click — is the single socket
// between the app under test and the backend. That is this file.
//
// It is an INTERPOSER, not a stub: everything except the board is
// forwarded upstream untouched, so the specs that need live data keep
// reading the same server they always did, and `proxy-allowlists.spec.ts`
// still checks the real route table. Exactly one path is held out.
import http from "node:http";
import fs from "node:fs";

const PORT = Number(process.env.SUGGESTER_E2E_HOLDOUT_PORT || 3124);
const UPSTREAM = (process.env.SUGGESTER_E2E_UPSTREAM || "").replace(/\/+$/, "");

if (!UPSTREAM) {
  console.error("[board-holdout] refusing to start with no upstream: set "
    + "SUGGESTER_E2E_UPSTREAM to the backend to forward to");
  process.exit(1);
}

/** THE ONE HELD-OUT PATH. Matched on the pathname alone, before any
 *  query string: `?capture=false` is silently dropped by the backend, so
 *  there is no such thing as a board GET that does not capture, and
 *  nothing in the query string can make one safe. */
const isBoard = (pathname) => pathname === "/api/picker/board"
  || pathname.startsWith("/api/picker/board/");

/** WHAT THE HOLD-OUT DID, READABLE WHILE IT RUNS. `refused` is the
 *  evidence that the hold-out is the thing standing between this suite
 *  and the store; `forwarded_board` is a COUNTER THAT MUST STAY 0 and is
 *  kept so that "it held" is a measurement rather than a belief. */
const ledger = { refused: [], forwarded: 0, forwarded_board: 0, upstream: UPSTREAM };

// WHAT IT DID, SURVIVING THE RUN. Playwright stops this server when the
// suite ends, and with it the only copy of what it caught. Pointed at a
// path, the ledger is written on every refusal so "no board request
// reached the backend" is a file an operator can read afterwards rather
// than a claim about a process that has exited.
const LEDGER_PATH = process.env.SUGGESTER_E2E_HOLDOUT_LEDGER || "";
const persist = () => {
  if (!LEDGER_PATH) return;
  try { fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2)); }
  catch { /* the ledger is evidence, never a reason to fail a run */ }
};

// THE LIVE SET IS RATE-LIMITED HERE (2026-09-25). In live mode
// (SUGGESTER_E2E_MODE=live) the hold-out is the one socket between the
// `@live` tests and a backend this suite does not own, so it is also the
// one place a ceiling on their pace can be enforced for every path at
// once: forwarded reads leave at least MIN_GAP_MS apart. 0 (hermetic
// mode, where the upstream is the local stand-in) turns it off.
const MIN_GAP_MS = Number(process.env.SUGGESTER_E2E_MIN_GAP_MS || 0);
let nextSlot = 0;
const awaitSlot = () => {
  if (!MIN_GAP_MS) return Promise.resolve();
  const now = Date.now();
  const at = Math.max(now, nextSlot);
  nextSlot = at + MIN_GAP_MS;
  return new Promise((r) => setTimeout(r, at - now));
};

const sendJson = (res, status, body) => {
  const raw = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(raw),
  });
  res.end(raw);
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);

  // The hold-out's own ledger, for the guard spec and for an operator
  // watching a run. Never forwarded.
  if (url.pathname === "/__holdout/ledger") {
    return sendJson(res, 200, ledger);
  }

  // AM I ACTUALLY IN THE PATH? A probe the app forwards verbatim (the
  // league proxies pass `req.url`'s query string through untouched) and
  // that this server answers WITHOUT forwarding. If the app under test
  // is talking to a real backend instead of to this one — a stale
  // `npm start` on the port, adopted by `reuseExistingServer` with the
  // backend it booted with — the sentinel simply will not come back, and
  // `the-board-writes-nothing.spec.ts` fails rather than the suite
  // quietly running unprotected. The probe rides an existing read-only
  // route, so the failure mode if it DOES reach a backend is an ignored
  // query parameter and nothing else.
  if (url.searchParams.has("__holdout_probe")) {
    // `path` IS THE POINT FOR THE FORWARDING SPECS, not decoration on
    // the sentinel. `req.url` here is what the app's proxy handler
    // REWROTE the browser's URL into and put on this socket, so a spec
    // can assert the rewrite — prefix, sub-path and query string,
    // verbatim — instead of inferring it from the fact that a live
    // backend answered something. Added 2026-09-22 with the forwarding
    // probes in e2e/proxy-allowlists.spec.ts, e2e/picker.spec.ts and
    // e2e/finished-is-asked-for.spec.ts, which used to prove forwarding
    // by round-tripping the real backend and went red whenever that
    // backend was slow — a failed read rendered as a finding, which is
    // the shape this tree refuses. The probe is answered HERE and never
    // forwarded, so those specs no longer depend on the backend's
    // health for a claim that was never about the backend.
    return sendJson(res, 200, {
      __board_holdout: true, upstream: UPSTREAM, path: req.url,
    });
  }

  if (isBoard(url.pathname)) {
    ledger.refused.push({
      at: new Date().toISOString(),
      url: req.url,
      // Whose request was this? The app's server-side proxy is the only
      // thing that should ever appear here, but a spec's own
      // `request.get` reaches the same socket and is worth telling apart.
      via: req.headers["user-agent"] || null,
    });
    persist();
    // 503 with a NAMED detail, in the vocabulary `fetchBoard` already
    // carries forward to the reader: it quotes `detail` from the body, so
    // an unmocked spec shows this sentence on the page instead of a
    // generic failure, and whoever is looking at the trace is told what
    // to do about it.
    return sendJson(res, 503, {
      detail: "the e2e board hold-out refused this request: GET "
        + "/api/picker/board WRITES a permanent pre-kickoff snapshot on "
        + "the real backend, so the suite never forwards it. Mock it in "
        + "your spec — page.route(\"**/api/picker/board**\", ...), or "
        + "serveEight(page) from e2e/eight-columns.ts.",
      reason: "e2e_board_holdout",
    });
  }

  // EVERYTHING ELSE IS FORWARDED UNTOUCHED.
  let upstream;
  await awaitSlot();
  try {
    upstream = await fetch(`${UPSTREAM}${req.url}`, {
      method: req.method,
      headers: { "content-type": "application/json" },
      body: ["POST", "PUT", "PATCH"].includes(req.method || "")
        ? await readBody(req) : undefined,
    });
  } catch (err) {
    return sendJson(res, 502, {
      error: "Backend unreachable",
      reason: "holdout_upstream_unreachable",
      detail: String(err),
    });
  }
  ledger.forwarded += 1;
  // persisted on every forward too, so the file's count is the run's
  // count: "how many reads reached the upstream" is the live set's cost
  persist();
  // A SECOND, DELIBERATELY CRUDER PREDICATE — and it is not redundant
  // with `isBoard`. Asking `isBoard` again here could never fail: a
  // request only reaches this line BECAUSE `isBoard` said no, so the
  // counter would be structurally zero and would prove nothing. This
  // asks a different question of the whole forwarded URL, so what it
  // actually detects is the two disagreeing — a board path spelled a way
  // `isBoard` does not recognise, which is the one way this hold-out
  // fails without anybody noticing.
  if (/picker\/board/i.test(req.url || "")) {
    ledger.forwarded_board += 1;
    console.error("[board-holdout] *** FORWARDED A BOARD REQUEST *** "
      + `${req.url} — isBoard() did not match a path that looks like the `
      + "board. The hold-out is not holding.");
    persist();
  }
  const body = Buffer.from(await upstream.arrayBuffer());
  res.writeHead(upstream.status, {
    "content-type": upstream.headers.get("content-type") || "application/json",
    "content-length": body.length,
  });
  res.end(body);
});

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[board-holdout] :${PORT} -> ${UPSTREAM} `
    + "(GET /api/picker/board is held out)");
});
