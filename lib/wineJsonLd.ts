import type { Wine } from "@/lib/blob";

const BASE = "https://www.naturvinstipset.se";

/** Extracts Systembolagets artikelnummer from a produkt-URL, e.g.
 *  ".../produkt/vin/fred-9323901/" -> "9323901". */
export function getArticleNumber(wine: Pick<Wine, "systembolagetUrl">): string | undefined {
  const match = wine.systembolagetUrl?.match(/-(\d{4,})\/?$/);
  return match?.[1];
}

type ScoreInput = {
  /** Blended score (editorial + community) as shown in the UI, 1–5. */
  combinedRating: number;
  /** Number of community votes (ratings + likes), excluding the editorial vote. */
  communityCount: number;
};

/** Builds schema.org Product JSON-LD for a wine, shared between the wine card
 *  and the individual wine page. Editorial rating (adminRating) is reported as
 *  its own `review`; community votes — when any exist — are reported as a
 *  separate `aggregateRating`, since schema.org/Google guidance treats
 *  aggregateRating as a multi-voter signal distinct from a single editorial review.
 *
 *  Search Console-krav: adminRating 0 betyder "inte betygsatt" och ger ingen review
 *  (0 ligger utanför 1–5). Utan bild utelämnas offers, eftersom Google då räknar
 *  sidan som en ofullständig handlarlistning. Blir inget betyg eller erbjudande kvar
 *  returneras null och ingen Product skrivs ut. */
export function buildWineProductJsonLd(wine: Wine, score: ScoreInput): Record<string, unknown> | null {
  const url = `${BASE}/viner/${wine.slug}`;
  const articleNumber = getArticleNumber(wine);
  const displayName = wine.year ? `${wine.name} ${wine.year}` : wine.name;

  // Community-only average, derived from the blended score:
  // combinedRating = (adminRating + sum(communityStars)) / (communityCount + 1)
  const communityAverage =
    score.communityCount > 0
      ? Math.round(
          ((score.combinedRating * (score.communityCount + 1) - wine.adminRating) / score.communityCount) * 10
        ) / 10
      : null;

  const additionalProperty: Array<Record<string, string>> = [];
  if (wine.country) additionalProperty.push({ "@type": "PropertyValue", name: "Land", value: wine.country });
  if (wine.region) additionalProperty.push({ "@type": "PropertyValue", name: "Region", value: wine.region });
  if (wine.grape) additionalProperty.push({ "@type": "PropertyValue", name: "Druvor", value: wine.grape });
  if (wine.flavorTags?.length) additionalProperty.push({ "@type": "PropertyValue", name: "Smakprofil", value: wine.flavorTags.join(", ") });

  const shippingAndReturns = {
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingDestination: { "@type": "DefinedRegion", addressCountry: "SE" },
      deliveryTime: { "@type": "ShippingDeliveryTime" },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "SE",
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    },
  };

  // En Offer per säljställe (BRIEF-KOMPASSEN.md, 9), även när det bara finns ett.
  const sources: { shop: string; url?: string; price?: number | string; inStock: boolean }[] = wine.offers?.length
    ? wine.offers
    : wine.systembolagetUrl || wine.price
    ? [{ shop: "Systembolaget", url: wine.systembolagetUrl, price: wine.price, inStock: true }]
    : [];
  const offers = sources.map((o) => ({
    "@type": "Offer",
    ...(o.price ? { price: String(o.price) } : {}),
    priceCurrency: "SEK",
    availability: o.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    ...(o.url ? { url: o.url } : {}),
    seller: { "@type": "Organization", name: o.shop },
    ...shippingAndReturns,
  }));

  const image = wine.primaryImageUrl
    ? /^https?:/.test(wine.primaryImageUrl) ? wine.primaryImageUrl : `${BASE}${wine.primaryImageUrl}`
    : undefined;
  const hasReview = wine.adminRating >= 1 && wine.adminRating <= 5;
  const listOffers = image && offers.length > 0;
  if (!hasReview && communityAverage === null && !listOffers) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName,
    description: wine.description,
    url,
    category: `Wine/${wine.wineType}`,
    ...(articleNumber ? { sku: articleNumber } : {}),
    manufacturer: { "@type": "Organization", name: wine.producer },
    ...(wine.producer ? { brand: { "@type": "Brand", name: wine.producer } } : {}),
    ...(image ? { image } : {}),
    ...(listOffers ? { offers } : {}),
    ...(hasReview
      ? {
          review: {
            "@type": "Review",
            reviewRating: {
              "@type": "Rating",
              ratingValue: wine.adminRating,
              bestRating: 5,
              worstRating: 1,
            },
            author: { "@type": "Organization", name: "Naturvinstipset" },
          },
        }
      : {}),
    ...(communityAverage !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: communityAverage,
            reviewCount: score.communityCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
  };
}
