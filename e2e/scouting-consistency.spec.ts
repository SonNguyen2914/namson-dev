import { expect, test } from "@playwright/test";

// The scouting block showed a LOSS as a win (reported Jul 24, 2026):
// ESPN's `score` string is winner-first, so "L 1-0" was really 0-1.
// This asserts the rendered DOM can never contradict itself again:
// every row's W/L/D must agree with the two numbers printed beside it.

const EVENT = process.env.E2E_EVENT_ID || "761690";

test("form + H2H rows: result letter agrees with the scoreline shown",
  async ({ page }) => {
    const resp = await page.request.get(`/api/mls/match/${EVENT}`);
    const body = await resp.json();
    const sc = body.match?.scouting;
    test.skip(!sc, "no scouting section from this backend");

    // API-level invariant across both blocks
    for (const t of sc.last_five ?? []) {
      for (const g of t.games ?? []) {
        if (g.team_score == null || g.opponent_score == null) continue;
        const expected = g.team_score > g.opponent_score ? "W"
          : g.team_score < g.opponent_score ? "L" : "D";
        expect(g.result, `${t.abbrev} vs ${g.opponent}`).toBe(expected);
      }
    }
    for (const g of sc.head_to_head ?? []) {
      const away = g.at_vs === "@";
      const mine = Number(away ? g.away_score : g.home_score);
      const theirs = Number(away ? g.home_score : g.away_score);
      if (!Number.isFinite(mine) || !Number.isFinite(theirs)) continue;
      const expected = mine > theirs ? "W" : mine < theirs ? "L" : "D";
      expect(g.result, `h2h vs ${g.opponent}`).toBe(expected);
    }

    // DOM-level: read the rendered rows and re-check the same invariant
    await page.goto(`/bet-suggester/mls/${EVENT}`);
    await page.getByText(/ESPN form \+ H2H/i).first().click();
    const rows = await page.locator("div.font-mono.text-\\[11px\\]").all();
    let checked = 0;
    for (const row of rows) {
      const text = (await row.innerText()).replace(/\s+/g, " ").trim();
      const m = text.match(/^([WLD])\s+(\d+)[–-](\d+)/);
      if (!m) continue;
      const [, letter, a, b] = m;
      const expected = +a > +b ? "W" : +a < +b ? "L" : "D";
      expect(letter, `rendered row "${text}"`).toBe(expected);
      checked++;
    }
    expect(checked, "no scoreline rows found to verify").toBeGreaterThan(0);
  });

test("the hero form strips mirror the scouting form, cell for cell",
  async ({ page }) => {
    const resp = await page.request.get(`/api/mls/match/${EVENT}`);
    const body = await resp.json();
    const sc = body.match?.scouting;
    test.skip(!sc?.last_five?.length, "no scouting from this backend");

    await page.goto(`/bet-suggester/mls/${EVENT}`);
    const strips = page.getByTestId("hero-form");
    // one strip per side that HAS a form string — same source as the
    // scouting chips, so the two surfaces can never disagree
    const withForm = (sc.last_five as Array<{ form?: string }>)
      .filter((t) => (t.form ?? "").replace(/[ ?]/g, "").length > 0);
    await expect(strips).toHaveCount(withForm.length);
    for (let i = 0; i < withForm.length; i++) {
      const letters = withForm[i].form!.replace(/[ ?]/g, "");
      const cells = strips.nth(i).locator("i");
      await expect(cells).toHaveCount(letters.length);
      for (let j = 0; j < letters.length; j++) {
        await expect(cells.nth(j)).toHaveAttribute("data-r", letters[j]);
      }
    }
  });
