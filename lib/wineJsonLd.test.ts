import { describe, expect, it } from "vitest";
import type { Wine } from "./blob";
import { buildWineProductJsonLd } from "./wineJsonLd";

const base: Wine = {
  id: "1", slug: "saroto-palhete-2024", name: "Saroto Palhete", year: "2024", producer: "Barroca da Malhada",
  country: "Portugal", wineType: "Rött", description: "", adminRating: 4, createdAt: "", published: true,
};
const score = { combinedRating: 4, communityCount: 0 };

describe("JSON-LD för vin (avsnitt 9)", () => {
  it("en Offer per säljställe med säljare och lagerstatus", () => {
    const ld = buildWineProductJsonLd({
      ...base,
      offers: [
        { shop: "Systembolaget", url: "https://www.systembolaget.se/produkt/vin/saroto-1/", price: 246, inStock: true, lastSyncedAt: "" },
        { shop: "Flaskvis", url: "https://www.flaskvis.se/produkt/saroto/", price: 229, inStock: false, lastSyncedAt: "" },
      ],
    }, score);
    const offers = ld.offers as Record<string, unknown>[];
    expect(offers).toHaveLength(2);
    expect(offers[0]).toMatchObject({ price: "246", priceCurrency: "SEK", availability: "https://schema.org/InStock", seller: { name: "Systembolaget" } });
    expect(offers[1]).toMatchObject({ price: "229", availability: "https://schema.org/OutOfStock", seller: { name: "Flaskvis" } });
  });

  it("gamla viner utan offers får en Offer från Systembolaget", () => {
    const ld = buildWineProductJsonLd({ ...base, systembolagetUrl: "https://www.systembolaget.se/produkt/vin/x-123456/", price: "199" }, score);
    expect(ld.offers).toEqual([expect.objectContaining({ price: "199", url: "https://www.systembolaget.se/produkt/vin/x-123456/", seller: { "@type": "Organization", name: "Systembolaget" } })]);
  });
});
