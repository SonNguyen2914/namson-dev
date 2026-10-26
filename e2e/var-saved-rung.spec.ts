import { expect, test } from "@playwright/test";
import { buildRungSheet, displayValue, rungLabel, rungUsable, sheetForPrompt } from "../src/lib/analyst/factSheet";
import { checkText } from "../src/lib/analyst/verify";
import { chooseSheet, LoadError, runPreview, wantsSavedRung } from "../src/lib/analyst/analyst";
import { MockClient } from "../src/lib/analyst/llm";
import { leagueRouteAllowed, SAVED_RUNG } from "../src/lib/suggesterProxy";
import { expectForwarded } from "./proxy-forwarding";
import {
  analystOn, EPL_EVENT, EPL_PAYLOAD, EPL_PAYLOAD_IN_PLAY, EPL_SAVED_RUNG, hermetic, json, rungPreviewFor,
} from "./analyst-fixtures";

// TRIVELA VAR v2: THE SAVED PRE-KICKOFF RUNG (2026-10-25, backend C8).
//
// After kickoff, or when the live read is gone, VAR's fact sheet is built
// from the backend's saved pre-kickoff rung (/api/<league>/match/<id>/
// saved-rung, the archive's frozen t10/t60 read) and labelled "frozen
// pre-kickoff read (captured HH:MM UTC)". Without a rung it falls back to
// the live read; an LLM failure still falls back to the raw numbers. The
// verifier is unchanged and checks against whichever sheet was built.
//
// Hermetic: module-level tests with no page, a page test whose preview is
// the pipeline's own output with the mock model, and proxy probes that
// read the rewritten URL off the hold-out socket. No real LLM anywhere.

const LABEL = "frozen pre-kickoff read (captured 13:51 UTC)";
const ok = (body: unknown) => ({ ok: true as const, body });
const failed = (status = 502) => ({ ok: false as const, error: new LoadError("the backend answered 503", status) });

test.describe("when the rung is read", () => {
  test("before kickoff with a priced live read: the live read, no rung asked", () => {
    expect(wantsSavedRung(ok(EPL_PAYLOAD))).toBe(false);
  });
  test("after kickoff (in play or finished): the rung", () => {
    expect(wantsSavedRung(ok(EPL_PAYLOAD_IN_PLAY))).toBe(true);
    expect(wantsSavedRung(ok({ ...EPL_PAYLOAD, match: { ...EPL_PAYLOAD.match, state: "post" } }))).toBe(true);
  });
  test("when the live read is gone: failed, or nothing priced left in it", () => {
    expect(wantsSavedRung(failed())).toBe(true);
    expect(wantsSavedRung(ok({ match: { state: "pre" } }))).toBe(true);
  });
});

test.describe("which sheet VAR reads", () => {
  test("the saved rung first, labelled, with the live read's unpriced context", () => {
    const { sheet, runId } = chooseSheet("epl", EPL_EVENT, ok(EPL_PAYLOAD_IN_PLAY), ok(EPL_SAVED_RUNG));
    expect(sheet.basis).toEqual({ kind: "saved_rung", rung: "t10", capturedAt: "2026-10-24T13:51:00Z", label: LABEL });
    expect(runId).toBe("saved-t10-4242");
    const f = (label: string) => sheet.facts.find((x) => x.label === label);
    // the rung's numbers, not the live payload's (0.5076 there)
    expect(f("Arsenal win probability")?.value).toBe(0.538);
    expect(displayValue(f("Arsenal win probability")!)).toBe("54%");
    expect(f("Arsenal win probability (trading model)")?.value).toBe(0.55);
    expect(displayValue(f("Market price for Arsenal (cents, ask)")!)).toBe("66¢");
    // every priced fact names the read it is
    for (const x of sheet.facts.filter((x) => x.kind === "prob" || x.kind === "price")) {
      expect(x.source, x.label).toContain(LABEL);
    }
    // the live read's in-play priced numbers are not on the sheet at all
    expect(sheet.facts.some((x) => x.label.includes("expected goals"))).toBe(false);
    expect(sheet.facts.some((x) => x.value === 0.5076)).toBe(false);
    // ...and its form and head-to-head are, renumbered after the rung's
    expect(sheet.facts.some((x) => x.label.startsWith("Arsenal wins in last"))).toBe(true);
    expect(sheet.facts.map((x) => x.id)).toEqual(sheet.facts.map((_, i) => `F${i + 1}`));
    expect(sheet.match.venue).toBe(EPL_PAYLOAD.match.venue ?? null);
    expect(sheet.notes[0]).toContain(LABEL);
    // the LLM is told what it is reading
    expect(sheetForPrompt(sheet)).toContain(`DATA: Trivela's ${LABEL}.`);
  });

  test("the rung alone, when the live read is gone", () => {
    const { sheet } = chooseSheet("epl", EPL_EVENT, failed(), ok(EPL_SAVED_RUNG));
    expect(sheet.match.home).toBe("Arsenal");
    expect(sheet.match.away).toBe("Everton");
    expect(sheet.facts).toHaveLength(9);
    expect(sheet.basis?.label).toBe(LABEL);
  });

  test("no rung saved, after kickoff: the live read WITHOUT its in-play prices", () => {
    // review finding 2 (2026-10-25): this used to hand VAR the live
    // read's in-play model and book, unlabelled (0.5076 here)
    for (const rung of [ok({ available: false, reason: "no_saved_rung" }), failed(), null]) {
      const { sheet, runId } = chooseSheet("epl", EPL_EVENT, ok(EPL_PAYLOAD_IN_PLAY), rung);
      expect(sheet.basis).toBeUndefined();
      expect(sheet.frozenUnavailable).toMatch(/frozen pre-kickoff read is unavailable/);
      expect(sheet.facts.find((x) => x.label === "Arsenal win probability")).toBeUndefined();
      expect(sheet.facts.some((x) => x.kind === "prob" || x.kind === "price")).toBe(false);
      expect(runId).not.toContain("saved");
    }
  });

  test("no rung needed before kickoff: the live read, priced and unlabelled", () => {
    const { sheet } = chooseSheet("epl", EPL_EVENT, ok(EPL_PAYLOAD), null);
    expect(sheet.basis).toBeUndefined();
    expect(sheet.frozenUnavailable).toBeUndefined();
    expect(sheet.facts.find((x) => x.label === "Arsenal win probability")?.value).toBe(0.5076);
  });

  test("neither: the live read's own error, unchanged", () => {
    const live = failed(504);
    expect(() => chooseSheet("epl", EPL_EVENT, live, ok({ available: false }))).toThrow(live.error);
  });

  test("a rung with no number is not usable", () => {
    expect(rungUsable({ ...EPL_SAVED_RUNG, model: null, trader_model: null, market: null })).toBe(false);
    expect(rungUsable({ ...EPL_SAVED_RUNG, captured_at: null })).toBe(false);
    expect(rungUsable({ available: false })).toBe(false);
    expect(rungUsable(EPL_SAVED_RUNG)).toBe(true);
    // a missing half is named in the notes, never zero
    const s = buildRungSheet("epl", EPL_EVENT, { ...EPL_SAVED_RUNG, market: null, market_missing_reason: "no_three_way_book" });
    expect(s.facts.some((x) => x.kind === "price")).toBe(false);
    expect(s.notes.join(" ")).toContain("no_three_way_book");
  });

  test("the label is HH:MM of the rung's own clock, UTC", () => {
    expect(rungLabel("2026-10-24T13:51:00Z")).toBe(LABEL);
    expect(rungLabel("2026-10-24T09:05:59+00:00")).toBe("frozen pre-kickoff read (captured 09:05 UTC)");
    expect(rungLabel("not a time")).toBe("frozen pre-kickoff read (captured time unknown UTC)");
  });
});

test.describe("the verifier on a rung sheet", () => {
  const sheet = buildRungSheet("epl", EPL_EVENT, EPL_SAVED_RUNG, EPL_PAYLOAD_IN_PLAY);
  test("a placeholder renders the rung's number; an invented one is flagged", () => {
    expect(checkText("Arsenal at {{F1}}.", sheet).segments.find((s) => s.type === "fact")?.text).toBe("54%");
    expect(checkText("Arsenal at 51%.", sheet).violations.length).toBeGreaterThan(0);
  });
  test("the mock model's preview verifies end to end", async () => {
    const out = await runPreview(sheet, new MockClient());
    expect(out.ok).toBe(true);
    expect(out.sheet.basis?.label).toBe(LABEL);
    expect(out.preview?.headline.flagged).toBe(0);
  });
});

test.describe("the match-hub panel", () => {
  test("after kickoff the panel says it is reading the frozen pre-kickoff rung", async ({ page }) => {
    const preview = await rungPreviewFor();
    await hermetic(page);
    await page.route("**/api/card/**", (r) => r.fulfill(json({ error: "no live-plane fixture in this recorded world" }, 404)));
    await analystOn(page);
    await page.route("**/api/analyst/preview**", (r) => r.fulfill(json(preview)));
    await page.route(`**/api/epl/match/${EPL_EVENT}`, (r) => r.fulfill(json(EPL_PAYLOAD)));
    await page.goto(`/bet-suggester/epl/${EPL_EVENT}`);
    await page.waitForSelector("#markets");
    const panel = page.getByTestId("analyst-panel");
    await expect(panel).toHaveAttribute("data-state", "preview");
    await expect(panel.getByTestId("analyst-basis")).toHaveText(`· ${LABEL}`);
    await expect(panel.getByTestId("analyst-headline")).toContainText("54%");
    const first = panel.getByTestId("analyst-fact").first();
    await expect(first).toHaveAttribute("title", new RegExp(`frozen pre-kickoff read \\(captured 13:51 UTC\\)`));
  });

  test("a live read before kickoff carries no frozen label", async ({ page }) => {
    const { previewFor } = await import("./analyst-fixtures");
    const preview = await previewFor("arsenal-everton");
    await hermetic(page);
    await page.route("**/api/card/**", (r) => r.fulfill(json({ error: "none" }, 404)));
    await analystOn(page);
    await page.route("**/api/analyst/preview**", (r) => r.fulfill(json(preview)));
    await page.route(`**/api/epl/match/${EPL_EVENT}`, (r) => r.fulfill(json(EPL_PAYLOAD)));
    await page.goto(`/bet-suggester/epl/${EPL_EVENT}`);
    await expect(page.getByTestId("analyst-panel")).toHaveAttribute("data-state", "preview");
    await expect(page.getByTestId("analyst-basis")).toHaveCount(0);
  });
});

test.describe("the proxy forwards the saved rung for the four VAR leagues only", () => {
  test("the allowlist admits exactly match/<digits>/saved-rung", () => {
    for (const league of ["epl", "laliga", "mls", "ligamx"]) {
      expect(leagueRouteAllowed(league, "match/401878768/saved-rung"), league).toBe(true);
      for (const bad of ["match/12a/saved-rung", "match/1/saved-rung/x", "match/1/saved", "saved-rung",
                         "match//saved-rung", `match/${"1".repeat(13)}/saved-rung`]) {
        expect(leagueRouteAllowed(league, bad), `${league}/${bad}`).toBe(false);
      }
    }
    for (const other of ["friendlies", "bundesliga", "comp", "picker", "site"]) {
      expect(leagueRouteAllowed(other, "match/401878768/saved-rung"), other).toBe(false);
    }
    expect(SAVED_RUNG.test("match/1/saved-rung")).toBe(true);
  });

  for (const league of ["epl", "laliga", "mls", "ligamx"]) {
    test(`the ${league} proxy forwards match/<id>/saved-rung — unmocked on purpose`, async ({ request }) => {
      await expectForwarded(request, league, `match/${EPL_EVENT}/saved-rung`);
    });
  }

  test("another prefix refuses it before any backend is asked", async ({ request }) => {
    const r = await request.get(`/api/friendlies/match/${EPL_EVENT}/saved-rung`);
    expect(r.status()).toBe(404);
    expect(await r.text()).toContain("unknown friendlies route");
  });
});
