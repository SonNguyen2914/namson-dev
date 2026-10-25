// Ported unchanged from trivela-analyst lib/verify.ts (ccb8f07).
// The verification ladder, step 3: every number in the Analyst's text must
// trace to a fact. Numbers written as {{F#}} placeholders are rendered from
// the sheet (correct by construction). Any raw number must match a fact's
// displayed value within rounding, or it is a violation.

import { displayValue, type Fact, type FactSheet } from "./factSheet";

export type Violation = { text: string; reason: string };
export type Segment =
  | { type: "text"; text: string }
  | { type: "fact"; text: string; factId: string; label: string; source: string }
  | { type: "flag"; text: string; reason: string };

const PLACEHOLDER = /\{\{\s*(F\d+)\s*\}\}/g;
// A number with an optional unit: 51%, 0.51, 1.63, 67¢, 67 cents, 3
const NUMBER = /(?<![\w.])(\d+(?:\.\d+)?)\s*(%|¢|\s?cents?\b|\s?percent\b)?(?![\w])/g;
// Numbers that are part of names or fixed football vocabulary, not claims.
const ALLOWED = [/\b(?:over|under)\s+\d\.5\b/gi, /\b1X2\b/gi, /\b3-way\b/gi, /\blast\s+\d\b/gi];

function matchesFact(raw: number, unit: string | undefined, facts: Fact[]): Fact | null {
  const u = (unit ?? "").trim().toLowerCase();
  for (const f of facts) {
    const shown = displayValue(f);
    if (f.kind === "prob") {
      const pct = f.value * 100;
      if ((u === "%" || u.startsWith("percent")) && Math.abs(raw - pct) <= 0.6) return f;
      if (!u && raw <= 1 && Math.abs(raw - f.value) <= 0.006) return f;
    } else if (f.kind === "price") {
      const c = f.value * 100;
      if ((u === "¢" || u.startsWith("cent")) && Math.abs(raw - c) <= 0.6) return f;
    } else if (!u) {
      const decimals = (shown.split(".")[1] ?? "").length;
      const tol = decimals ? 0.5 * 10 ** -decimals + 1e-9 : 0;
      if (Math.abs(raw - f.value) <= Math.max(tol, 0.0051 * (f.kind === "count" ? 0 : 1))) return f;
    }
  }
  return null;
}

export function checkText(text: string, sheet: FactSheet): { segments: Segment[]; violations: Violation[] } {
  const byId = new Map(sheet.facts.map((f) => [f.id, f]));
  const segments: Segment[] = [];
  const violations: Violation[] = [];

  // Mask allowed vocabulary so its digits are not checked.
  let masked = text;
  for (const re of ALLOWED) masked = masked.replace(re, (s) => s.replace(/\d/g, "#"));

  // Walk placeholders and raw numbers in order.
  type Hit = { start: number; end: number; seg: Segment; violation?: Violation };
  const hits: Hit[] = [];
  for (const m of text.matchAll(PLACEHOLDER)) {
    const f = byId.get(m[1]);
    const start = m.index!, end = start + m[0].length;
    if (f) hits.push({ start, end, seg: { type: "fact", text: displayValue(f), factId: f.id, label: f.label, source: f.source } });
    else {
      const v = { text: m[0], reason: `${m[1]} is not a fact id on this sheet` };
      hits.push({ start, end, seg: { type: "flag", text: "[unverified]", reason: v.reason }, violation: v });
    }
  }
  const inPlaceholder = (i: number) => hits.some((h) => i >= h.start && i < h.end);
  for (const m of masked.matchAll(NUMBER)) {
    const start = m.index!, end = start + m[0].length;
    if (inPlaceholder(start)) continue;
    const raw = Number(m[1]);
    const shown = text.slice(start, end);
    const f = matchesFact(raw, m[2], sheet.facts);
    if (f) hits.push({ start, end, seg: { type: "fact", text: shown, factId: f.id, label: f.label, source: f.source } });
    else {
      const v = { text: shown.trim(), reason: "not traceable to any fact on the sheet" };
      hits.push({ start, end, seg: { type: "flag", text: "[unverified]", reason: `${v.text}: ${v.reason}` }, violation: v });
    }
  }
  hits.sort((a, b) => a.start - b.start);
  let at = 0;
  for (const h of hits) {
    if (h.start > at) segments.push({ type: "text", text: text.slice(at, h.start) });
    segments.push(h.seg);
    if (h.violation) violations.push(h.violation);
    at = h.end;
  }
  if (at < text.length) segments.push({ type: "text", text: text.slice(at) });
  return { segments, violations };
}
