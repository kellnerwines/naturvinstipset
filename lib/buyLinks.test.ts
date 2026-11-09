import { describe, expect, it } from "vitest";
import type { Wine } from "./blob";
import { buyLinks, retailerNote, whereSentence } from "./buyLinks";

const base: Wine = {
  id: "x", slug: "x", name: "X", producer: "P", country: "Portugal", wineType: "Vitt",
  description: "", adminRating: 4, createdAt: "", published: true,
};
const sb = { shop: "Systembolaget", url: "https://sb/x", price: 246, inStock: true, lastSyncedAt: "" };
const fv = { shop: "Flaskvis", url: "https://fv/x", price: 229, inStock: true, lastSyncedAt: "" };

describe("buyLinks", () => {
  it("Systembolaget först och tydlig hemleveranstext för webbutiker", () => {
    const l = buyLinks({ ...base, offers: [fv, sb] });
    expect(l.map((x) => x.label)).toEqual(["Köp på Systembolaget", "Köp hos Flaskvis"]);
    expect(l[1].how).toBe("Hemleverans från webbutik, svensk skatt ingår");
    expect(whereSentence({ ...base, offers: [fv, sb] })).toBe("Det finns på Systembolaget och med hemleverans från webbutiken Flaskvis.");
    expect(retailerNote(l)).toContain("Systembolaget står inte bakom innehållet");
    expect(retailerNote(l)).toContain("Webbutiken står inte bakom innehållet");
  });

  it("slutsålda erbjudanden visas inte, och vinet blir tillfälligt slut", () => {
    const w = { ...base, offers: [{ ...fv, inStock: false }] };
    expect(buyLinks(w)).toEqual([]);
    expect(whereSentence(w)).toBe("Vinet är tillfälligt slut.");
  });

  it("gamla viner utan offers använder systembolagetUrl", () => {
    const l = buyLinks({ ...base, systembolagetUrl: "https://sb/y", price: "199" });
    expect(l).toHaveLength(1);
    expect(l[0]).toMatchObject({ isSb: true, href: "/go/systembolaget/x?src=okand", price: 199, rel: "noopener nofollow" });
  });
});
