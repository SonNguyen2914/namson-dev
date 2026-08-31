// Site root — there is nothing here of its own.
//
// This file was still the create-next-app starter ("To get started, edit
// the index.tsx file", a Vercel logo and two template links) long after
// the only thing on this domain became the bet-suggester. Anyone who
// typed the bare domain got a page advertising a framework.
//
// It redirects to the picker board, server-side, so there is no flash of
// boilerplate and no dependence on JavaScript. The component below is
// only ever reached if the redirect is somehow bypassed, and it says the
// same thing in one line rather than rendering an empty page.
import type { GetServerSideProps } from "next";
import Link from "next/link";

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/bet-suggester", permanent: false },
});

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bs font-sans text-ink-mid">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
        <Link href="/bet-suggester" className="text-accent">
          continue to the picker board →
        </Link>
      </p>
    </div>
  );
}
