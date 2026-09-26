import "@/styles/globals.css";
// Archivo Variable (width axis included) from fontsource — bundled files,
// same no-build-time-fetch rule as the geist package below. It is the
// board's display voice: wordmark, column names, team names.
import "@fontsource-variable/archivo/wdth.css";
import type { AppProps } from "next/app";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

// Fonts come from the official `geist` npm package (files bundled — no
// build-time Google Fonts fetch, so Vercel builds can't fail on it).
// Loaded app-wide so the design tokens' --font-geist-sans / --font-geist-mono
// resolve on every route (the bet-suggester pages depend on them).
//
// `data-tap-floor` — THE 44px TOUCH FLOOR IS ON THE APP SHELL, so it is on
// every page by construction (2026-09-25, audit F11). It was set page by
// page on the board and the field page, and every control on the other
// fourteen routes stayed under 44px — the back link at 8x17 — because a
// per-page attribute is a hand-typed subset and the page that ships next
// is the one that forgets it. The rule itself is in globals.css and is
// gated on a coarse pointer, so a mouse sees exactly the layout that
// shipped. Guarded route by route, read off the pages directory, in
// e2e/the-floor-is-the-pointer-not-the-width.spec.ts.
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div data-tap-floor className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
