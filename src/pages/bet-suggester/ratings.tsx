// THE FIELD — namson.dev/bet-suggester/ratings
//
// "create a stat page on the web, put in on the left upper side of the
//  web for me to check rankings and tier rankings anytime i need"
//                                          (operator, 2026-09-09)
//
// A DURABLE HOME FOR A READING THAT WAS ONLY EVER A PASSENGER. The
// cross-league field already existed — three axes, every club with its
// 95% interval and its tier SET — but it lived halfway down the
// competition viewer, under the fixtures and the "no model · by design"
// block, reachable only by scrolling past everything that page is
// actually for. A ranking you check is not a section you arrive at; it
// is a page you open. This is that page, and the link to it sits in the
// top-left of the chrome on every surface that carries the nav, which
// is what "anytime I need" means.
//
// IT LANDS WHERE HE CAN SCAN. `FieldAxes` opens on the overall axis with
// the full field already drawn — no filter to set, no competition to
// choose, nothing collapsed. One request, and the ranked table is the
// first thing on the page below its own heading.
//
// WHICH COMPETITION. `?comp=` names it and the Champions League is the
// default, because it is the one competition anybody has measured a
// field for (backend `competitions.FIELD_AXES`). That set is NOT
// mirrored here: a key with no measurement is answered by the backend in
// its own words — "nobody has measured it, not that its clubs have no
// rating" — and `FieldAxes` draws that sentence. So a second competition
// measured tomorrow is reachable the same day with no edit to this file,
// and this file never claims a competition has no field when what it
// means is that it did not look.
//
// NOTHING HERE IS A RECOMMENDATION, and the page adds no verb the reader
// could act on. It shows; it does not decide.
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import FieldAxes from "../../components/FieldAxes";
import { ArchiveMenu } from "../../components/ArchiveMenu";
import { CompRail } from "../../components/CompRail";
import { Ratings, fetchRatings } from "../../lib/fieldApi";
import { Eyebrow } from "../../components/ui";
import {
  NavChip, RouteProgress, SkeletonRows, TopBar,
} from "../../components/chrome";

const DEFAULT_COMP = "ucl";

export default function FieldPage() {
  const router = useRouter();
  /* THE QUERY IS EMPTY ON THE FIRST RENDER of a statically-optimised
     page, and `router.isReady` is the only honest way to know whether an
     absent `comp` means "he did not name one" or "Next has not parsed
     the URL yet". Fetching before it is ready would request the default
     and then request again — two reads for one page view, the second
     silently correcting the first. */
  const raw = router.query.comp;
  const comp = typeof raw === "string" && raw !== "" ? raw : DEFAULT_COMP;

  const [data, setData] = useState<Ratings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady) return;
    const ac = new AbortController();
    /* async, not called sync in the effect body, so every setState below
       lands in a callback rather than cascading a render — the idiom the
       board's own loads already use. */
    const t = setTimeout(() => {
      setLoading(true);
      void fetchRatings(comp, ac.signal)
        .then((d) => {
          if (ac.signal.aborted) return;
          setData(d);
          setError(null);
          setLoading(false);
        })
        .catch((e) => {
          if (ac.signal.aborted) return;
          /* THE PREVIOUS PAYLOAD IS DROPPED, the contract the board
             keeps: a field from an earlier competition standing under a
             heading naming a new one is stale dressed as current. And
             the failure is NAMED rather than left as `data: null`, which
             is the shape of "measured, and there is nothing" — a
             different fact, and the one `FieldAxes` draws its "no
             cross-league field" block for. */
          setData(null);
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        });
    }, 0);
    return () => { clearTimeout(t); ac.abort(); };
  }, [router.isReady, comp]);

  /* THE COMPETITION'S OWN DISPLAY NAME, from the payload that carries
     it. No raw slug reaches the reader (e2e/no-raw-slug-reaches-the-
     reader.spec.ts), and none is invented either: before the read lands
     the heading says what the page IS rather than which competition it
     is about, because it does not yet know. */
  const display = data?.display ?? null;

  return (
    <div className="min-h-screen bg-bs font-sans text-ink-mid">
      <Head>
        <title>The field, ranked · namson.dev</title>
        <meta name="description"
          content="Cross-league ratings on three axes, with tier sets and 95% intervals." />
      </Head>
      <RouteProgress />
      <TopBar left={<ArchiveMenu />} title="the field">
        <CompRail />
        <NavChip href="/bet-suggester">board</NavChip>
        <NavChip href="/bet-suggester/ratings" active>ratings</NavChip>
      </TopBar>

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-8">
        <Eyebrow>rankings &amp; tier rankings</Eyebrow>
        <h1 className="mt-2 text-2xl font-medium tracking-tight text-ink-hi">
          The field, ranked
          {display && (
            <span data-testid="field-comp"
              className="ml-2.5 align-middle font-mono text-[11px] uppercase tracking-[0.16em] text-ink-faint">
              {display}
            </span>
          )}
        </h1>
        <p className="mt-3 max-w-3xl text-[13.5px] leading-relaxed text-ink-low">
          Every entrant on three axes — overall from a global Elo chain,
          attack and defence from a goals model, because one number cannot
          be split into two orderings that differ. Each club carries its
          95% interval and the SET of bands that interval touches: where a
          bar crosses a cut, the evidence does not place that club in one
          band, and the set is the read.
        </p>
        {/* THE CHARTER SENTENCE, on a page whose whole content is a
            ranking. An ordering is the easiest thing on this site to
            mistake for advice, and this page has no fixtures, no prices
            and no context around it to make the distinction for itself. */}
        <p data-testid="field-charter"
          className="mt-3 max-w-3xl border-l-2 border-line-strong pl-3.5 text-[12.5px] leading-relaxed text-ink-low">
          No model runs on this page and no number below is a probability
          or an edge of ours. Nothing here is a recommendation — the
          ordering says where to look, and you are the one who picks.
        </p>

        {/* MISSING IS NEVER ZERO, and the three states are kept apart on
            the way in as well as on the way out: while the read is in
            flight the page draws a SHAPE, not an empty field. Handing
            `FieldAxes` a null payload with no error during loading would
            render nothing at all, which on a page that is only this
            table looks exactly like a competition with no clubs. */}
        {loading
          ? (
            <div data-testid="field-loading" className="mt-8">
              <SkeletonRows rows={8} height="h-9" />
            </div>
          )
          : <FieldAxes data={data} error={error} />}
      </main>
    </div>
  );
}
