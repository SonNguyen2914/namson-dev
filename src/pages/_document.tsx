import { Html, Head, Main, NextScript } from "next/document";

// THE ICON IS TRIVELA'S MARK (2026-10-02) — the trivela's curl and the
// ball, in the brand gold on the board's ground — replacing the
// framework's stock icon. SVG first for browsers that take it; the .ico
// (16/32/48) for the rest, and a 180px PNG for a phone's home screen.
// Drawn once in public/icon.svg; the raster copies are its rendering.
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
