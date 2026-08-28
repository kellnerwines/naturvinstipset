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
 *  aggregateRating as a multi-voter signal distinct from a single editorial review. */
export function buildWineProductJsonLd(wine: Wine, score: ScoreInput): Record<string, unknown> {
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
    ...(wine.primaryImageUrl ? { image: `${BASE}${wine.primaryImageUrl}` } : {}),
    ...(wine.price
      ? {
          offers: {
            "@type": "Offer",
            price: wine.price,
            priceCurrency: "SEK",
            availability: "https://schema.org/InStock",
            ...(wine.systembolagetUrl ? { url: wine.systembolagetUrl } : {}),
            ...shippingAndReturns,
          },
        }
      : wine.systembolagetUrl
      ? {
          offers: {
            "@type": "Offer",
            url: wine.systembolagetUrl,
            priceCurrency: "SEK",
            availability: "https://schema.org/InStock",
            ...shippingAndReturns,
          },
        }
      : {}),
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: wine.adminRating,
        bestRating: "5",
      },
      author: { "@type": "Organization", name: "Naturvinstipset" },
    },
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
