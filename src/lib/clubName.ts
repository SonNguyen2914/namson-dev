// WHICH WORDS IN A CLUB'S NAME CARRY NO IDENTITY — the frontend's copy
// of one backend fact, in one place instead of three.
//
// MIRRORS src/live/club_names.py NOISE_TOKENS in the TRIVELA backend,
// and that is the whole reason this comment exists. A process boundary
// and two languages sit between the declaration and this file — a static
// build cannot import a Python module — so the copy stays, and the
// backend's tests/test_club_name_noise_is_one_fact.py fails on the
// commit that lets the two disagree. If a token is added THERE, CI turns
// red HERE until this array matches. Do not edit this list to make a
// label read better; edit the declaration, and let the guard bring this
// file along.
//
// WHY IT HAD TO BE PINNED. The list used to be written out three times
// in this repo (AllFriendlies, MarketVsRead, and the competition page)
// and twice more in the backend, in three different versions: 20 tokens
// there, 19 here, 14 in clubelo. So the same club normalised differently
// depending on which file touched it, and a name that does not normalise
// identically does not match. That is the 2026-09-15 defect — one
// spelling, "Wolverhampton Wanderers" against "Wolves", cost three EFL
// Cup ties their measured field.
//
// WHAT THIS LIST DOES ON THIS SIDE, stated honestly, because it is
// narrower than what it does on the other. The backend uses it to decide
// whether two names are the same CLUB; `shortClub` below only uses it to
// pick which word to PRINT. Measured over the 2,844 club names the two
// ratings providers publish, adding the token this repo was missing
// (`cs`) changes ZERO labels — "CS Sfaxien" already read SFAXIEN, because
// the longest surviving word wins either way. The list is nearly inert
// here and decisive there, and that asymmetry is exactly why it drifted
// for as long as it did: nothing on this side ever looked wrong.
export const CLUB_NOISE_TOKENS = [
  // English / international
  "fc", "cf", "afc", "sc", "club", "the",
  // Italian
  "ac", "as", "ss", "ssc",
  // Iberian / Latin American (Club Deportivo, Sociedad Deportiva,
  // Club Atlético, Club Sportif — "de" as in "Atlético de Madrid")
  "cd", "sd", "ca", "cs", "de",
  // Nordic / Slavic / Baltic (Fotballklubb, Sportklubb, Bollklubb,
  // Idrottsförening, Klub Sportowy)
  "fk", "sk", "bk", "if", "ks",
];

const NOISE = new Set(CLUB_NOISE_TOKENS);

/** A compact club label for a narrow row: the most DISTINCTIVE word, so
 *  "Borussia Dortmund" reads DORTMUND and "FC Augsburg" reads AUGSBURG
 *  rather than both collapsing onto a generic prefix.
 *
 *  `max` is the character budget the caller has on its own row — 9 for a
 *  fixture row, 8 where three legs share the width. It is the ONLY thing
 *  that differed between the three copies this replaced. */
export function shortClub(name?: string, max = 9): string {
  if (!name) return "";
  const words = name.split(/[\s.]+/).filter((w) => w
    && !NOISE.has(w.toLowerCase().replace(/[^a-z]/g, "")));
  return (words.sort((a, b) => b.length - a.length)[0] || name)
    .slice(0, max).toUpperCase();
}
