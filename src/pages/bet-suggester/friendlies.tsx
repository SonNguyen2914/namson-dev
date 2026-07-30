// Club Friendlies — market viewer. Same chrome as the league hubs; the
// honest framing (no model here, ever) lives in FriendliesDashboard.
import Head from "next/head";
import AllFriendlies from "../../components/AllFriendlies";
import FriendliesDashboard from "../../components/FriendliesDashboard";
import { RouteProgress, TopBar } from "../../components/chrome";
import { Eyebrow } from "../../components/ui";

export default function FriendliesPage() {
  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head><title>Club Friendlies · market viewer · namson.dev</title></Head>
      <RouteProgress />
      <TopBar back={{ href: "/bet-suggester", label: "board" }}
        title="Club Friendlies · market viewer" />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-10">
        <Eyebrow>club friendlies · viewer</Eyebrow>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink-hi">
          Friendlies, watched not modelled
        </h1>
        {/* The full slate goes FIRST. It was appended below the ESPN
            board, which meant the page opened on a surface showing 2
            fixtures, "league has not been looked up yet" on every club and
            "no kalshi book matched" — and the 399-match section with the
            strength reads was several screens down, past a long
            non-clickable list. The good surface should not be the one you
            have to scroll to find. */}
        <div className="mt-10">
          <AllFriendlies />
        </div>
        <div className="mt-16 border-t border-line pt-10">
          <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
            below · the original espn board, kept for its live scores and
            market-implied block
          </p>
          <FriendliesDashboard />
        </div>
      </main>
    </div>
  );
}
