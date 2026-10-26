import { expect, test, type Page } from "@playwright/test";
import { EFL_HUB_EVENT, EFL_HUB_PAYLOAD } from "./cup-hubs-recorded";
import {
  analystOn, EPL_EVENT, EPL_PAYLOAD, failedPreviewFor, hermetic, json, previewFor,
} from "./analyst-fixtures";

// THE ANALYST PANEL ON A MATCH HUB: collapsed, under the model's
// win/draw/loss, on the four league planes only and only while the switch
// is on. Hermetic: the match is the saved Arsenal v Everton payload, the
// preview is the Analyst pipeline's own output with the mock model
// (analyst-fixtures.ts), and every other read is refused by name.

async function openEpl(page: Page, preview: unknown, opts: { on?: boolean } = {}) {
  const asked: string[] = [];
  await hermetic(page);
  await page.route("**/api/card/**", (r) => r.fulfill(json({ error: "no live-plane fixture in this recorded world" }, 404)));
  await analystOn(page, opts.on ?? true);
  await page.route("**/api/analyst/preview**", (r) => {
    asked.push(r.request().url());
    return r.fulfill(json(preview));
  });
  await page.route(`**/api/epl/match/${EPL_EVENT}`, (r) => r.fulfill(json(EPL_PAYLOAD)));
  await page.goto(`/bet-suggester/epl/${EPL_EVENT}`);
  await page.waitForSelector("#markets");
  return asked;
}

test("the panel renders on an EPL match, collapsed, under the model's 3-way", async ({ page }) => {
  const asked = await openEpl(page, await previewFor("arsenal-everton"));
  const panel = page.locator("#markets").getByTestId("analyst-panel");
  await expect(panel).toHaveAttribute("data-state", "preview");
  // the read is for THIS match, by league and event id
  expect(asked.some((u) => u.includes("league=epl") && u.includes(`id=${EPL_EVENT}`))).toBe(true);
  // it sits after the model's outcome bar, inside the same card
  const order = await page.locator("#markets").evaluate((m) => {
    const eyebrow = [...m.querySelectorAll("p")].find((p) => /model outcome probabilities/i.test(p.textContent ?? ""));
    const panelEl = m.querySelector('[data-testid="analyst-panel"]');
    return !!eyebrow && !!panelEl && !!(eyebrow.compareDocumentPosition(panelEl) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(order).toBe(true);
  // collapsed: the headline, with its number verified, and nothing else
  await expect(panel.getByTestId("analyst-headline")).toContainText("51%");
  await expect(panel.getByTestId("analyst-body")).toHaveCount(0);
  await panel.getByTestId("analyst-toggle").click();
  const body = panel.getByTestId("analyst-body");
  await expect(body).toContainText(/why/i);
  await expect(body).toContainText(/model vs market/i);
  await expect(panel.getByTestId("analyst-confidence")).toHaveText("medium");
  await expect(panel.getByTestId("analyst-footer")).toContainText("Match prediction and analysis, not betting advice");
  // Trivela VAR (2026-10-25): the name, its expansion and the labels
  await expect(panel).toHaveAttribute("aria-label", "Trivela VAR");
  await expect(panel.getByTestId("analyst-toggle")).toContainText(
    /Trivela VAR\s*· verified analyst read · shadow · not advice/i);
  await expect(panel.getByTestId("analyst-footer")).toContainText("✓ = VAR-checked against Trivela's data");
  const ask = body.getByRole("link", { name: "ask VAR about this match →" });
  await expect(ask).toHaveAttribute("href", `/bet-suggester/var?league=epl&id=${EPL_EVENT}`);
});

test("✓ badges carry their source in a tooltip", async ({ page }) => {
  await openEpl(page, await previewFor("arsenal-everton"));
  const first = page.getByTestId("analyst-panel").getByTestId("analyst-fact").first();
  await expect(first).toHaveText("51%✓");
  await expect(first).toHaveAttribute("title", /^VAR-checked: Arsenal win probability · Trivela model .*\(F1\)$/);
});

test("when the model fails, the panel falls back to Trivela's raw numbers", async ({ page }) => {
  await openEpl(page, await failedPreviewFor("arsenal-everton"));
  const panel = page.getByTestId("analyst-panel");
  await expect(panel).toHaveAttribute("data-state", "fallback");
  await expect(panel.getByTestId("analyst-headline")).toContainText("written read is unavailable");
  // the reason is one short sentence, never a dump
  await expect(panel.getByTestId("analyst-headline")).toContainText("did not answer");
  await panel.getByTestId("analyst-toggle").click();
  const raw = panel.getByTestId("analyst-raw");
  await expect(raw.locator("li")).toHaveCount(8);
  await expect(raw.getByTestId("analyst-fact").first()).toHaveAttribute("title", /^VAR-checked: .* · Trivela model/);
  await expect(raw).toContainText("Arsenal win probability");
});

test("a preview that never answers does not hold the page up", async ({ page }) => {
  await hermetic(page);
  await page.route("**/api/card/**", (r) => r.fulfill(json({ error: "none" }, 404)));
  await analystOn(page);
  await page.route("**/api/analyst/preview**", () => { /* left hanging on purpose */ });
  await page.route(`**/api/epl/match/${EPL_EVENT}`, (r) => r.fulfill(json(EPL_PAYLOAD)));
  await page.goto(`/bet-suggester/epl/${EPL_EVENT}`);
  await expect(page.locator("#markets")).toContainText(/model outcome probabilities/i);
  await expect(page.getByTestId("analyst-panel")).toHaveAttribute("data-state", "loading");
  await expect(page.getByTestId("analyst-headline")).toContainText("VAR is checking Trivela");
});

test("the panel is hidden on a cup match", async ({ page }) => {
  const asked: string[] = [];
  await hermetic(page);
  await page.route("**/api/card/**", (r) => r.fulfill(json({ error: "none" }, 404)));
  await analystOn(page);
  await page.route("**/api/analyst/preview**", (r) => { asked.push(r.request().url()); return r.fulfill(json({})); });
  await page.route(`**/api/comp/eflcup/match/${EFL_HUB_EVENT}`, (r) => r.fulfill(json(EFL_HUB_PAYLOAD)));
  await page.goto(`/bet-suggester/eflcup/${EFL_HUB_EVENT}`);
  await page.waitForSelector("#markets");
  await page.waitForTimeout(800);
  await expect(page.getByTestId("analyst-panel")).toHaveCount(0);
  expect(asked).toEqual([]);
});

test("switched off, the panel draws nothing and asks for nothing", async ({ page }) => {
  const asked = await openEpl(page, {}, { on: false });
  await page.waitForTimeout(800);
  await expect(page.getByTestId("analyst-panel")).toHaveCount(0);
  expect(asked).toEqual([]);
});

test("the kill switch on the server: off, the Analyst routes answer 404", async ({ request }) => {
  const status = await (await request.get("/api/analyst/status")).json();
  test.skip(status.enabled === true, "this server was started with ANALYST_ENABLED=true; the off state cannot be observed");
  expect(status).toEqual({ enabled: false });
  expect((await request.get("/api/analyst/preview?demo=arsenal-everton")).status()).toBe(404);
  expect((await request.post("/api/analyst/ask", { data: { demo: "arsenal-everton", question: "draw?" } })).status()).toBe(404);
});

// REVIEW FINDING 8 (2026-10-25): one failed status read used to be kept
// as "off" for the whole session. A failure is now asked again.
test("a status read that failed is asked again, and the panel comes back", async ({ page }) => {
  let statusCalls = 0;
  await hermetic(page);
  await page.route("**/api/card/**", (r) => r.fulfill(json({ error: "none" }, 404)));
  await page.route("**/api/analyst/status", (r) => {
    statusCalls += 1;
    return statusCalls === 1
      ? r.fulfill(json({ detail: "a dropped read" }, 503))
      : r.fulfill(json({ enabled: true, leagues: ["epl", "laliga", "mls", "ligamx"] }));
  });
  await page.route("**/api/analyst/preview**", async (r) => r.fulfill(json(await previewFor("arsenal-everton"))));
  await page.route(`**/api/epl/match/${EPL_EVENT}`, (r) => r.fulfill(json(EPL_PAYLOAD)));
  await page.goto(`/bet-suggester/epl/${EPL_EVENT}`);
  await page.waitForSelector("#markets");
  await expect(page.getByTestId("analyst-panel")).toHaveAttribute("data-state", "preview", { timeout: 15_000 });
  expect(statusCalls).toBeGreaterThanOrEqual(2);
});
