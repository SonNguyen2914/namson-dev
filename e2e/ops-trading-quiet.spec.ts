import { expect, test, type Page } from "@playwright/test";
import { hydrated, view } from "./operator-console";
import {
  qaBook, qaCandidateRows, qaCandidates, qaLedger, qaStatusWarning, qaStatusWithCareful,
} from "./console-fixtures";
import { reasonTag, safetyTriggers } from "../src/lib/consoleModel";

// THE QUIET PASS (2026-10-07): labels are one to three words, and the
// sentence that explains each one moved behind an ⓘ (a real button whose
// aria-describedby names the tooltip, shown on hover, focus and TAP) or
// into the inspector. Nothing was deleted — so this checks that the long
// words are still REACHABLE, by the routes a person uses, not merely that
// they are somewhere in the DOM:
//
//   - the Today tile's meaning, by tapping its ⓘ;
//   - a reason tag's full sentence and raw code, in the inspector;
//   - the kill how-to, from the rail's Controls menu while all is normal,
//     and from the unfolded Safety panel while a kill holds — where the
//     lift control must be on screen, and never says "resume".

const TOKEN = "ops-quiet-token-typed-by-a-person";
const json = (status: number, body: unknown) => ({ status, contentType: "application/json", body: JSON.stringify(body) });

async function open(page: Page, o: { status?: unknown; hash?: string; cand?: unknown } = {}) {
  await page.route("**/api/ops/trading-status", (r) => r.fulfill(json(200, o.status ?? qaStatusWithCareful())));
  await page.route("**/api/ops/trading-book", (r) => r.fulfill(json(200, qaBook())));
  await page.route("**/api/ops/trading-candidates", (r) => r.fulfill(json(200, o.cand ?? qaCandidates())));
  await page.route("**/api/ops/trading-ledger**", (r) => r.fulfill(json(200, qaLedger())));
  await page.goto(`/ops/trading${o.hash ?? ""}`);
  await hydrated(page);
  await page.locator("#watch-token").fill(TOKEN);
  await expect(page.getByTestId("ops-console")).toBeVisible();
}

/** the tooltip an ⓘ button describes itself with */
const tipOf = (page: Page, btn: ReturnType<Page["locator"]>) =>
  btn.getAttribute("aria-describedby").then((id) => page.locator(`[id="${id}"]`));

test.describe("the quiet pass keeps every long word one tap away", () => {
  test("the Today tile: a one-word label, its meaning behind a tappable ⓘ", async ({ page }) => {
    await open(page);
    const tile = page.getByTestId("cap-today");
    await expect(tile).toContainText("Today");
    await expect(tile).toContainText("−$0.63");
    const btn = tile.getByRole("button", { name: "About Today" });
    const tip = await tipOf(page, btn);
    await expect(tip).toBeHidden();
    await expect(tip).toHaveAttribute("role", "tooltip");
    await btn.click();   // a tap: no hover needed
    await expect(tip).toBeVisible();
    await expect(tip).toContainText("The day's loss as the daily halt measures it");
    await page.keyboard.press("Escape");
    await expect(tip).toBeHidden();
    // and keyboard focus alone shows it too
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(btn).toBeFocused();
    await expect(tip).toBeVisible();
  });

  test("a reason tag in the grid, its sentence and raw code in the inspector", async ({ page }) => {
    await open(page, { hash: "#trading" });
    const row = page.locator('[data-testid="cand-row"]').filter({
      has: page.locator('[data-testid="cand-reason-tag"][data-code="no_edge"]') }).first();
    const tag = row.getByTestId("cand-reason-tag");
    await expect(tag).toHaveText(reasonTag("no_edge"));
    await expect(tag).toHaveText("no edge");
    await row.click();
    const reason = page.getByTestId("insp-reason");
    await expect(reason).toBeVisible();
    await expect(reason).toContainText("Neither side clears the bar");
    await expect(reason).toContainText("no_edge");
  });

  test("the careful score: out of 3 on the in-play ladder with its signals, out of 5 pre-match (#112)", async ({ page }) => {
    const rows = qaCandidateRows();
    const ladder = { score: 2, score_of: 3, signals: ["deep", "fresh"], size: "1", ground: "inplay_buying", data_error: false };
    const pre = { score: 4, size: "2", ground: "family:GAME", data_error: false };
    rows[0] = { ...rows[0], careful: ladder };
    rows[1] = { ...rows[1], careful: pre };
    await open(page, { hash: "#trading", cand: qaCandidates({ rows }) });
    const inplay = page.locator(`[data-testid="cand-row"][data-ticker="${rows[0].ticker}"]`);
    // the grid: short
    await expect(inplay.getByTestId("careful-score")).toHaveText("2/3");
    await expect(inplay.getByTestId("careful-signals")).toContainText("deep fresh");
    await expect(inplay.getByTestId("cand-careful-tag")).toHaveAttribute("title", /in-play ladder.*signals: deep, fresh.*\$1.*inplay_buying/);
    const prem = page.locator(`[data-testid="cand-row"][data-ticker="${rows[1].ticker}"]`);
    await expect(prem.getByTestId("careful-score")).toHaveText("4/5");
    await expect(prem.getByTestId("careful-signals")).toHaveCount(0);
    // the inspector: the words
    await inplay.click();
    await expect(page.getByTestId("insp-careful-score")).toContainText("2/3 (the in-play three-point ladder)");
    await expect(page.getByTestId("insp-careful-signals")).toContainText("deep, fresh");
  });

  test("all normal: no Safety panel; the kill how-to and the lift are in the rail's Controls", async ({ page }) => {
    await open(page);
    await expect(page.getByTestId("ops-safety")).toHaveCount(0);
    const menu = page.getByTestId("rail-controls");
    await menu.locator("summary").click();
    await expect(menu.getByRole("button", { name: "Lift operator kill" })).toBeVisible();
    const how = menu.getByTestId("ops-stop-info-btn");
    await how.click();
    const tip = await tipOf(page, how);
    await expect(tip).toBeVisible();
    await expect(tip).toContainText("TRADING_KILL=true");
    await expect(tip).toContainText("delete the agent's Kalshi API key");
    await expect(tip).toContainText("It cannot lift TRADING_KILL on Railway.");
    await expect(menu).not.toContainText(/resume/i);
  });

  test("a kill unfolds Safety & control, says why, and keeps the lift on screen", async ({ page }) => {
    await open(page, { status: qaStatusWarning() });
    const safety = page.getByTestId("ops-safety");
    await expect(safety).toBeVisible();
    await expect(page.getByTestId("safety-why")).toContainText("kill on");
    await expect(page.getByTestId("safety-kill")).toHaveAttribute("data-state", "bad");
    await expect(page.getByTestId("safety-trading")).toContainText("Blocked");
    // the lift is ON SCREEN, not in a menu, while a kill holds
    await expect(safety.getByRole("button", { name: "Lift operator kill" })).toBeVisible();
    // one lift control on the page: the rail's menu steps aside
    await expect(page.getByTestId("rail-controls")).toHaveCount(0);
    const how = safety.getByTestId("ops-stop-info-btn");
    await how.click();
    await expect(await tipOf(page, how)).toContainText("TRADING_KILL=true");
    const lift = safety.getByTestId("kill-lift-info-btn");
    await lift.click();
    await expect(await tipOf(page, lift)).toContainText(
      "Re-enables trading only if backend TRADING_KILL is not active");
    await expect(page.getByTestId("ops-console")).not.toContainText(/\bresume\b/i);
    // on another view the panel is not drawn, so the rail carries the lift
    await view(page, "#trading");
    await page.getByTestId("rail-controls").locator("summary").click();
    await expect(page.getByTestId("rail-controls").getByRole("button", { name: "Lift operator kill" })).toBeVisible();
  });

  test("every unfolding condition, and only those, opens the panel", () => {
    const base = qaStatusWithCareful() as Record<string, unknown>;
    const now = Date.now();
    const t = (d: Record<string, unknown>, o: Partial<Parameters<typeof safetyTriggers>[1]> = {}) =>
      safetyTriggers(d, { now, statusFailed: false, statusStale: false, readsFailed: [], ...o });
    expect(t(base)).toEqual([]);
    expect(t({ ...base, kill: true })).toEqual(["kill on"]);
    expect(t({ ...base, halt: { active: true, reason: "daily_loss" } })).toEqual(["halt hit"]);
    expect(t({ ...base, drawdown: { used: "20", limit: "25" } })).toEqual(["drawdown ≥ 80%"]);
    expect(t({ ...base, daily_budget: { used: "16", limit: "20", remaining: "4" } })).toEqual(["budget ≥ 80%"]);
    expect(t({ ...base, last_tick: { at: new Date(now - 5 * 60_000).toISOString() } })).toEqual(["agent not ticking"]);
    expect(t(base, { readsFailed: ["book"] })).toEqual(["book read failing"]);
    expect(t(base, { statusFailed: true })).toEqual(["status read failing"]);
    // a field the backend did not send is not normal
    const { kill: _k, ...noKill } = base;
    void _k;
    expect(t(noKill)).toEqual(["kill not stated"]);
  });
});
