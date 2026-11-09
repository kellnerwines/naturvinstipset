// Köpställen för ett vin, byggda från `offers` (BRIEF-KOMPASSEN.md, avsnitt 4.6, 5, 8).
// Används av vinsidan och listkorten så att webbutiksviner får rätt länk och
// text, och så att det alltid framgår att hemleverans kommer från en webbutik.

import type { Wine } from "./blob";
import { buyHref } from "./compass/links";

export const SB = "Systembolaget";

export type BuyLink = {
  shop: string;
  href: string;
  price?: number;
  isSb: boolean;
  /** "Köp på Systembolaget" / "Köp hos Flaskvis" */
  label: string;
  /** "Hämta på Systembolaget" / "Hemleverans från webbutik, svensk skatt ingår" */
  how: string;
};

/** Säljställen med vinet i lager, Systembolaget först. */
export function buyLinks(w: Wine): BuyLink[] {
  const offers = (w.offers ?? []).filter((o) => o.inStock && o.url);
  if (!w.offers?.length && w.systembolagetUrl) {
    offers.push({ shop: SB, url: w.systembolagetUrl, price: Number(w.price) || 0, inStock: true, lastSyncedAt: "" });
  }
  return offers
    .sort((a, b) => Number(b.shop === SB) - Number(a.shop === SB))
    .map((o) => {
      const isSb = o.shop === SB;
      return {
        shop: o.shop,
        href: buyHref(w.slug, o.shop, o.url),
        price: o.price || undefined,
        isSb,
        label: isSb ? "Köp på Systembolaget" : `Köp hos ${o.shop}`,
        how: isSb ? "Hämta på Systembolaget" : "Hemleverans från webbutik, svensk skatt ingår",
      };
    });
}

/** Har vinet något säljställe alls (även slutsålt)? */
export const hasAnyOffer = (w: Wine) => !!(w.offers?.length || w.systembolagetUrl);

/** Mening för vinsidans "Om vinet". */
export function whereSentence(w: Wine): string {
  const links = buyLinks(w);
  if (!links.length) return hasAnyOffer(w) ? "Vinet är tillfälligt slut." : "";
  const sb = links.some((l) => l.isSb);
  const web = links.filter((l) => !l.isSb).map((l) => l.shop);
  const webText = web.length ? `med hemleverans från webbutiken ${web.join(" och ")}` : "";
  if (sb && web.length) return `Det finns på Systembolaget och ${webText}.`;
  if (sb) return "Det finns på Systembolaget.";
  return `Det finns ${webText}.`;
}

/** Ansvarstext där vi länkar till säljställen (avsnitt 8). */
export function retailerNote(links: BuyLink[]): string {
  const sb = links.some((l) => l.isSb);
  const web = links.some((l) => !l.isSb);
  const parts: string[] = [];
  if (sb) parts.push("Köp och avhämtning sker hos Systembolaget. Systembolaget står inte bakom innehållet.");
  if (web) parts.push("Köp med hemleverans sker hos webbutiken, som säljer till Sverige med svensk alkoholskatt inräknad. Webbutiken står inte bakom innehållet.");
  return parts.join(" ");
}
