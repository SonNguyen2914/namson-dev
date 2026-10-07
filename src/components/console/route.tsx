// THE CONSOLE'S VIEWS AS A BARE HASH (redesign, 2026-10-07).
//
// /ops/trading is one page; its views are `#trading`, `#portfolio`, … and
// the default (Overview) carries NO hash, so the header's Trading chip
// still lands on exactly /ops/trading. A view's own state may ride in the
// hash query (`#trading?decision=skipped&reason=stale_book`) so a link from
// the Attention list opens the filtered view; the view writes its filters
// back with replaceState — never a navigation, never a scroll jump, and
// never the operator token (which is React state only).
//
// SWITCHING VIEWS LEAVES NO HISTORY (Son's bug, 2026-10-07): a view switch
// REPLACES the URL's hash instead of pushing an entry, so the browser's Back
// leaves the console in one step — it used to walk back through every view
// visited (Trades → Portfolio → Trading → …) before reaching the board. The
// URL still names the view, so a deep link (`/ops/trading#trades`) and a
// reload on a view open it as before. Every same-page view link (the nav,
// the rail's pills, Attention, "Candidates →") goes through `go`; a click
// on any `#<view>` anchor in the page is caught for it, so a plain anchor
// can never push one again. A modified click (new tab / window) is left
// to the browser.
import { useCallback, useEffect, useState } from "react";

export const VIEWS = [
  { key: "overview", label: "Overview" },
  { key: "trading", label: "Trading" },
  { key: "portfolio", label: "Portfolio" },
  { key: "trades", label: "Trades" },
  { key: "performance", label: "Performance" },
  { key: "model", label: "Model" },
  { key: "system", label: "System" },
] as const;
export type ViewKey = typeof VIEWS[number]["key"];
const KEYS = new Set<string>(VIEWS.map((v) => v.key));

export interface Route { view: ViewKey; params: Record<string, string> }

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, "");
  const [head, query = ""] = h.split("?");
  const view = (KEYS.has(head) ? head : "overview") as ViewKey;
  const params: Record<string, string> = {};
  for (const [k, v] of new URLSearchParams(query)) if (v !== "") params[k] = v;
  return { view, params };
}

export function hrefOf(view: string, params?: Record<string, string>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v !== "" && v !== undefined) q.set(k, v);
  const s = q.toString();
  return `#${view}${s ? `?${s}` : ""}`;
}

export function useHashRoute() {
  const [route, setRoute] = useState<Route>({ view: "overview", params: {} });
  useEffect(() => {
    const read = () => setRoute(parseHash(window.location.hash));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  /** go to a view — REPLACING the URL's hash, never a history entry —
   *  scrolled to its top */
  const go = useCallback((view: string, params?: Record<string, string>) => {
    const href = hrefOf(view, params);
    if (window.location.hash !== href) {
      window.history.replaceState(window.history.state, "",
        `${window.location.pathname}${window.location.search}${href}`);
    }
    setRoute(parseHash(href));
    window.scrollTo({ top: 0 });
  }, []);
  // every same-page `#<view>` anchor goes through `go` (no history entry)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const r = parseHash(a.getAttribute("href") ?? "");
      if (!KEYS.has((a.getAttribute("href") ?? "").replace(/^#/, "").split("?")[0])) return;
      e.preventDefault();
      go(r.view, r.params);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [go]);
  /** write a view's own params back, with no history entry and no scroll.
   *  The default view keeps a bare URL while it has nothing to say. */
  const replaceParams = useCallback((view: string, params: Record<string, string>) => {
    const href = hrefOf(view, params);
    const bare = view === "overview" && href === "#overview";
    const url = `${window.location.pathname}${window.location.search}${bare && !window.location.hash ? "" : href}`;
    window.history.replaceState(window.history.state, "", url);
  }, []);
  return { route, go, replaceParams };
}
