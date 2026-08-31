// Custom 404 — the framework default rendered bare: no chrome, no way
// back into the app. A dead address should still be a page OF the app,
// with the one link that always works.
import Head from "next/head";
import Link from "next/link";
import { TopBar } from "../components/chrome";
import { Eyebrow } from "../components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>Not found · namson.dev</title></Head>
      <TopBar back={{ href: "/bet-suggester", label: "board" }}
        title="not found" />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-24">
        <Eyebrow>404</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-hi">
          There is nothing at this address
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-low">
          The page may have moved when the picker board became the landing
          surface — the board itself is always at the same door.
        </p>
        <p className="mt-6">
          <Link href="/bet-suggester"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
            go to the picker board →
          </Link>
        </p>
      </main>
    </div>
  );
}
