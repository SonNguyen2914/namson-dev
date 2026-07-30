// Superseded by the shared viewer at /bet-suggester/comp/[key].
//
// Kept as a redirect rather than deleted: the Conference League page
// shipped at this URL earlier today and may already be linked or
// bookmarked. Keeping a second full implementation alive is exactly how
// the three league match pages drifted apart.
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function EclRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/bet-suggester/comp/ecl"); }, [router]);
  return null;
}
