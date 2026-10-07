import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hydrated, view } from "./operator-console";
import { at, qaBook, qaCandidates, qaLedger, qaStatusWithCareful } from "./console-fixtures";
import { describeEmergency } from "../src/components/console/Emergency";
import { OPERATOR_WRITE_PATHS, parseMinutesBody } from "../src/lib/operatorRelay";

// KILL AND HALT (Son, 2026-10-07). What the two red buttons promise, each
// checked here, hermetic (every POST is page.route'd; the proxy's own
// refusals are asked of the real route):
//
//   - TWO PRESSES IN THE PAGE: one press sends nothing and arms a five-
//     second "Confirm KILL · 5"; a second press inside it sends; after it,
//     the button disarms. Keyboard works the same.
//   - the body is `{minutes}`: 60, the minutes to the trading day's end, or
//     1440 — checked and rebuilt by the proxy, 1..1440 only;
//   - a backend without the halt says so and HALT stays disabled — never a
//     silent no-op; no token is refused by the proxy before any backend;
//   - after a send the status bar says KILL / HALT ACTIVE in red with its
//     time; the halt gets its lift, the kill keeps its ONE lift;
//   - no word says "resume", and both say they cannot override TRADING_KILL.

const TOKEN = "ops-emergency-token-typed-by-a-person";
const json = (status: number, body: unknown) => ({ status, contentType: "application/json", body: JSON.stringify(body) });
type Obj = Record<string, unknown>;
const HALT_SERVED = { operator_halt: { until: null, set_at: null } };

async function open(page: Page, status: () => Obj, o: { fakeClock?: boolean; hash?: string } = {}) {
  await page.route("**/api/ops/trading-status", (r) => r.fulfill(json(200, status())));
  await page.route("**/api/ops/trading-book", (r) => r.fulfill(json(200, qaBook())));
  await page.route("**/api/ops/trading-candidates", (r) => r.fulfill(json(200, qaCandidates())));
  await page.route("**/api/ops/trading-ledger**", (r) => r.fulfill(json(200, qaLedger())));
  page.on("dialog", (d) => { throw new Error(`a dialog opened: ${d.message()}`); });
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
}
/** every POST to one emergency route, answered with `answer` */
async function capture(page: Page, route: string, answer: () => { status: number; body: unknown }) {
  const sent: { body: unknown; token: string | undefined }[] = [];
  await page.route(`**/api/ops/${route}`, async (r) => {
    const req = r.request();
    sent.push({ body: req.postDataJSON(), token: req.headers()["x-admin-token"] });
    const a = answer();
    await r.fulfill(json(a.status, a.body));
  });
  return sent;
}
async function controls(page: Page) {
  await page.getByTestId("rail-controls").locator("summary").click();
  return page.getByTestId("rail-controls");
}

test.describe("KILL and HALT", () => {
  test("one press sends nothing; a second within 5 s sends {minutes:60} with the token; the answer is said", async ({ page }) => {
    await page.clock.install();
    await open(page, () => qaStatusWithCareful(HALT_SERVED), { fakeClock: true });
    const sent = await capture(page, "trading-kill", () => ({ status: 200, body: { killed: true, kill_until: at(60) } }));
    const menu = await controls(page);
    const kill = menu.getByTestId("emergency-kill");
    await expect(kill).toHaveText("KILL");
    await kill.click();
    await expect(kill).toHaveText("Confirm KILL · 5");
    await page.clock.runFor(1_100);
    await expect(kill).toHaveText("Confirm KILL · 4");
    expect(sent).toEqual([]);                          // the first press sends nothing
    await kill.click();
    await expect(menu.getByTestId("emergency-result")).toContainText("KILL set — until");
    await expect(menu.getByTestId("emergency-result")).toHaveAttribute("data-ok", "true");
    expect(sent).toEqual([{ body: { minutes: 60 }, token: TOKEN }]);
  });

  test("after five seconds the button disarms and nothing was sent", async ({ page }) => {
    await page.clock.install();
    await open(page, () => qaStatusWithCareful(HALT_SERVED), { fakeClock: true });
    const sent = await capture(page, "trading-halt", () => ({ status: 200, body: {} }));
    const menu = await controls(page);
    const halt = menu.getByTestId("emergency-halt");
    await halt.click();
    await expect(halt).toHaveText("Confirm HALT · 5");
    await page.clock.runFor(5_300);
    await expect(halt).toHaveText("HALT");
    await expect(halt).not.toHaveAttribute("data-armed", /./);
    // a press now ARMS again — it does not send
    await halt.click();
    await expect(halt).toHaveText(/^Confirm HALT · \d$/);
    expect(sent).toEqual([]);
  });

  test("the duration: until the end of the trading day, and 24 hours", async ({ page }) => {
    await open(page, () => qaStatusWithCareful(HALT_SERVED));
    const sent = await capture(page, "trading-halt", () => ({ status: 200, body: { until: at(840) } }));
    const menu = await controls(page);
    await menu.getByTestId("emergency-dur-today").click();
    await expect(menu.getByTestId("emergency-dur-today")).toHaveAttribute("data-checked", "true");
    await menu.getByTestId("emergency-halt").click();
    await menu.getByTestId("emergency-halt").click();
    await expect(menu.getByTestId("emergency-result")).toContainText("HALT set — until");
    const m = (sent[0].body as { minutes: number }).minutes;
    // the fixture's trading day ends 840 minutes after it was built
    expect(m).toBeGreaterThanOrEqual(835);
    expect(m).toBeLessThanOrEqual(841);
    await menu.getByTestId("emergency-dur-day").click();
    await menu.getByTestId("emergency-halt").click();
    await menu.getByTestId("emergency-halt").click();
    await expect.poll(() => sent.length).toBe(2);
    expect(sent[1].body).toEqual({ minutes: 1440 });
  });

  test("a backend without the halt: HALT disabled and said; a 404 on the POST disables it too", async ({ page }) => {
    // no operator_halt in the status: this backend has no halt
    await open(page, () => qaStatusWithCareful());
    let menu = await controls(page);
    await expect(menu.getByTestId("emergency-halt")).toBeDisabled();
    await expect(menu.getByTestId("emergency-halt-note")).toHaveText("◆ HALT not on this backend yet");
    await expect(menu.getByTestId("emergency-kill")).toBeEnabled();

    // a status that names it, a route that is not there yet
    await page.unrouteAll({ behavior: "ignoreErrors" });
    await open(page, () => qaStatusWithCareful(HALT_SERVED));
    await capture(page, "trading-halt", () => ({ status: 404, body: { available: false } }));
    menu = await controls(page);
    const halt = menu.getByTestId("emergency-halt");
    await halt.click();
    await halt.click();
    await expect(menu.getByTestId("emergency-result")).toHaveText("HALT is not on this backend yet — nothing was set.");
    await expect(menu.getByTestId("emergency-result")).toHaveAttribute("data-ok", "false");
    await expect(halt).toBeDisabled();
  });

  test("a halt in force: the rail says HALT ACTIVE in red with its time, Safety unfolds, and its lift lifts", async ({ page }) => {
    let lifted = false;
    await open(page, () => qaStatusWithCareful({ operator_halt: lifted ? { until: null, set_at: null }
      : { until: at(55), set_at: at(-5) } }));
    const lifts = await capture(page, "trading-halt-lift", () => { lifted = true; return { status: 200, body: { lifted: true } }; });
    const pill = page.getByTestId("rail-halt");
    await expect(pill).toContainText(/ACTIVE · until \d{2}:\d{2}/);
    await expect(pill).toHaveAttribute("data-state", "bad");
    await expect(page.getByTestId("rail-trading")).toContainText("HALTED");
    const safety = page.getByTestId("ops-safety");
    await expect(page.getByTestId("safety-why")).toContainText("operator halt");
    await expect(page.getByTestId("safety-trading")).toContainText("Buys halted");
    await expect(safety.getByTestId("emergency-halt-active")).toContainText("HALT ACTIVE · until");
    // the kill keeps its ONE lift; the halt has its own
    await expect(page.getByRole("button", { name: "Lift operator kill" })).toHaveCount(1);
    await safety.getByTestId("halt-lift").click();
    expect(lifts).toEqual([]);
    await safety.getByTestId("halt-lift-confirm").click();
    expect(lifts).toHaveLength(1);
    // the status is read again: no halt, the panel folds back into the rail,
    // and the answer went with the controls (held above them, never lost)
    await expect(pill).toContainText("NONE");
    await expect(page.getByTestId("ops-safety")).toHaveCount(0);
    const menu = await controls(page);
    await expect(menu.getByTestId("emergency-result")).toContainText("Operator halt lifted");
    await expect(page.getByTestId("ops-console")).not.toContainText(/\bresume\b/i);
  });

  test("a kill in force: KILL ACTIVE in red with its time; one lift for the kill", async ({ page }) => {
    await open(page, () => qaStatusWithCareful({ ...HALT_SERVED, kill: true, kill_until: at(42) }));
    const pill = page.getByTestId("rail-kill");
    await expect(pill).toContainText(/ACTIVE · until \d{2}:\d{2}/);
    await expect(pill).toHaveAttribute("data-state", "bad");
    const safety = page.getByTestId("ops-safety");
    await expect(safety.getByTestId("emergency-kill")).toBeVisible();
    await expect(page.getByRole("button", { name: "Lift operator kill" })).toHaveCount(1);
    await expect(page.getByTestId("rail-controls")).toHaveCount(0);   // one control set on the page
    // both say they cannot override TRADING_KILL, and nothing says resume
    await expect(safety.getByTestId("emergency-info")).toContainText("Neither can lift or override TRADING_KILL");
    await expect(page.getByTestId("ops-console")).not.toContainText(/\bresume\b/i);
    // other views: the rail carries the controls
    await view(page, "#trades");
    await expect(page.getByTestId("rail-controls").getByTestId("emergency-kill")).toHaveCount(1);
  });

  test("keyboard: Enter arms, Enter again sends", async ({ page }) => {
    await open(page, () => qaStatusWithCareful(HALT_SERVED));
    const sent = await capture(page, "trading-kill", () => ({ status: 200, body: { kill_until: at(60) } }));
    const menu = await controls(page);
    const kill = menu.getByTestId("emergency-kill");
    await kill.focus();
    await page.keyboard.press("Enter");
    await expect(kill).toHaveText(/^Confirm KILL · \d$/);
    await page.keyboard.press("Enter");
    await expect(menu.getByTestId("emergency-result")).toContainText("KILL set");
    expect(sent).toHaveLength(1);
  });

  test("the proxy: no token is refused before any backend; the body is 1..1440 minutes only; POST only", async ({ request }) => {
    for (const route of ["trading-kill", "trading-halt", "trading-halt-lift"]) {
      const r = await request.post(`/api/ops/${route}`, { data: { minutes: 60 } });
      expect(r.status(), route).toBe(401);
      expect(await r.json()).toMatchObject({ ok: false, error: "token_missing" });
      expect((await request.get(`/api/ops/${route}`)).status(), route).toBe(405);
    }
    for (const bad of [{ minutes: 0 }, { minutes: 1441 }, { minutes: 1.5 }, { minutes: "60" }, { minutes: 60, extra: 1 }, []]) {
      const r = await request.post("/api/ops/trading-kill", { data: bad, headers: { "x-admin-token": TOKEN } });
      expect(r.status(), JSON.stringify(bad)).toBe(400);
    }
    expect(parseMinutesBody({ minutes: 1440 })).toEqual({ ok: true, payload: { minutes: 1440 } });
    expect(describeEmergency("kill", 401, { error: "token_missing" }).text).toBe("KILL not sent: no operator token.");
    expect(describeEmergency("kill", 403, null).text).toBe("KILL refused: token rejected.");
    for (const s of [200, 404, 401, 403, 500, 504]) {
      expect(describeEmergency("halt", s, { available: false }).text).not.toMatch(/resume/i);
    }
  });

  test("each emergency route posts to one allowlisted backend path", () => {
    const src = (f: string) => readFileSync(join(__dirname, "..", "src", "pages", "api", "ops", f), "utf8");
    expect(src("trading-kill.ts")).toContain("OPERATOR_WRITE_PATHS.kill");
    expect(src("trading-halt.ts")).toContain("OPERATOR_WRITE_PATHS.halt");
    expect(src("trading-halt-lift.ts")).toContain("OPERATOR_WRITE_PATHS.haltLift");
    expect(src("trading-kill-lift.ts")).toContain("OPERATOR_WRITE_PATHS.killLift");
    expect(OPERATOR_WRITE_PATHS).toMatchObject({ kill: "/api/admin/trading/kill",
      halt: "/api/admin/trading/halt", haltLift: "/api/admin/trading/halt/lift" });
  });
});
