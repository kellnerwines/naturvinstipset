import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import type { Wine } from "../blob";
import { applySync, STOCK_HIDDEN, type ShopFeed } from "./apply";
import { parseSystembolagetPage, sbNumber } from "./systembolaget";
import { toCompassWine } from "../compass/engine";

const html = readFileSync(join(__dirname, "fixtures/systembolaget-9448801.html"), "utf8");
const NOW = "2026-12-01T04:30:00.000Z";
const wine = (o: Partial<Wine>): Wine => ({
  id: "x", slug: "x", name: "X", producer: "P", country: "Tyskland", wineType: "Vitt", description: "",
  adminRating: 0, createdAt: NOW, published: true, ...o,
});
const feed = (items: ShopFeed["items"]): ShopFeed => ({ shop: "Systembolaget", source: "systembolaget.se", complete: false, errors: [], items });

describe("Systembolagets produktsida", () => {
  it("läser namn, producent, färg, pris, bild och lager", () => {
    expect(parseSystembolagetPage(html)).toMatchObject({
      number: "9448801", name: "Friedelsheimer Rosengarten Chardonnay", producer: "Scheuermann", country: "Tyskland",
      region: "Pfalz", wineType: "Vitt", year: "2023", price: 371, volume: 750, inStock: true, supplier: "Pompette AB",
      image: "https://product-cdn.systembolaget.se/productimages/64795902/64795902_400.png",
    });
  });
  it("producenten i fetstil och vinet under, eller tvärtom", () => {
    const page = (bold: string, thin: string, producerName: string) => html
      .replace('"productNameBold": "Friedelsheimer Rosengarten Chardonnay"', `"productNameBold": "${bold}"`)
      .replace('"productNameThin": "Scheuermann"', `"productNameThin": "${thin}"`)
      .replace('"producerName": "Scheuermann"', `"producerName": "${producerName}"`);
    expect(parseSystembolagetPage(page("Heinrich", "Leithaberg Blaufränkisch", "Weingut Heinrich"))).toMatchObject({ name: "Leithaberg Blaufränkisch", producer: "Heinrich" });
    expect(parseSystembolagetPage(page("Orange", "Arndorfer", "Weingut Arndorfer"))).toMatchObject({ name: "Orange", producer: "Arndorfer", wineType: "Orange" });
  });
  it("utan produktdata blir det inget", () => {
    expect(parseSystembolagetPage("<html></html>")).toBeUndefined();
  });
  it("artikelnummer ur långa och korta länkar", () => {
    expect(sbNumber("https://www.systembolaget.se/produkt/vin/fred-9323901/")).toBe("9323901");
    expect(sbNumber("https://www.systembolaget.se/94488")).toBe("94488");
    expect(sbNumber("https://www.flaskvis.se/produkt/x-123456/")).toBeUndefined();
  });
});

describe("Systembolaget i synken", () => {
  const old = wine({ id: "fred", slug: "fred", price: "250", systembolagetUrl: "https://www.systembolaget.se/produkt/vin/fred-9323901/" });

  it("gammalt vin med bara länk får pris, kontrolltid och erbjudande", () => {
    const { wines } = applySync([old], [feed([{ sourceId: "9323901", url: "https://www.systembolaget.se/produkt/vin/fred-9323901/", price: 260, inStock: true }])], NOW);
    expect(wines[0]).toMatchObject({ price: "260", sbCheckedAt: NOW, published: true, offers: [{ shop: "Systembolaget", price: 260, inStock: true }] });
  });
  it("slut på Systembolaget och ingen annanstans döljs, och kompassen visar det inte", () => {
    const { wines } = applySync([old], [feed([{ sourceId: "9323901", url: old.systembolagetUrl!, price: 250, inStock: false }])], NOW);
    expect(wines[0]).toMatchObject({ published: false, syncHidden: STOCK_HIDDEN });
    expect(toCompassWine({ ...wines[0], published: true })).toBeNull();
  });
  it("nytt vin från importlistan skapas med Systembolaget-länk", () => {
    const newWine = wine({ id: "sb-9448801", slug: "sb-9448801", name: "Friedelsheimer Rosengarten Chardonnay", producer: "Scheuermann", systembolagetUrl: "https://www.systembolaget.se/produkt/vin/friedelsheimer-rosengarten-chardonnay-9448801/", shop: "Systembolaget", source: "systembolaget.se", sourceId: "9448801" });
    const { wines, reports } = applySync([old], [feed([{ sourceId: "9448801", url: newWine.systembolagetUrl!, price: 371, inStock: true, newWine }])], NOW);
    expect(reports[0].added).toEqual(["sb-9448801"]);
    expect(wines.find((w) => w.slug === "sb-9448801")).toMatchObject({ published: true, offers: [{ shop: "Systembolaget", price: 371, inStock: true }] });
  });
});
