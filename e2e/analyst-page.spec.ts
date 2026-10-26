import { expect, test, type Page } from "@playwright/test";
import { analystOn, askFor, hermetic, json, previewFor } from "./analyst-fixtures";

// /bet-suggester/var (Trivela VAR): the league picker, the three saved demo matches,
// the panel, Ask and "How it works". Hermetic: previews and answers are the
// Analyst pipeline's own output with the mock model; the live fixture
// lists are refused by name (the demo matches never need them).

const SLUGS = ["arsenal-everton", "montreal-nashville", "rayo-elche"];

async function open(page: Page, ask?: (body: Record<string, unknown>) => { status: number; body: unknown }) {
  const previews = Object.fromEntries(await Promise.all(SLUGS.map(async (s) => [s, await previewFor(s)])));
  const asked: string[] = [];
  await hermetic(page);
  await analystOn(page);
  await page.route("**/api/analyst/preview**", (r) => {
    const demo = new URL(r.request().url()).searchParams.get("demo") ?? "";
    asked.push(demo);
    return r.fulfill(previews[demo] ? json(previews[demo]) : json({ error: "unknown demo match" }, 400));
  });
  if (ask) {
    await page.route("**/api/analyst/ask", (r) => {
      const a = ask(r.request().postDataJSON());
      return r.fulfill(json(a.body, a.status));
    });
  }
  await page.goto("/bet-suggester/var");
  return asked;
}

test("picker, demo match, panel and Ask", async ({ page }) => {
  const answer = await askFor("rayo-elche");
  let sent: Record<string, unknown> | null = null;
  const asked = await open(page, (b) => { sent = b; return { status: 200, body: answer }; });
  // the first demo match opens by itself, its panel expanded
  await expect(page.getByTestId("analyst-match")).toHaveText("Arsenal vs Everton");
  await expect(page.getByTestId("analyst-panel")).toHaveAttribute("data-state", "preview");
  await expect(page.getByTestId("analyst-body")).toBeVisible();
  // the name (Trivela VAR, 2026-10-25): title, heading, expansion, tagline
  await expect(page).toHaveTitle("Trivela VAR · namson.dev");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Trivela VAR");
  await expect(page.getByTestId("var-expansion")).toHaveText("Verified Analyst Read");
  await expect(page.getByTestId("var-tagline")).toHaveText("Every number goes to VAR.");
  const askBox = page.getByTestId("ask-analyst");
  await expect(askBox).toContainText("Ask VAR");
  await expect(askBox.getByLabel("Your question about this match")).toHaveAttribute("placeholder", "Ask VAR about this match…");
  // the picker: four leagues and the demo set
  for (const t of ["Demo", "Premier League", "La Liga", "MLS", "Liga MX"]) {
    await expect(page.getByRole("group", { name: "League" }).getByRole("button", { name: t })).toBeVisible();
  }
  await expect(page.getByTestId("analyst-matches").getByRole("button")).toHaveCount(3);
  await page.getByRole("button", { name: /Rayo Vallecano vs Elche/ }).click();
  await expect(page.getByTestId("analyst-match")).toHaveText("Rayo Vallecano vs Elche");
  await expect(page.getByTestId("analyst-panel")).toHaveAttribute("data-state", "preview");
  expect(asked).toContain("rayo-elche");
  // Ask, and a verified answer
  await page.getByLabel("Your question about this match").fill("How likely is a draw?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();
  await expect(page.getByTestId("ask-answer")).toContainText("a real chance");
  await expect(page.getByTestId("ask-answer").getByTestId("analyst-fact")).toHaveAttribute("title", /^VAR-checked: Draw probability · Trivela model/);
  expect(sent).toMatchObject({ demo: "rayo-elche", question: "How likely is a draw?" });
  // a league with no reachable schedule says so, and the demos still work
  await page.getByRole("group", { name: "League" }).getByRole("button", { name: "MLS" }).click();
  await expect(page.getByTestId("analyst-matches")).toContainText("Could not list upcoming matches");
});

test("at the cap, Ask shows the friendly message from the 429", async ({ page }) => {
  await open(page, () => ({ status: 429, body: { error: "You've asked VAR a lot this hour. Try again in a little while." } }));
  await expect(page.getByTestId("analyst-panel")).toHaveAttribute("data-state", "preview");
  await page.getByRole("button", { name: "How likely is a draw?" }).click();
  await expect(page.getByTestId("ask-cap")).toHaveText("You've asked VAR a lot this hour. Try again in a little while.");
  await expect(page.getByTestId("ask-answer")).toHaveCount(0);
});

test("How it works opens on the fact sheet, the attempts and the prompt", async ({ page }) => {
  await open(page);
  await expect(page.getByTestId("analyst-panel")).toHaveAttribute("data-state", "preview");
  const how = page.getByTestId("how-it-works");
  await how.locator("summary").click();
  await expect(how).toContainText("Verification ladder");
  await expect(how).toContainText("Attempt 1: all numbers verified");
  await expect(how.locator("table tbody tr").first()).toContainText("Arsenal win probability");
  await expect(how).toContainText("System prompt sent to the model");
  await expect(how.locator("pre").last()).toContainText("FACT SHEET (Source A)");
});

test("switched off, the page says so and reads nothing else", async ({ page }) => {
  const asked: string[] = [];
  await hermetic(page);
  await analystOn(page, false);
  await page.route("**/api/analyst/preview**", (r) => { asked.push(r.request().url()); return r.fulfill(json({})); });
  await page.goto("/bet-suggester/var");
  await expect(page.getByTestId("analyst-off")).toContainText("switched off");
  await expect(page.getByTestId("analyst-panel")).toHaveCount(0);
  expect(asked).toEqual([]);
});

test("the board's top bar links to VAR while it is switched on", async ({ page }) => {
  await hermetic(page);
  await analystOn(page);
  await page.goto("/bet-suggester");
  const chip = page.getByRole("link", { name: "VAR", exact: true });
  await expect(chip).toHaveAttribute("href", "/bet-suggester/var");
  await expect(page.getByRole("link", { name: "Analyst", exact: true })).toHaveCount(0);
});
