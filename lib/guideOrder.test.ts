import { describe, expect, it } from "vitest";
import type { Offer, Wine } from "./blob";
import { guideOrder, isRated } from "./guideOrder";

const offer = (shop: string): Offer => ({ shop, url: `https://${shop}/x`, price: 200, inStock: true, lastSyncedAt: "" });
const wine = (id: string, o: Partial<Wine>): Wine => ({
  id, slug: id, name: id, producer: "P", country: "Italien", wineType: "Orange", description: "",
  adminRating: 0, createdAt: "", published: true, ...o,
});

describe("ordningen på listsidorna", () => {
  it("betygsatta först efter betyg, sedan obetygsatta med Systembolaget före hemleverans", () => {
    const list = guideOrder([
      wine("webb-b", { offers: [offer("Vin & Natur")] }),
      wine("sb", { offers: [offer("Systembolaget")] }),
      wine("webb-a", { offers: [offer("Flaskvis")] }),
      wine("tre", { adminRating: 3, offers: [offer("Flaskvis")] }),
      wine("fyra", { adminRating: 4, offers: [offer("Vin & Natur")] }),
    ], []);
    expect(list.map((w) => w.id)).toEqual(["fyra", "tre", "sb", "webb-a", "webb-b"]);
  });

  it("ett vin utan redaktionens betyg räknas som betygsatt när besökare har satt betyg", () => {
    const w = wine("x", {});
    expect(isRated(w, [])).toBe(false);
    expect(isRated(w, [{ id: "r", wineId: "x", stars: 4, createdAt: "" } as never])).toBe(true);
  });
});
