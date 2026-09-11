// ONE READ OF THE WATCHED STRIP, AND EVERY SURFACE THAT DRAWS IT READS
// THE SAME ONE.
//
// MEASURED ON PRODUCTION, 2026-09-11. WatchedStrip and LiveCard's
// LiveSection each polled GET /api/bet-suggester/watched-strip on its
// OWN 15s timer: two requests per cycle, ~139KB each, drifting 2.4s out
// of phase — about 18.5 KB/s per open tab. The bandwidth is the small
// half. The large half is that TWO INDEPENDENT READS OF ONE MOVING
// MATCH WERE RENDERED AS ONE SCREEN: the strip's scoreline came off one
// payload and the card's off another, taken seconds apart, and nothing
// on the page said which of the two was now.
//
// So the poll lives here. ONE timer, ONE request, ONE payload, handed
// to every subscriber in the same commit. What does NOT move here is
// judgement: each surface still decides what to draw, what to say about
// a refusal and what an absence means. This module fetches; it does not
// decide.
//
// THREE DEFECTS ARE FIXED ONCE HERE RATHER THAN TWICE IN TWO
// COMPONENTS, because both effects had the same three holes:
//
//  1. A LATE RESPONSE REWROTE THE SCREEN WITH OLDER DATA. Both effects
//     carried an `alive` flag for unmount and NOTHING for ordering, so
//     the last response to arrive won regardless of the order the
//     requests were issued in. Demonstrated: poll 1 delayed 22s
//     returning an old `generated_at`, poll 2 fast returning a new one
//     — at 17s the screen showed the fresh read and at 26s the
//     straggler landed and the screen REVERTED, with no banner, and the
//     stale clock was walked backwards with it. On a moving match that
//     is the score and the clock going backwards. Every read is now
//     NUMBERED and a response older than the newest one already applied
//     is DROPPED, success or failure.
//  2. A HUNG POLL WAS INVISIBLE AND ACCUMULATED. There was no
//     AbortController and no timeout anywhere on this read. Measured: 4
//     polls fired, 3 never answered, and the stale banner never drew —
//     the figures sat on screen with nothing saying they were from an
//     earlier read, which is the exact opposite of what the strip's own
//     charter promises. One hung request per 15s, forever. A read now
//     has a CEILING, and a read that does not answer inside it is
//     abandoned and becomes a named failure, which is what arms the
//     stale machinery.
//  3. ONE MISSING ENVELOPE KEY DISARMED THE WHOLE STALE MACHINERY. The
//     strip armed its banner off `if (lastOk.current)`, and `lastOk`
//     held `generated_at` — so a good poll whose envelope carried no
//     `generated_at`, followed by a 403, drew no banner, no gate and no
//     notice of any kind while the read was being refused. WHETHER
//     THERE WAS AN EARLIER GOOD READ AND WHEN IT WAS TAKEN ARE TWO
//     DIFFERENT FACTS and they are kept apart here: `stale` is armed by
//     the first, `staleSince` carries the second and is null when the
//     payload named no clock.
import { useCallback, useSyncExternalStore } from "react";
import {
  WatchedStripRefusal, WatchedStripResponse, api,
} from "./suggesterApi";

/** THE CADENCE, AND IT IS NOW IN ONE PLACE.
 *
 *  THERE IS NO 15s TICK UPSTREAM, and the comment over both component
 *  copies of this constant claimed one until 2026-09-09. The state
 *  collector's own interval is `config.LIVE_STATE_INTERVAL_SECONDS`,
 *  which any env value can move and which has been moved since — that
 *  number is the BACKEND'S to know, it is not restated here, and where
 *  a period has to be shown on a surface it is read off a payload that
 *  carries it.
 *
 *  THE NUMBER IS LEFT WHERE IT WAS. Slowing the poll changes what the
 *  operator sees the moment a goal lands and nothing here has measured
 *  that trade-off; what this round changed is that it is ONE poll
 *  rather than two of them racing. */
export const WATCHED_STRIP_POLL_MS = 15_000;

/** HOW LONG A READ MAY GO UNANSWERED BEFORE THIS CLIENT ABANDONS IT.
 *
 *  NOT DERIVED FROM THE CADENCE ANY MORE, and the reason is a live
 *  outage. This was `WATCHED_STRIP_POLL_MS + 5_000` = 20s, argued from
 *  "by the time a read has been out this long its successor's answer is
 *  already on screen, so it has nothing left to tell anybody". That
 *  holds only while the successor SUCCEEDS. On 2026-09-11 the operator's
 *  declared set reached 27 matches, the payload reached 1.09MB and the
 *  backend took 24s to build it — so every read was abandoned four
 *  seconds before its answer arrived, every successor was abandoned too,
 *  and the strip rendered NOTHING at all. The assumption inverted: the
 *  ceiling stopped bounding a pathology and became one.
 *
 *  HOW LONG A READ TAKES AND HOW OFTEN IT IS ASKED FOR ARE DIFFERENT
 *  QUANTITIES. The first belongs to the backend and the size of the
 *  payload; the second is a choice about how fresh the screen should be.
 *  Tying one to the other made a slow backend invisible instead of slow.
 *  So this is now a bound on a connection that has HUNG — a minute, past
 *  which nobody is still waiting — and the job it used to be given, of
 *  stopping reads accumulating, is done structurally in `poll` by not
 *  starting a scheduled one while another is in flight.
 *
 *  IT IS STILL A JUDGEMENT AND NOT A MEASUREMENT. Nothing has measured
 *  how long this read may legitimately take; 24s was measured once, on
 *  one payload, and the backend fix for that is separate. A minute is
 *  chosen to be comfortably past any read worth waiting for rather than
 *  fitted to one. */
export const WATCHED_STRIP_READ_CEILING_MS = 60_000;

/** THE ONE SENTENCE ON THIS READ THAT NO UPSTREAM LAYER WROTE.
 *
 *  Every other refusal the strip draws is quoted from the layer that
 *  produced it. This one cannot be: nothing produced it. The request
 *  never came back, and the only layer that knows that is this one — so
 *  it says so in the first person rather than putting a backend's voice
 *  on a sentence no backend spoke. */
export const READ_ABANDONED_SAID =
  `no answer in ${Math.round(WATCHED_STRIP_READ_CEILING_MS / 1000)}s, so `
  + "this client gave up on the request. NOTHING UPSTREAM REFUSED IT: "
  + "the read may still be running on the other end, and this sentence "
  + "is the client's own — it is the one line here that is not quoted "
  + "from the layer that produced it, because no layer produced it.";

/** The code that names it. Not a `position.REFUSAL_CODES` name and
 *  never counted as one: those name a number that could not be
 *  PRODUCED, and this names a request that was never ANSWERED. */
export const READ_ABANDONED_CODE = "read_abandoned";

export interface WatchedStripRead {
  /** The newest payload that was applied, kept across a failed poll.
   *  Null until one has landed. */
  data: WatchedStripResponse | null;
  /** The newest read's refusal, or null when the newest read landed. */
  refusal: WatchedStripRefusal | null;
  /** Whether any read has come back at all. Before it has, a surface
   *  knows nothing and must not make a claim about the watchlist. */
  asked: boolean;
  /** THE FIGURES ON SCREEN ARE FROM AN EARLIER READ. Armed by "there
   *  was a good read and the newest one failed" and by nothing else —
   *  see defect 3 in the header. */
  stale: boolean;
  /** WHEN that earlier read was generated, or null when the payload
   *  carried no `generated_at`. Null is a named absence a surface must
   *  say out loud; it is never a reason to withhold the banner. */
  staleSince: string | null;
}

/** The shape a surface sees before anything has been read. Module-level
 *  and shared so `useSyncExternalStore` sees a STABLE identity. */
const IDLE: WatchedStripRead = {
  data: null, refusal: null, asked: false, stale: false, staleSince: null,
};

interface Feed {
  token: string;
  state: WatchedStripRead;
  listeners: Set<() => void>;
  timer: ReturnType<typeof setInterval> | null;
  /** the number of the last read ISSUED */
  issued: number;
  /** the number of the newest read APPLIED — the ordering guard */
  applied: number;
  /** whether ANY read has ever landed: what arms `stale` */
  everOk: boolean;
  /** the `generated_at` of the last read that landed, or null */
  stamp: string | null;
  live: boolean;
  flight: Set<AbortController>;
}

/** ONE FEED PER TOKEN. A different credential is a different read, and
 *  a payload taken under the old one must never be shown as an answer
 *  under the new one. A feed is created when its first subscriber
 *  arrives and torn down — timer cleared, everything in flight aborted
 *  — when its last one leaves. */
const feeds = new Map<string, Feed>();

function publish(feed: Feed, next: WatchedStripRead): void {
  feed.state = next;
  // A COPY, because a listener may unsubscribe while being notified.
  for (const l of [...feed.listeners]) l();
}

async function poll(feed: Feed, forced = false): Promise<void> {
  // A SCHEDULED TICK DOES NOT STACK ON A READ THAT IS STILL COMING.
  //
  // This is what actually bounds accumulation, and the ceiling below is
  // no longer asked to do it. When every read outlasts the cadence —
  // measured 2026-09-11: 24s for a 1.09MB payload on 27 declared
  // matches, against a 15s period — a timer that fires regardless opens
  // a second request on top of a first that is still in flight, and the
  // backend is asked to build the same megabyte twice.
  //
  // THE PRESS IS EXEMPT. `refreshWatchedStrip` is the operator asking
  // for this read NOW, having just changed what it would say; making
  // him wait out an in-flight poll would be the button declining to do
  // the one thing it exists for.
  if (!forced && feed.flight.size > 0) return;
  const seq = (feed.issued += 1);
  const ctl = new AbortController();
  feed.flight.add(ctl);
  let abandoned = false;
  const ceiling = setTimeout(() => {
    abandoned = true;
    ctl.abort();
  }, WATCHED_STRIP_READ_CEILING_MS);
  const sent = feed.token !== "";
  try {
    const r = await api.watchedStrip(feed.token, ctl.signal);
    // A STRAGGLER IS NOT NEWS. Dropped before it can touch anything —
    // the payload, the stale clock, or the refusal.
    if (!feed.live || seq <= feed.applied) return;
    feed.applied = seq;
    feed.everOk = true;
    feed.stamp = typeof r.generated_at === "string" && r.generated_at !== ""
      ? r.generated_at : null;
    publish(feed, { data: r, refusal: null, asked: true,
                    stale: false, staleSince: null });
  } catch (err) {
    if (!feed.live || seq <= feed.applied) return;
    feed.applied = seq;
    const refusal = abandoned
      ? new WatchedStripRefusal(null, READ_ABANDONED_SAID, sent,
                                READ_ABANDONED_CODE)
      : err instanceof WatchedStripRefusal ? err
      // A throw that is not a WatchedStripRefusal has no status and no
      // upstream sentence, and is wrapped as exactly that rather than
      // glossed.
      : new WatchedStripRefusal(null, String(err), sent);
    // WITH A PAYLOAD IN HAND THE FIGURES STAY UP AND ARE MARKED. Armed
    // off `everOk`, never off the stamp — see defect 3.
    publish(feed, { data: feed.state.data, refusal, asked: true,
                    stale: feed.everOk, staleSince: feed.stamp });
  } finally {
    clearTimeout(ceiling);
    feed.flight.delete(ctl);
  }
}

function start(feed: Feed): void {
  feed.live = true;
  void poll(feed);
  feed.timer = setInterval(() => { void poll(feed); },
                           WATCHED_STRIP_POLL_MS);
}

function stop(feed: Feed): void {
  feed.live = false;
  if (feed.timer !== null) clearInterval(feed.timer);
  feed.timer = null;
  for (const c of feed.flight) c.abort();
  feed.flight.clear();
}

/** Join the read for `token`, starting it if nobody was reading yet.
 *  Returns the unsubscribe. */
export function subscribeWatchedStrip(
  token: string, onChange: () => void,
): () => void {
  let feed = feeds.get(token);
  if (feed === undefined) {
    feed = { token, state: IDLE, listeners: new Set(), timer: null,
             issued: 0, applied: 0, everOk: false, stamp: null,
             live: false, flight: new Set() };
    feeds.set(token, feed);
  }
  const f = feed;
  f.listeners.add(onChange);
  if (f.listeners.size === 1) start(f);
  return () => {
    f.listeners.delete(onChange);
    if (f.listeners.size > 0) return;
    stop(f);
    if (feeds.get(token) === f) feeds.delete(token);
  };
}

/** What the feed for `token` is currently holding. */
export function watchedStripSnapshot(token: string): WatchedStripRead {
  return feeds.get(token)?.state ?? IDLE;
}

/** READ IT AGAIN NOW, without waiting for the timer.
 *
 *  This is the handle a surface needs when the operator has just done
 *  something that changed what the read would say — pressing the tape
 *  button, for instance — and does not want to wait out the cadence.
 *  It is numbered like every other read, so a scheduled poll already in
 *  flight cannot land on top of its answer. */
export function refreshWatchedStrip(token: string): void {
  const feed = feeds.get(token);
  if (feed !== undefined && feed.live) void poll(feed, true);
}

/** THE READ, FOR A COMPONENT.
 *
 *  The token is an ARGUMENT rather than read from the provider here:
 *  this module is `lib/`, the token is held by a component
 *  (WatchDeclaration's `useWatchToken`), and a fetcher that reached
 *  into the component tree for a credential would be the wrong thing
 *  depending on the wrong thing.
 *
 *  `useSyncExternalStore` rather than an effect and a `useState` per
 *  component: it is the primitive that guarantees every subscriber
 *  renders the SAME snapshot in the same commit, which is the half of
 *  the doubled-poll defect that was not about bandwidth. */
export function useWatchedStrip(token: string):
    WatchedStripRead & { reread: () => void } {
  const subscribe = useCallback(
    (onChange: () => void) => subscribeWatchedStrip(token, onChange),
    [token]);
  const snapshot = useCallback(() => watchedStripSnapshot(token), [token]);
  // SSR KNOWS NOTHING, and that is the honest answer rather than a
  // payload the server never read. The data arrives after the effect
  // runs on the client, which is what the hydration rule in AGENTS.md
  // already assumes of every dashboard component here.
  const server = useCallback(() => IDLE, []);
  const state = useSyncExternalStore(subscribe, snapshot, server);
  const reread = useCallback(() => { refreshWatchedStrip(token); }, [token]);
  return { ...state, reread };
}
