// FAULT ISOLATION — the first on this frontend, and the reason it is
// the first is the measurement that produced it.
//
// 2026-09-11: `grep -rn "ErrorBoundary\|componentDidCatch\|
// getDerivedStateFromError" src/` returned NOTHING. React's default
// when a render throws is to unmount the WHOLE TREE, so one unexpected
// shape inside the watched strip took the entire page with it:
// `document.body.innerText` dropped to 127 characters, `<main>`
// disappeared, and the picker board, every league column, the review
// and the season banner died with a section that is above them on the
// page and independent of them in every other way.
//
// THE BACKEND ALREADY KEEPS THIS PROMISE AND THE FRONTEND DID NOT.
// api/main.py's watched-strip route says of itself that "one dead
// artifact, provider or table degrades ITS OWN block with a named
// reason, never the match, never the strip and never a 500" — and it
// does, per block. The surface drawing that payload had no isolation at
// all, so the one layer that keeps a failure local was the one that
// could not see the reader.
//
// A BOUNDARY THAT RENDERS A BLANK IS NOT THE ANSWER, AND THAT IS WHY
// THIS TAKES A `fallback` RATHER THAN OWNING ONE. A silent blank is the
// exact failure the surfaces below this boundary exist to prevent — an
// absent Live section reads as "nothing is live", which is a claim
// about a set nobody counted. So the words are the GUARDED SURFACE'S,
// written in its own idiom, and this file authors none of them: it
// catches, it records, it hands the error to the surface, and the
// surface says what happened.
//
// IT RETRIES ON A NEW READ. `resetKey` is the identity of the payload
// the children are drawing — `generated_at` for the watched-strip
// surfaces. React does not re-mount a tripped boundary on its own, so
// without this a single bad payload would keep a section dark for the
// life of the tab even after the next poll answered cleanly. A shape
// that is still bad throws again and is caught again, which costs one
// render per poll and keeps the fallback up; a shape that was a one-off
// draws.
import { Component, ReactNode } from "react";

interface Props {
  /** WHAT THE SURFACE SAYS WHEN ITS OWN RENDER RAISED. Required, and
   *  never defaulted to null here: see the note above. */
  fallback: (err: unknown) => ReactNode;
  /** The payload identity the children are drawing. When it changes,
   *  the boundary clears and lets them try again. */
  resetKey?: unknown;
  children: ReactNode;
}

interface State { err: unknown; caught: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { err: null, caught: false };

  static getDerivedStateFromError(err: unknown): State {
    return { err, caught: true };
  }

  // RECORDED, NOT SWALLOWED. The fallback tells the reader; this tells
  // whoever opens the console. React logs the error itself as well, and
  // a second line naming the boundary is what says WHICH section
  // stopped rather than leaving that to a stack trace.
  componentDidCatch(err: unknown) {
    console.error("[ErrorBoundary] a guarded surface did not draw:", err);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.caught && prev.resetKey !== this.props.resetKey) {
      this.setState({ err: null, caught: false });
    }
  }

  render() {
    if (this.state.caught) return this.props.fallback(this.state.err);
    return this.props.children;
  }
}
