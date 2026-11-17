import { describe, expect, it } from "vitest";
import type { Offer, Wine } from "./blob";
import { topHundred, TOP_SIZE } from "./topList";

const offer = (shop: string, inStock = true): Offer => ({ shop, url: `https://${shop}/x`, price: 200, inStock, lastSyncedAt: "" });
const wine = (id: string, o: Partial<Wine>): Wine => ({
  id, slug: id, name: id, producer: "P", country: "Frankrike", wineType: "Rött", description: "",
  adminRating: 0, createdAt: "", published: true, ...o,
});

describe("Topp 100", () => {
  const sb = Array.from({ length: 96 }, (_, i) => wine(`sb${i}`, { adminRating: 1 + (i % 5), offers: [offer("Systembolaget")] }));
  const fv = [
    wine("nordic", { importer: "Nordic 4 Wines", offers: [offer("Flaskvis")] }),
    wine("rebels-b", { importer: "Wine Rebels", name: "B", offers: [offer("Flaskvis")] }),
    wine("rebels-a", { importer: "Wine Rebels", name: "A", offers: [offer("Flaskvis")] }),
    wine("backyard", { importer: "Backyard Wines", offers: [offer("Flaskvis")] }),
    wine("kk", { importer: "Kellner & Kellner", offers: [offer("Flaskvis")] }),
    wine("kk-slut", { importer: "Kellner & Kellner", offers: [offer("Flaskvis", false)] }),
    wine("annan", { importer: "Bootleggers", offers: [offer("Flaskvis")] }),
    wine("vn", { importer: "Kellner & Kellner", offers: [offer("Vin & Natur")] }),
  ];

  it("Systembolaget först efter betyg, sedan Flaskvis efter betyg upp till 100", () => {
    const list = topHundred([...fv, ...sb], []);
    expect(list).toHaveLength(TOP_SIZE);
    expect(list.slice(0, 96).every((e) => !e.filler && e.wine.id.startsWith("sb"))).toBe(true);
    expect(list[0].rating).toBe(5);
    // Lika betyg: bokstavsordning efter namn. Kellner & Kellner får ingen förtur.
    expect(list.slice(96).map((e) => e.wine.id)).toEqual(["rebels-a", "rebels-b", "backyard", "kk"]);
  });

  it("egen import får ingen förtur: utfyllnaden följer betyget", () => {
    const fill = [
      wine("kk-lagt", { importer: "Kellner & Kellner", adminRating: 2, offers: [offer("Flaskvis")] }),
      wine("backyard-hogt", { importer: "Backyard Wines", adminRating: 5, offers: [offer("Flaskvis")] }),
      wine("nordic-mitt", { importer: "Nordic 4 Wines", adminRating: 4, offers: [offer("Flaskvis")] }),
    ];
    const list = topHundred([...fill, ...sb], []);
    expect(list.slice(96).map((e) => e.wine.id)).toEqual(["backyard-hogt", "nordic-mitt", "kk-lagt"]);
  });

  it("utan lediga platser fylls inget", () => {
    const many = Array.from({ length: 120 }, (_, i) => wine(`s${i}`, { offers: [offer("Systembolaget")] }));
    expect(topHundred([...fv, ...many], []).some((e) => e.filler)).toBe(false);
  });
});
