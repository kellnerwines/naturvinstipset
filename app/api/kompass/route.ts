// Öppet JSON-svar från Vinkompassen för AI-agenter och andra tjänster.
// Samma parametrar som kompassens delbara länk, t.ex.
//   /api/kompass?farg=rott&budget=199&mat=kott
// Beskrivs i /llms.txt. Inga personuppgifter, inga kakor.

import { NextRequest, NextResponse } from "next/server";
import { getWines } from "@/lib/blob";
import { SITE, answer, compassLink } from "@/lib/answers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = new URLSearchParams(req.nextUrl.searchParams);
  const limit = Math.min(30, Math.max(1, Number(sp.get("antal")) || 10));
  sp.delete("antal");
  const a = answer(await getWines(), sp, limit, "okand");
  return NextResponse.json(
    {
      source: "Naturvinstipset Vinkompassen",
      about: `${SITE}/om-oss#sa-rankar-vi`,
      updated: new Date().toISOString().slice(0, 10),
      currency: "SEK",
      priceNote: "Priserna inkluderar moms och svensk alkoholskatt. Webbutikerna säljer till svenska konsumenter.",
      disclosure: "Naturvinstipset drivs av grundaren av vinimportören Kellner & Kellner. Viner från egen import är märkta (ownImport) och får ingen fördel i kompassens poäng.",
      openInCompass: SITE + compassLink(a.query),
      ...a,
    },
    { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600, s-maxage=3600" } },
  );
}
