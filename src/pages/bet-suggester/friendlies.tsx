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
        <div className="mt-10">
          <FriendliesDashboard />
        </div>
        <AllFriendlies />
      </main>
    </div>
  );
}
