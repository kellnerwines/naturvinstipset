import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import type { Wine } from "./blob";
import {
  buildCatalog, importedWine, isOwnImportByRule, matchKey, mergeWines,
  migrateWine, normalize, parsePrice, type FoodEntry,
} from "./wineData";

const NOW = "2026-11-09T12:00:00.000Z";
const LATER = "2026-12-01T03:00:00.000Z";

function load<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(__dirname, "..", "data", file), "utf-8"));
}
const sb = load<Wine[]>("wines.json");
const vn = load<Wine[]>("wines-vinnatur.json");
const fv = load<Wine[]>("wines-flaskvis.json");
const food = load<Record<string, FoodEntry>>("food-systembolaget.json");

const VN = { source: "vinnatur.shop", autoProfile: true };
const FV = { source: "flaskvis.se", autoProfile: false };

function catalog(existing: Wine[] = [], now = NOW) {
  return buildCatalog({
    existing,
    systembolaget: sb,
    food,
    imports: [{ wines: vn, source: VN }, { wines: fv, source: FV }],
    now,
  });
}

function wine(p: Partial<Wine>): Wine {
  return {
    id: p.slug ?? "x", slug: "x", name: "X", producer: "P", country: "Portugal",
    wineType: "Vitt", description: "", adminRating: 4, createdAt: NOW, published: true,
    ...p,
  };
}

describe("hjälpfunktioner", () => {
  it("normaliserar diakritiska tecken och skiljetecken", () => {
    expect(normalize("Arinto na Ânfora")).toBe("arintonaanfora");
    expect(normalize("Champagne Émile Grados")).toBe("champagneemilegrados");
  });

  it("tolkar priser", () => {
    expect(parsePrice("246")).toBe(246);
    expect(parsePrice("246,50")).toBe(246.5);
    expect(parsePrice("ca 199 kr")).toBe(199);
    expect(parsePrice("")).toBeUndefined();
  });

  it("matchar Barroca White mot Flaskvis namn Vinho Branco", () => {
    const a = wine({ producer: "Barroca da Malhada", name: "Barroca White", year: "2023" });
    const b = wine({ producer: "Barroca da Malhada", name: "Vinho Branco", year: "2023" });
    expect(matchKey(a)).toBe(matchKey(b));
  });

  it("egen import enligt producentlistan och Systembolagets URL", () => {
    expect(isOwnImportByRule({ producer: "Adega Belem" })).toBe(true);
    expect(isOwnImportByRule({ producer: "X", systembolagetUrl: "https://www.systembolaget.se/produkt/vin/kellner-kellner-7610601/" })).toBe(true);
    expect(isOwnImportByRule({ producer: "Strekov 1075", systembolagetUrl: "https://www.systembolaget.se/produkt/vin/fred-9323901/" })).toBe(false);
  });
});

describe("migrering av Systembolaget-viner", () => {
  it("bygger en offer från systembolagetUrl och price utan att röra gamla fält", () => {
    const orig = sb.find((w) => w.slug === "fred-12-nv")!;
    const m = migrateWine(orig, food[orig.slug], NOW);
    expect(m.offers).toEqual([{
      shop: "Systembolaget", url: orig.systembolagetUrl, price: 260, inStock: true, lastSyncedAt: NOW,
    }]);
    expect(m.shop).toBe("Systembolaget");
    expect(m.foodPairing).toBe(food[orig.slug].foodPairing);
    for (const k of Object.keys(orig) as (keyof Wine)[]) expect(m[k]).toEqual(orig[k]);
  });

  it("är idempotent", () => {
    for (const w of sb) {
      const once = migrateWine(w, food[w.slug], NOW);
      expect(migrateWine(once, food[w.slug], LATER)).toEqual(once);
    }
  });

  it("regeln för egen import stämmer med flaggan i food-systembolaget.json", () => {
    for (const w of sb) {
      if (!food[w.slug]) continue;
      expect(isOwnImportByRule(w), w.slug).toBe(food[w.slug].ownImport ?? false);
    }
  });

  it("skriver inte över låsta fält", () => {
    const w = wine({ slug: "fred-12-nv", producer: "Barroca da Malhada", ownImport: false, lockedFields: ["ownImport", "foodPairing"] });
    const m = migrateWine(w, { foodPairing: "Ny text", ownImport: true }, NOW);
    expect(m.ownImport).toBe(false);
    expect(m.foodPairing).toBeUndefined();
  });
});

describe("import av webbutiksviner", () => {
  it("ger varje importerat vin en offer, sourceId och autoProfile", () => {
    const w = importedWine(vn[0], VN, NOW);
    expect(w.offers).toEqual([{ shop: "Vin & Natur", url: vn[0].shopUrl, price: parsePrice(vn[0].price), inStock: true, lastSyncedAt: NOW }]);
    expect(w.sourceId).toBe("champagne-des-copains-n-2");
    expect(w.autoProfile).toBe(true);
    expect(w.systembolagetUrl).toBeUndefined();
    expect(importedWine(fv[0], FV, NOW).autoProfile).toBe(false);
  });

  it("märker Flaskvis-vinerna som egen import", () => {
    for (const w of fv) expect(importedWine(w, FV, NOW).ownImport, w.slug).toBe(true);
  });
});

describe("sammanslagning av dubbletter", () => {
  const saroto = sb.find((w) => w.slug === "saroto-palhete-2024")!;
  const barroca = sb.find((w) => w.slug === "barroca-white-2023")!;
  const fvSaroto = wine({
    id: "fv-saroto-palhete", slug: "fv-saroto-palhete", name: "Saroto Palhete",
    producer: "Arribas Wine Company", year: "2024", price: "229", shop: "Flaskvis",
    shopUrl: "https://www.flaskvis.se/produkt/saroto-palhete/", grape: "Annan druva",
  });
  const fvBarroca = wine({
    id: "fv-vinho-branco", slug: "fv-vinho-branco", name: "Vinho Branco",
    producer: "Barroca da Malhada", year: "2023", price: "249", shop: "Flaskvis",
    shopUrl: "https://www.flaskvis.se/produkt/vinho-branco/",
  });

  it("Saroto Palhete och Barroca White blir ett vin med två offers", () => {
    const { wines, report } = buildCatalog({
      existing: [], systembolaget: [saroto, barroca], food,
      imports: [{ wines: [fvSaroto, fvBarroca], source: FV }], now: NOW,
    });
    expect(wines).toHaveLength(2);
    const s = wines.find((w) => w.slug === saroto.slug)!;
    expect(s.offers?.map((o) => [o.shop, o.price])).toEqual([["Systembolaget", 246], ["Flaskvis", 229]]);
    expect(s.shop).toBe("Systembolaget");
    expect(s.grape).toBe(saroto.grape); // befintligt värde skrivs inte över
    expect(wines.find((w) => w.slug === barroca.slug)!.offers).toHaveLength(2);
    expect(report.merged).toEqual([
      { into: saroto.slug, from: fvSaroto.slug },
      { into: barroca.slug, from: fvBarroca.slug },
    ]);
  });

  it("uppdaterar inte låsta offers", () => {
    const locked = { ...migrateWine(saroto, food[saroto.slug], NOW), lockedFields: ["offers"] };
    const { wines } = mergeWines([locked], [importedWine(fvSaroto, FV, NOW)]);
    expect(wines[0].offers).toHaveLength(1);
  });
});

describe("hela katalogen", () => {
  it("innehåller alla viner, unika slugs och en offer per vin", () => {
    const { wines } = catalog();
    expect(wines.length).toBeGreaterThanOrEqual(sb.length + fv.length);
    expect(wines.length).toBeLessThanOrEqual(sb.length + vn.length + fv.length);
    expect(new Set(wines.map((w) => w.slug)).size).toBe(wines.length);
    expect(new Set(wines.map((w) => w.id)).size).toBe(wines.length);
    for (const w of wines) {
      expect(w.offers?.length, w.slug).toBeGreaterThan(0);
      expect(w.shop, w.slug).toBeTruthy();
      for (const o of w.offers!) expect(o.price, w.slug).toBeGreaterThan(0);
    }
  });

  it("kan köras två gånger utan dubbletter och utan ändringar", () => {
    const first = catalog();
    const second = catalog(first.wines, LATER);
    expect(second.wines).toEqual(first.wines);
    expect(second.report.added).toEqual([]);
    expect(second.report.updated).toEqual([]);
  });

  it("bevarar admins ändringar i ett befintligt vin", () => {
    const first = catalog();
    const edited = first.wines.map((w) =>
      w.slug === "fv-arinto"
        ? { ...w, foodPairing: "Admins text", grape: "Arinto (rättad)", lockedFields: ["foodPairing", "grape"] }
        : w,
    );
    const again = catalog(edited, LATER).wines.find((w) => w.slug === "fv-arinto")!;
    expect(again.foodPairing).toBe("Admins text");
    expect(again.grape).toBe("Arinto (rättad)");
  });
});
