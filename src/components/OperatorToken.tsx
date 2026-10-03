// THE OPERATOR TOKEN, ONE PER TAB, FOR EVERY PAGE (2026-10-03).
//
// Son chose "hidden chip + one token": a Trading chip appears in the
// header only once he has typed his operator token, and the token he
// typed on the board is the one the trading console (/ops/trading) uses,
// so it is typed once per visit. Two surfaces asking for the same secret
// would be this site inventing a second credential.
//
// So the token is lifted out of the board's WatchDeclarationProvider
// into this provider, mounted once in pages/_app.tsx. The app shell
// outlives every client-side navigation (Next `Link`), so the token
// survives board -> console -> board; a full reload builds a new shell
// and forgets it.
//
// EVERY RULE IT HAD BEFORE STILL HOLDS. It is React state and nothing
// else: never in the bundle, an env var, localStorage, sessionStorage or
// a cookie. The server renders it as "" — there is no other value it
// could know — so the first client render matches and nothing about the
// operator is in any HTML a visitor is sent.
//
// IT DOES NO I/O. Holding the token asks nothing of anybody; each
// surface that sends it keeps its own 600 ms debounce on typing, so a
// token typed key by key is still one login, not one per keystroke.
import {
  createContext, useContext, useMemo, useState, type ReactNode,
} from "react";

interface Ctx {
  token: string;
  setToken: (v: string) => void;
}

const OperatorTokenCtx = createContext<Ctx | null>(null);

export function OperatorTokenProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState("");
  const value = useMemo(() => ({ token, setToken }), [token]);
  return (
    <OperatorTokenCtx.Provider value={value}>{children}</OperatorTokenCtx.Provider>
  );
}

/** The tab's operator token and its setter, for a surface that has a
 *  field for it (the board's watch panel, the trading console).
 *
 *  Outside the provider it falls back to state of its own, so a surface
 *  rendered without the app shell still has a working field — it simply
 *  shares it with nobody. */
export function useOperatorToken(): [string, (v: string) => void] {
  const shared = useContext(OperatorTokenCtx);
  const [own, setOwn] = useState("");
  return shared ? [shared.token, shared.setToken] : [own, setOwn];
}

/** Whether this tab holds an operator token at all. What the header's
 *  Trading chip reads; it never sees the token itself. */
export function useOperatorTokenHeld(): boolean {
  return (useContext(OperatorTokenCtx)?.token.trim() ?? "") !== "";
}
