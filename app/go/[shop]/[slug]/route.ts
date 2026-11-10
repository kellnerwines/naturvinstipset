// Utgående köplänkar (BRIEF-KOMPASSEN.md, 7.1): slår upp vinet och
// säljstället, loggar klicket utan IP-adress eller kaka och svarar 302 till
// butiken. Webbutiker får utm-parametrar och ref=naturvinstipset; till
// Systembolaget läggs ingenting på.

import { NextRequest, NextResponse } from "next/server";
import { getWines } from "@/lib/blob";
import { dedupeHash, logClick } from "@/lib/clicks/db";
import {
  asSourcePage, campaignFor, compassState, deviceType, isBot, outboundUrl, referrerHost, safePath, shopSlug, swedishDay,
} from "@/lib/clicks/util";

export const dynamic = "force-dynamic";

const LOG_TIMEOUT_MS = 1500;

export async function GET(req: NextRequest, ctx: { params: { shop: string; slug: string } | Promise<{ shop: string; slug: string }> }) {
  const { shop, slug } = await ctx.params;
  const wines = await getWines();
  const wine = wines.find((w) => w.slug === slug && w.published);
  if (!wine) return NextResponse.redirect(new URL("/", req.url), 302);

  const offers = [...(wine.offers ?? [])];
  if (!offers.length && wine.systembolagetUrl) {
    offers.push({ shop: "Systembolaget", url: wine.systembolagetUrl, price: Number(wine.price) || 0, inStock: true, lastSyncedAt: "" });
  }
  const offer = offers.find((o) => shopSlug(o.shop) === shop && o.url);
  if (!offer) return NextResponse.redirect(new URL(`/viner/${wine.slug}`, req.url), 302);

  const sp = req.nextUrl.searchParams;
  const source = asSourcePage(sp.get("src"));
  const ua = req.headers.get("user-agent") ?? "";
  const target = outboundUrl(offer.url, offer.shop, campaignFor(source));

  // Prefetch från webbläsare och länkförhandsvisningar ska inte räknas som klick.
  const purpose = req.headers.get("purpose") ?? req.headers.get("sec-purpose") ?? "";
  if (!/prefetch|prerender/i.test(purpose)) {
    const log = logClick({
      wineId: wine.id,
      shop: offer.shop,
      price: Number.isFinite(offer.price) && offer.price > 0 ? offer.price : null,
      sourcePage: source,
      pagePath: safePath(sp.get("p")),
      referrerHost: referrerHost(req.headers.get("referer")),
      compassState: source === "kompassen" ? compassState(sp.get("k")) : null,
      device: deviceType(ua),
      bot: isBot(ua),
      dedupe: dedupeHash(ua, swedishDay(), wine.id),
    });
    // Vänta en kort stund så att loggningen hinner klart innan funktionen avslutas,
    // men låt aldrig en långsam databas hålla kvar besökaren.
    await Promise.race([log, new Promise((r) => setTimeout(r, LOG_TIMEOUT_MS))]);
  }

  return NextResponse.redirect(target, {
    status: 302,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "origin" },
  });
}
