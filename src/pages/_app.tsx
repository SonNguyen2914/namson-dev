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
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
