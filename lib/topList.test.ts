import { describe, expect, it } from "vitest";
import type { Offer, Rating, Wine } from "./blob";
import { topList, TOP_SIZE, weekOf } from "./topList";

const offer = (shop: string, inStock = true): Offer => ({ shop, url: `https://${shop}/x`, price: 200, inStock, lastSyncedAt: "" });
const wine = (id: string, o: Partial<Wine>): Wine => ({
  id, slug: id, name: id, producer: "P", country: "Frankrike", wineType: "Rött", description: "",
  adminRating: 0, createdAt: "", published: true, primaryImageUrl: `/flaskor/${id}.webp`, ...o,
});
const rating = (wineId: string, stars: number, createdAt: string): Rating => ({ id: `${wineId}-${createdAt}`, wineId, stars, fingerprint: "x", createdAt });

describe("Veckans topplista", () => {
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

  it("Systembolaget först efter betyg, sedan Flaskvis i importörsordning upp till 100", () => {
    const list = topList([...fv, ...sb], []);
    expect(list).toHaveLength(TOP_SIZE);
    expect(list.slice(0, 96).every((e) => !e.filler && e.wine.id.startsWith("sb"))).toBe(true);
    expect(list[0].rating).toBe(5);
    expect(list.slice(96).map((e) => e.wine.id)).toEqual(["kk", "backyard", "rebels-a", "rebels-b"]);
  });

  it("utan lediga platser fylls inget", () => {
    const many = Array.from({ length: 120 }, (_, i) => wine(`s${i}`, { offers: [offer("Systembolaget")] }));
    expect(topList([...fv, ...many], []).some((e) => e.filler)).toBe(false);
  });

  it("viner utan flaskbild tas inte med", () => {
    const utan = wine("utan-bild", { adminRating: 5, primaryImageUrl: undefined, offers: [offer("Systembolaget")] });
    const med = wine("med-bild", { adminRating: 1, offers: [offer("Systembolaget")] });
    expect(topList([utan, med], []).map((e) => e.wine.id)).toEqual(["med-bild"]);
  });

  it("betyg från den här veckan räknas först nästa måndag", () => {
    const a = wine("a", { adminRating: 4, offers: [offer("Systembolaget")] });
    const b = wine("b", { adminRating: 3, offers: [offer("Systembolaget")] });
    const ratings = [rating("b", 5, "2026-11-12T10:00:00Z"), rating("b", 5, "2026-11-17T10:00:00Z"), rating("b", 5, "2026-11-18T10:00:00Z")];
    const wed = new Date("2026-11-18T12:00:00Z");
    expect(topList([a, b], ratings, wed).map((e) => [e.wine.id, e.rating])).toEqual([["a", 4], ["b", 4]]);
    const nextMonday = new Date("2026-11-23T08:00:00Z");
    expect(topList([a, b], ratings, nextMonday)[0]).toMatchObject({ wine: { id: "b" }, rating: 4.5 });
  });

  it("månadens vin står först", () => {
    const top = wine("top", { adminRating: 5, offers: [offer("Systembolaget")] });
    const motm = wine("motm", { adminRating: 1, wineOfMonth: true, offers: [offer("Systembolaget")] });
    expect(topList([top, motm], [])[0].wine.id).toBe("motm");
  });
});

describe("weekOf", () => {
  it("ger måndagen och ISO-veckan i svensk tid", () => {
    expect(weekOf(new Date("2026-11-16T10:00:00Z"))).toEqual({ start: "2026-11-16", week: 47 });
    expect(weekOf(new Date("2026-11-22T22:30:00Z"))).toEqual({ start: "2026-11-16", week: 47 }); // söndag 23.30 i Sverige
    expect(weekOf(new Date("2026-11-22T23:30:00Z"))).toEqual({ start: "2026-11-23", week: 48 }); // måndag 00.30
    expect(weekOf(new Date("2027-01-01T12:00:00Z"))).toEqual({ start: "2026-12-28", week: 53 });
  });
});
