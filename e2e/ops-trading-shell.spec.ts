import { expect, test, type Page, type Request } from "@playwright/test";
import { hydrated, view } from "./operator-console";
import {
  qaBook, qaCandidates, qaLedger, qaStatus, qaStatusWarning, qaStatusWithCareful,
} from "./console-fixtures";
import {
  attention, decisionBadge, reasonGroup, rankReasons,
} from "../src/lib/consoleModel";
import { describeLift } from "../src/components/TradingKillLift";

// THE REDESIGNED CONSOLE'S SHELL (2026-10-07): an app of views over the
// same four reads. What it promises, each claim checked here, hermetic
// (page.route; e2e/console-fixtures.ts shaped like the backend's routes):
//
//   - the views are a bare hash; the default carries none; a deep link
//     opens its view and its filters; switching views re-reads NOTHING;
//   - a refresh never resets a filter, the search, the sort, an open
//     inspector or the scroll;
//   - decision badges: placed / skipped / not eligible / cooldown / blocked
//     / error, never colour alone, the backend's action kept beside them;
//   - attention aggregates the exceptions, most severe first, and each
//     links into the filtered view;
//   - the kill control never implies it can clear TRADING_KILL and never
//     says "resume".

const TOKEN = "ops-shell-token-typed-by-a-person";
const json = (status: number, body: unknown) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

async function open(page: Page, o: { status?: unknown; hash?: string; fakeClock?: boolean } = {}) {
  const reads: Record<string, Request[]> = { status: [], book: [], cand: [], ledger: [] };
  await page.route("**/api/ops/trading-status", (r) => { reads.status.push(r.request()); return r.fulfill(json(200, o.status ?? qaStatusWithCareful())); });
  await page.route("**/api/ops/trading-book", (r) => { reads.book.push(r.request()); return r.fulfill(json(200, qaBook())); });
  await page.route("**/api/ops/trading-candidates", (r) => { reads.cand.push(r.request()); return r.fulfill(json(200, qaCandidates())); });
  await page.route("**/api/ops/trading-ledger**", (r) => { reads.ledger.push(r.request()); return r.fulfill(json(200, qaLedger())); });
  await page.goto(`/ops/trading${o.hash ?? ""}`);
  await hydrated(page, o.fakeClock);
  await page.locator("#watch-token").fill(TOKEN);
  if (o.fakeClock) {
    await expect.poll(async () => {
      await page.clock.runFor(700);
      return page.getByTestId("ops-console").count();
    }).toBeGreaterThan(0);
  }
  await expect(page.getByTestId("ops-console")).toBeVisible();
  return reads;
}

test.describe("the console's shell", () => {
  test("the rail answers the three-second questions; the default view has no hash; "
    + "switching views re-reads nothing", async ({ page }) => {
      const reads = await open(page);
      const strip = page.getByTestId("ops-strip");
      for (const k of ["trading", "agent", "env", "feed", "inplay", "learning", "tick", "kill", "halt"]) {
        await expect(strip.getByTestId(`rail-${k}`), k).toBeVisible();
      }
      await expect(strip.getByTestId("rail-trading")).toContainText("LIVE");
      await expect(strip.getByTestId("rail-kill")).toContainText("OFF");
      expect(new URL(page.url()).hash).toBe("");
      // SAFETY FOLDS INTO THE RAIL while everything is normal (quiet pass):
      // no panel, and the lift control is in the rail's Controls menu
      await expect(page.getByTestId("ops-safety")).toHaveCount(0);
      await expect(strip.getByTestId("rail-controls")).toBeVisible();
      await expect(strip.getByTestId("kill-lift")).toBeHidden();
      await strip.getByTestId("rail-controls").locator("summary").click();
      await expect(strip.getByRole("button", { name: "Lift operator kill" })).toBeVisible();
      await expect(page.getByTestId("nav-overview")).toHaveAttribute("aria-current", "page");
      await expect.poll(() => reads.ledger.length).toBe(1);
      const before = { book: reads.book.length, cand: reads.cand.length, ledger: reads.ledger.length };
      for (const v of ["trading", "portfolio", "trades", "performance", "model", "system", "overview"]) {
        await page.getByTestId(`nav-${v}`).click();
        await expect(page.getByTestId(`nav-${v}`)).toHaveAttribute("aria-current", "page");
      }
      expect({ book: reads.book.length, cand: reads.cand.length, ledger: reads.ledger.length }).toEqual(before);
    });

  test("a deep link opens its view and its filters", async ({ page }) => {
    await open(page, { hash: "#trading?decision=skipped&comp=epl" });
    await expect(page.getByTestId("ops-candidates")).toBeVisible();
    await expect(page.locator('[data-testid="cand-decision"][data-decision="skipped"]')).toHaveAttribute("aria-pressed", "true");
    for (const r of await page.getByTestId("cand-row").all()) {
      await expect(r).toHaveAttribute("data-badge", "skipped");
      await expect(r).toHaveAttribute("data-competition", "epl");
    }
  });

  test("a refresh keeps the filters, the search, the sort, the open inspector "
    + "and the scroll", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 700 });
      await page.clock.install();
      const reads = await open(page, { hash: "#trading", fakeClock: true });
      await page.getByTestId("cand-search").fill("vs");
      await page.locator('[data-testid="cand-decision"][data-decision="skipped"]').click();
      await page.getByTestId("cand-sort-edge").click();
      const rowsBefore = await page.getByTestId("cand-row").evaluateAll((els) => els.map((e) => e.getAttribute("data-ticker")));
      expect(rowsBefore.length).toBeGreaterThan(1);
      await page.getByTestId("cand-row").nth(1).click();
      const insp = page.getByTestId("cand-inspector");
      await expect(insp).toBeVisible();
      const ticker = await insp.getAttribute("data-ticker");
      await page.evaluate(() => window.scrollTo({ top: 240, behavior: "instant" }));
      await page.clock.runFor(1_000);
      const y = await page.evaluate(() => window.scrollY);
      expect(y).toBeGreaterThan(0);

      const n = reads.cand.length;
      await page.clock.runFor(16_000);
      await expect.poll(() => reads.cand.length, "the candidates are read again").toBeGreaterThan(n);
      await page.clock.runFor(500);

      await expect(page.getByTestId("cand-search")).toHaveValue("vs");
      await expect(page.locator('[data-testid="cand-decision"][data-decision="skipped"]')).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByTestId("cand-sort-edge").locator("xpath=..")).toHaveAttribute("aria-sort", /ascending|descending/);
      await expect(page.getByTestId("cand-inspector")).toHaveAttribute("data-ticker", ticker!);
      expect(await page.getByTestId("cand-row").evaluateAll((els) => els.map((e) => e.getAttribute("data-ticker"))))
        .toEqual(rowsBefore);
      expect(await page.evaluate(() => window.scrollY)).toBe(y);
      // the filters ride in the hash, never the token
      expect(page.url()).toContain("decision=skipped");
      expect(page.url()).not.toContain(TOKEN);
      // Esc closes the inspector; the view stays where it was
      await page.keyboard.press("Escape");
      await expect(page.getByTestId("cand-inspector")).toHaveCount(0);
      await expect(page.getByTestId("ops-candidates")).toBeVisible();
    });

  test("a ledger row's detail stays open across a view switch and back", async ({ page }) => {
    await open(page, { hash: "#trades" });
    const first = page.getByTestId("ledger-row").first();
    const id = await first.getAttribute("data-row-id");
    await first.getByTestId("ledger-expand").click();
    await expect(page.locator(`[data-testid="ledger-grounds"][data-row-id="${id}"]`)).toBeVisible();
    await page.getByTestId("ledger-filter-search").fill("Synthetic");
    await view(page, "#overview");
    await view(page, "#trades");
    await expect(page.getByTestId("ledger-filter-search")).toHaveValue("Synthetic");
    await expect(page.locator(`[data-testid="ledger-grounds"][data-row-id="${id}"]`)).toBeVisible();
  });

  test("why-not-placed ranks reasons and a click filters the candidates to one", async ({ page }) => {
    await open(page, { hash: "#trading" });
    const bars = page.getByTestId("why-bar");
    const codes = await bars.evaluateAll((els) => els.map((e) => e.getAttribute("data-code")));
    expect(codes[0]).toBe("no_edge");
    await page.locator('[data-testid="why-bar"][data-code="no_edge"] button').click();
    await expect(page.getByTestId("cand-reason-chip")).toContainText("no_edge");
    for (const r of await page.getByTestId("cand-row").all()) {
      await expect(r.getByTestId("cand-reason-tag")).toHaveText("no edge");
      await expect(r.getByTestId("cand-reason-tag")).toHaveAttribute("title", /Neither side clears the bar/);
    }
    await page.getByTestId("cand-reason-chip").click();
    await expect(page.getByTestId("cand-reason-chip")).toHaveCount(0);
  });
});

test.describe("decision badges", () => {
  test("the backend's actions map to six states, each with its own tone", () => {
    const b = (action: string, reason: string | null = null) => decisionBadge({ action, reason });
    expect(b("placed")).toMatchObject({ key: "placed", tone: "placed" });
    expect(b("skipped", "no_edge")).toMatchObject({ key: "skipped", tone: "neutral" });
    expect(b("skipped", "inplay_cooldown")).toMatchObject({ key: "cooldown", tone: "caution" });
    expect(b("skipped", "inplay_recent_goal_or_red")).toMatchObject({ key: "cooldown", tone: "caution" });
    expect(b("not_eligible")).toMatchObject({ key: "not_eligible", tone: "muted" });
    expect(b("refused")).toMatchObject({ key: "blocked", tone: "caution" });
    expect(b("not_run")).toMatchObject({ key: "blocked", tone: "caution" });
    expect(b("failed")).toMatchObject({ key: "error", tone: "danger" });
    expect(b("error")).toMatchObject({ key: "error", tone: "danger" });
    // a skip is NEVER a danger, and only errors are
    for (const a of ["placed", "skipped", "not_eligible", "refused", "not_run", "proposed"]) {
      expect(b(a).tone, a).not.toBe("danger");
    }
    expect(b("something_new")).toMatchObject({ key: "unknown" });
  });

  test("in the grid: a word and a shape, the backend's action kept on the row",
    async ({ page }) => {
      await open(page, { hash: "#trading" });
      const byBadge = async (k: string) => page.locator(`[data-testid="cand-row"][data-badge="${k}"]`);
      await expect(await byBadge("blocked")).toHaveAttribute("data-decision", "refused");
      await expect((await byBadge("blocked")).getByTestId("cand-action")).toContainText("Blocked");
      await expect((await byBadge("error")).getByTestId("cand-action")).toContainText("Error");
      await expect((await byBadge("cooldown")).getByTestId("cand-action")).toContainText("Cooldown");
      // the raw code is one interaction away
      await (await byBadge("blocked")).click();
      await expect(page.getByTestId("cand-inspector")).toContainText("per_match_cap");
      await expect(page.getByTestId("cand-inspector")).toContainText("refused");
    });
});

test.describe("attention", () => {
  test("aggregates exceptions most severe first, and missing is not a problem it invents", () => {
    const base = { statusRead: { kind: "ok" as const }, statusAgeMs: null, candidates: null,
      candidatesRead: { kind: "ok" as const }, bookRead: { kind: "ok" as const }, book: null,
      ledgerRead: { kind: "ok" as const }, ledger: null, now: Date.now() };
    const warn = attention({ ...base, status: qaStatusWarning() });
    expect(warn[0]).toMatchObject({ id: "kill", severity: "critical" });
    const ids = warn.map((a) => a.id);
    for (const id of ["feed", "global-cool", "settle-ambiguous", "fills-unreadable", "careful-data",
      "learning-error", "tick-old", "tick-outcome"]) expect(ids, id).toContain(id);
    const sev = warn.map((a) => a.severity);
    expect([...sev].sort((a, b) => ["critical", "warning", "info"].indexOf(a) - ["critical", "warning", "info"].indexOf(b))).toEqual(sev);
    // a normal day: no critical, no warning
    const calm = attention({ ...base, status: qaStatus() });
    expect(calm.filter((a) => a.severity !== "info")).toEqual([]);
    // a read that failed is said, a block that was never sent is not a failure
    const bare = attention({ ...base, status: { kill: false, halt: { active: false }, enabled: true,
      last_tick: { at: new Date().toISOString(), outcome: "traded" } },
      bookRead: { kind: "error", status: 500, detail: "x" } });
    expect(bare.map((a) => a.id)).toEqual(["book-error"]);
  });

  test("reasons group, rank and keep their code", () => {
    expect(reasonGroup("stale_book")).toBe("market");
    expect(reasonGroup("inplay_cooldown")).toBe("inplay");
    expect(reasonGroup("per_match_cap")).toBe("risk");
    expect(reasonGroup("news_since_model")).toBe("news");
    expect(reasonGroup("brand_new_code")).toBe("other");
    const r = rankReasons([{ no_edge: 5, stale_book: 2 }, { no_edge: 1 }]);
    expect(r.map((x) => [x.code, x.n])).toEqual([["no_edge", 6], ["stale_book", 2]]);
  });

  test("the panel leads with what is wrong and links into the view", async ({ page }) => {
    await open(page, { status: qaStatusWarning() });
    const items = page.getByTestId("attention-item");
    await expect(items.first()).toHaveAttribute("data-severity", "critical");
    await expect(items.first()).toContainText("Kill switch active");
    // routine counts are folded, not deleted
    await expect(page.getByTestId("attention-routine")).toBeVisible();
    await page.locator('[data-testid="attention-item"][data-id="cand-errors"] a').click();
    await expect(page.getByTestId("ops-candidates")).toBeVisible();
    await expect(page.locator('[data-testid="cand-decision"][data-decision="error"]')).toHaveAttribute("aria-pressed", "true");
    // the rail says it too, in words and a shape
    await expect(page.getByTestId("rail-trading")).toContainText("KILLED");
    await expect(page.getByTestId("rail-trading")).toHaveAttribute("data-state", "bad");
  });
});

test.describe("the kill control", () => {
  test("its copy never implies it can clear TRADING_KILL, and never says resume",
    async ({ page }) => {
      await open(page, { status: qaStatusWarning() });
      const safety = page.getByTestId("ops-safety");
      await expect(safety).toContainText("Re-enables trading only if backend TRADING_KILL is not active");
      await expect(safety).toContainText("cannot lift TRADING_KILL");
      await expect(safety.getByRole("button", { name: "Lift operator kill" })).toBeVisible();
      await expect(safety).not.toContainText(/resume/i);
      await expect(page.getByTestId("ops-console")).not.toContainText(/\bresume\b/i);
      // the kill's source is not claimed
      await expect(page.getByTestId("safety-kill")).toContainText("TRADING_KILL or an operator kill");
      await expect(page.getByTestId("safety-trading")).toContainText("Blocked");
    });

  test("every answer of the lift is worded without a resume and names TRADING_KILL when it holds", () => {
    const cases = [
      describeLift(200, { lifted: true, kill_until: null }),
      describeLift(200, { lifted: false, kill_until: null }),
      describeLift(200, { lifted: true, kill_until: "2026-10-10T15:00:00+00:00" }),
      describeLift(200, { lifted: true, kill_until: null, env_kill: true }),
      describeLift(404, { available: false }), describeLift(403, null), describeLift(504, null),
    ];
    for (const c of cases) expect(c.text).not.toMatch(/resume/i);
    expect(cases[2]).toMatchObject({ ok: false });
    expect(cases[2].text).toContain("TRADING_KILL");
    expect(cases[3]).toMatchObject({ ok: false });
    expect(cases[3].text).toContain("TRADING_KILL is set");
    expect(cases[0].text).toContain("only where nothing else holds it");
  });
});
