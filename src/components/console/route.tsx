// THE CONSOLE'S VIEWS AS A BARE HASH (redesign, 2026-10-07).
//
// /ops/trading is one page; its views are `#trading`, `#portfolio`, … and
// the default (Overview) carries NO hash, so the header's Trading chip
// still lands on exactly /ops/trading. A view's own state may ride in the
// hash query (`#trading?decision=skipped&reason=stale_book`) so a link from
// the Attention list opens the filtered view; the view writes its filters
// back with replaceState — never a navigation, never a scroll jump, and
// never the operator token (which is React state only).
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
  /** go to a view (a history entry), scrolled to its top */
  const go = useCallback((view: string, params?: Record<string, string>) => {
    const href = hrefOf(view, params);
    if (window.location.hash === href) {
      setRoute(parseHash(href));
    } else {
      window.location.hash = href;
    }
    window.scrollTo({ top: 0 });
  }, []);
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
