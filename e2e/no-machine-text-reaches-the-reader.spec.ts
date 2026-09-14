import { expect, test } from "@playwright/test";

// A READER IS SHOWN A SENTENCE, NEVER AN INTERNAL TOKEN.
//
// THE DEFECT, ON THE LIVE BOARD (2026-09-14). The La Liga column printed
// this, as body text, on a public page:
//
//     kalshi unavailable — 429 Client Error: Too Many Requests for url:
//     https://api.elections.kalshi.com/trade-api/v2/markets?
//
// A raw Python exception string, with the provider's host, its API path
// and the parameters we send it. Two separate wrongs: the reader is
// handed machine text they cannot act on, and an internal endpoint is
// published.
//
// THE RULE ALREADY EXISTS IN THIS SUITE, for its neighbouring case —
// `no-raw-slug-reaches-the-reader.spec.ts` for competition slugs, and
// `LOOKS_LIKE_A_SLUG` in `live-surface-audit.spec.ts`;
// `restructure.spec.ts` keeps the same rule against the browser's own
// vocabulary ("a dead network renders a sentence, not the browser's raw
// string"). This file is that one rule extended to the third source of
// machine text: the PROVIDER's exception, which arrives through the
// backend rather than from the browser and which nothing screened.
//
// AND THE ABSENCE MUST STILL BE NAMED. This is not "hide the error" —
// half of every test below asserts the column still SAYS the book could
// not be read, names Kalshi, and keeps the status code, which is a fact
// a reader can act on. A guard that only forbade would be satisfied by
// deleting the note, which is the worse bug.
//
// THE CHECK IS A SHAPE TEST over the text the browser rendered, exactly
// as the slug guard is. It knows nothing about how the fix is
// implemented, so it cannot pass by construction: it reads the column's
// own `textContent` and asks whether a URL, a query string, a host, a
// Python exception class or a traceback is anywhere in it.

/** Every shape that is machine text wherever it appears, with the words
 *  a failure message should use instead. Derived from what the providers
 *  actually emit — `requests`' `HTTPError` repr, `urllib3`'s pool
 *  errors, an upstream HTML error page — not from a list of strings this
 *  file happens to send below. */
const MACHINE_TEXT: readonly (readonly [RegExp, string])[] = [
  [/[a-z][a-z0-9+.-]*:\/\//i, "a URL scheme"],
  [/\b(?:[a-z0-9-]+\.)+(?:com|net|org|io|dev|app|co|uk|ai)\b/i, "a hostname"],
  [/\bfor\s+url\b/i, "`requests`' own `for url:` tail"],
  [/[?&][A-Za-z_][\w.-]*=/, "a query string"],
  [/\b[A-Za-z_][A-Za-z0-9_.]*(?:Error|Exception)\s*:/,
    "a Python exception class"],
  [/\b\d{3}\s+(?:Client|Server)\s+Error\b/i, "a `requests` status line"],
  [/Traceback \(most recent call last\)/, "a traceback"],
  [/File "[^"]*", line \d+/, "a stack frame"],
  [/<\s*\/?\s*(?:html|body|head|h1|title|pre|div)\b/i, "raw HTML"],
];

function assertNoMachineText(where: string, text: string) {
  for (const [shape, what] of MACHINE_TEXT) {
    const hit = shape.exec(text);
    expect(hit, `${where} shows ${what} — "${hit?.[0]}" — to a reader. `
      + "A reader is shown a sentence, never an internal token.")
      .toBeNull();
  }
}

// ── what the providers really send, verbatim ────────────────────────
//
// FIXTURES SPEAK THE PROVIDER'S LANGUAGE. These are not invented
// "error-looking" strings: the first is the one off the live board, the
// second and third are what `requests` and `urllib3` raise against the
// endpoints this backend actually calls, and the fourth is the shape
// `src/picker/board.py:782` composes (`f"{type(exc).__name__}: {exc}"`).

const KALSHI_429 =
  "429 Client Error: Too Many Requests for url: "
  + "https://api.elections.kalshi.com/trade-api/v2/markets"
  + "?series_ticker=KXLALIGAGAME&status=open&limit=200";

const ESPN_404 =
  "requests.exceptions.HTTPError: 404 Client Error: Not Found for url: "
  + "https://site.api.espn.com/apis/site/v2/sports/soccer/"
  + "uefa.champions/scoreboard?dates=20261215";

const POOL_TIMEOUT =
  "HTTPSConnectionPool(host='api.elections.kalshi.com', port=443): "
  + "Max retries exceeded with url: /trade-api/v2/markets "
  + "(Caused by ReadTimeoutError(\"Read timed out.\"))";

const MEMBER_FAIL = "HTTPError: 503 Server Error: Service Unavailable "
  + "for url: https://site.api.espn.com/apis/site/v2/sports/soccer/"
  + "ned.1/standings";

// ── the payloads ────────────────────────────────────────────────────

const json = (b: unknown, status = 200) => ({
  status, contentType: "application/json", body: JSON.stringify(b),
});
const inHours = (h: number) =>
  new Date(Date.UTC(2026, 11, 15, 8, 0, 0) + h * 3_600_000).toISOString();

const MEMBERS = ["epl", "laliga", "eredivisie", "ligue1"];

const w = (a: number, b: number) => ({ home: a, away: b, min: Math.min(a, b),
  k: 10, constant: null, basis: { home: "blend", away: "blend" } });

const ROW = {
  refused: false, league: "ucl", espn: "uefa.champions", fav_side: "home",
  resolution: {}, src: "current", kalshi: null, reg_time_note: null,
  gp_current: { home: 6, away: 6, min: 6 }, weights: w(0.375, 0.375),
  home: "Arsenal", away: "Feyenoord", favourite: "Arsenal",
  opponent: "Feyenoord", ppg_gap: null, gdg_gap: null, rank_gap: null,
  cross_league: true, gap_note: "CROSS-LEAGUE FIXTURE — gaps withheld.",
  rated_in: { home: "epl", away: "eredivisie" },
  ranks: { fav: 1, opp: 6 },
  tiers: { ovr: [1, 2], atk: [1, 2], def: [1, 2] },
  tier_gaps: { ovr: 1, atk: 1, def: 1 }, shape: "CLEAN",
  rates: { ppg: [2.39, 1.81], gf: [2.1, 1.5], ga: [0.4, 0.7],
           gdg: [1.72, 0.78] },
  event_id: "u1", competition_id: "u1", kickoff: inHours(8),
};

const UCL_META = {
  src: "current", min_current_gp: 4, clubs: 104, kind: "cup",
  rated_on: MEMBERS, reg_time_note: null,
};

const board = (over: Record<string, unknown> = {}) => ({
  generated_at: new Date().toISOString(), date: "20261215", days: 7,
  leagues: { ucl: { ...UCL_META, ...over } },
  rows: [ROW], refusals: [],
});

const REVIEW = {
  generated_at: new Date().toISOString(), date: "20261215", back: 7,
  window: { from: "20261208", to: "20261215" },
  store: { backend: "memory", writable: true },
  narrowed_to: ["ucl"], leagues: {}, finished: [], refusals: [],
};

type Page = import("@playwright/test").Page;

/** Open the Champions League board with everything mocked. EVERY route
 *  the page touches, so nothing here silently reaches production: the
 *  board, the review, the field, the comp rail's fixture peek and the
 *  watched strip. The last two are aborted rather than answered — this
 *  file makes no claim about either surface, and an invented payload for
 *  a contract another agent is changing would rot on their next ship. */
async function open(page: Page, opts: {
  board?: unknown; boardStatus?: number;
  review?: unknown; reviewStatus?: number;
  ratings?: unknown; ratingsStatus?: number;
} = {}) {
  await page.route("**/api/picker/board**",
    (r) => r.fulfill(json(opts.board ?? board(), opts.boardStatus ?? 200)));
  await page.route("**/api/picker/review**",
    (r) => r.fulfill(json(opts.review ?? REVIEW, opts.reviewStatus ?? 200)));
  await page.route("**/api/comp/*/ratings**", (r) => r.fulfill(
    json(opts.ratings ?? { competition: "ucl", display: "UEFA Champions League",
      axes: null, why_not: "nobody has measured it" },
    opts.ratingsStatus ?? 200)));
  await page.route("**/api/comp/*/fixtures**", (r) => r.abort());
  await page.route("**/api/bet-suggester/**", (r) => r.abort());
  await page.goto("/bet-suggester/ucl");
}

const column = (page: Page) =>
  page.locator('[data-testid="league-col"][data-league="ucl"]');

/** The column's whole rendered text INCLUDING the notes panel, which is
 *  behind a button and is where the field's failure lands. `textContent`
 *  rather than `innerText`, for the slug guard's reason: chips are
 *  styled uppercase and the transform would mask a lower-case host. */
async function columnText(page: Page): Promise<string> {
  const opener = column(page).getByTestId("col-notes-open");
  // the click PINS the panel and a second one un-pins it, so a caller
  // that opened it already must not be undone by this helper
  if (await opener.count() > 0
      && await page.getByTestId("col-notes").count() === 0) {
    await opener.click();
    await expect(page.getByTestId("col-notes")).toBeVisible();
  }
  return (await column(page).textContent()) ?? "";
}

/** The finished tail is COLLAPSED until asked for (operator,
 *  2026-09-07), and its two failure boxes live inside it. */
async function openTail(page: Page) {
  await column(page).getByTestId("review-toggle").click();
}

// ── 1. THE DEFECT ITSELF ────────────────────────────────────────────

test("a Kalshi failure names the book and the status, and publishes "
   + "neither the endpoint nor the exception", async ({ page }) => {
    await open(page, { board: board({ kalshi_error: KALSHI_429 }) });
    const note = column(page).getByTestId("col-kalshi-error");
    await expect(note).toBeVisible();

    // THE ABSENCE IS NAMED. Not hidden, not softened: the provider by
    // name, the reason in words, and the status — which is a fact, and
    // the one piece of the machine string a reader can act on.
    await expect(note).toContainText(/kalshi/i);
    await expect(note).toContainText("429");
    await expect(note).toContainText(/could not be read/i);
    // and the rows are untouched — prices are annotation here
    await expect(column(page).getByTestId("picker-row")).toHaveCount(1);

    // AND NONE OF THE MACHINE TEXT SURVIVED.
    assertNoMachineText("the Kalshi note", (await note.textContent()) ?? "");
    assertNoMachineText("the La Liga-shaped column", await columnText(page));
  });

// ── 2. EVERY OTHER PLACE THE SAME STRING CAN LAND ───────────────────

test("a member table's failure is named without its endpoint, and the "
   + "column's spec does not shrink", async ({ page }) => {
    await open(page, { board: board({
      rated_on_built: MEMBERS.filter((s) => s !== "eredivisie"),
      member_errors: { eredivisie: MEMBER_FAIL },
    }) });
    const block = column(page).getByTestId("col-member-errors");
    // the count and the status both still reach the reader
    await expect(block).toContainText("1 of 4 member tables did not load");
    await expect(block).toContainText("503");
    assertNoMachineText("the member-failure block",
                        (await block.textContent()) ?? "");
    assertNoMachineText("the cup column", await columnText(page));
  });

test("a whole league that failed is named without its endpoint",
  async ({ page }) => {
    await open(page, { board: {
      ...board(), rows: [],
      leagues: { ucl: { src: null, min_current_gp: null, clubs: 0,
        kind: "cup", error: ESPN_404 } },
    } });
    const box = column(page).getByTestId("col-error");
    await expect(box).toBeVisible();
    await expect(box).toContainText("404");
    await expect(box).toContainText("contributes no fixtures");
    assertNoMachineText("the failed-league box",
                        (await box.textContent()) ?? "");
    assertNoMachineText("the failed column", await columnText(page));
  });

test("a failed FIELD read is named in the column's notes without its "
   + "endpoint", async ({ page }) => {
    await open(page, {
      ratings: { detail: POOL_TIMEOUT }, ratingsStatus: 503,
    });
    await column(page).getByTestId("col-notes-open").click();
    const note = page.getByTestId("field-error-note");
    await expect(note).toBeVisible();
    // the absence is still named, in words
    await expect(note).toContainText(/no answer in time|could not be reached/);
    assertNoMachineText("the field-failure note",
                        (await note.textContent()) ?? "");
    assertNoMachineText("the column with a dead field", await columnText(page));
  });

test("the whole board failing renders a sentence, not the backend's "
   + "exception", async ({ page }) => {
    await open(page, { board: { detail: ESPN_404 }, boardStatus: 503 });
    const box = page.getByTestId("board-error");
    await expect(box).toBeVisible();
    await expect(box).toContainText("the board could not be built");
    await expect(box).toContainText("404");
    assertNoMachineText("the board-error box", (await box.textContent()) ?? "");
  });

test("a league whose finished tail failed is named without its endpoint",
  async ({ page }) => {
    await open(page, { review: { ...REVIEW, leagues: { ucl: {
      finished: 0, captured: 0, reconstructed: 0, unavailable: 0,
      kind: "cup", error: ESPN_404,
    } } } });
    await openTail(page);
    const tail = column(page).getByTestId("review-league-error");
    await expect(tail).toBeVisible();
    await expect(tail).toContainText("404");
    await expect(tail).toContainText("costs this tail");
    assertNoMachineText("the tail's league-failure box",
                        (await tail.textContent()) ?? "");
  });

test("a failed review under every column renders a sentence", async ({ page }) => {
    await open(page, { review: { detail: POOL_TIMEOUT }, reviewStatus: 503 });
    await openTail(page);
    const box = column(page).getByTestId("review-error");
    await expect(box).toBeVisible();
    await expect(box).toContainText("could not be loaded");
    assertNoMachineText("the review-failure box",
                        (await box.textContent()) ?? "");
  });

// ── 3. THE CONTROL, AND THE OPERATOR'S COPY ─────────────────────────

test("the backend's own sentence is still carried word for word — this "
   + "screens machine text, it does not flatten every message",
  async ({ page }) => {
    /* THE HALF OF THE CONTRACT A BLANKET REPLACEMENT WOULD BREAK. "field
       unavailable" tells a reader something "the read failed" does not,
       and `field-on-the-card.spec.ts` pins exactly that. A named 503 is
       prose; only the machine text around it is refused. */
    await open(page, {
      board: board({ kalshi_error: "kalshi markets fetch failed" }),
      ratings: { detail: "field unavailable" }, ratingsStatus: 503,
    });
    await expect(column(page).getByTestId("col-kalshi-error"))
      .toContainText("kalshi markets fetch failed");
    await column(page).getByTestId("col-notes-open").click();
    await expect(page.getByTestId("field-error-note"))
      .toContainText("field unavailable");
  });

test("the raw string is not thrown away — it goes to the console, where "
   + "an operator looks and a reader does not", async ({ page }) => {
    /* "Do not print the endpoint" is not "lose the endpoint". Which URL
       and which parameters is exactly what the operator needs when a
       column goes quiet, so it goes where `ErrorBoundary` already sends
       the error it catches. */
    const warnings: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "warning") warnings.push(m.text());
    });
    await open(page, { board: board({ kalshi_error: KALSHI_429 }) });
    await expect(column(page).getByTestId("col-kalshi-error")).toBeVisible();
    await expect.poll(() => warnings.some((w) => w.includes(KALSHI_429)),
      { message: "the provider's own string reached neither the page nor "
        + "the console — it was simply lost" }).toBe(true);
  });

test("a healthy column says none of this at all — the control",
  async ({ page }) => {
    await open(page);
    await expect(column(page).getByTestId("col-kalshi-error")).toHaveCount(0);
    await expect(column(page).getByTestId("col-error")).toHaveCount(0);
    await expect(column(page).getByTestId("col-member-errors")).toHaveCount(0);
    await expect(column(page).getByTestId("picker-row")).toHaveCount(1);
    assertNoMachineText("a healthy column", await columnText(page));
  });
