import { describe, expect, it } from "vitest";
import type { Wine } from "../blob";
import { applySync, STOCK_HIDDEN, TAX_HIDDEN, type ShopFeed } from "./apply";
import { deriveFoodCategories, fillFoodCategories } from "./food";
import {
  deriveWineType, findGrapes, flaskvisScale, parseFlaskvisPage, parseVinNaturPage, splitOrigin, vinNaturVariant,
  isPhilipsonBottle, philipsonName, philipsonProducer, philipsonWineType, isWineTradeBottle, parseWineTradeProduct,
  isJustWineBottle, parseJustWineProduct, JUST_WINE_TAX_TEXT,
  type PhilipsonProduct, type ShopifyProduct,
} from "./parse";

const NOW = "2026-12-01T02:00:00.000Z";
const LATER = "2027-01-01T02:00:00.000Z";

const wine = (o: Partial<Wine>): Wine => ({
  id: "x", slug: "x", name: "X", producer: "P", country: "Frankrike", wineType: "Vitt", description: "",
  adminRating: 0, createdAt: NOW, published: true, ...o,
});

describe("tolkning", () => {
  it("druvor matchas med ordgränser", () => {
    expect(findGrapes("Från Côte de Brouilly")).toEqual([]);
    expect(findGrapes("Gjort på Côt och Gamay")).toEqual(["Gamay", "Côt"]);
    expect(findGrapes("100 % Pinot Gris")).toEqual(["Pinot Gris"]);
  });

  it("färg i briefens prioritet", () => {
    expect(deriveWineType("ett vin", ["Bubbel"], ["Chenin Blanc"])).toBe("Mousserande");
    expect(deriveWineType("en pet nat på gamay", [], ["Gamay"])).toBe("Pét Nat");
    expect(deriveWineType("en rosado från Granada", [], ["Garnacha"])).toBe("Rosé");
    expect(deriveWineType("blanc de noirs, stilla", [], ["Pinot Noir"])).toBe("Vitt");
    expect(deriveWineType("mörka bär", [], ["Syrah", "Gamay"])).toBe("Rött");
    expect(deriveWineType("två veckors skalkontakt", [], ["Riesling"])).toBe("Orange");
    expect(deriveWineType("citrus", [], ["Riesling"])).toBe("Vitt");
    expect(deriveWineType("rosmarin och timjan", [], ["Syrah"])).toBe("Rött");
    expect(deriveWineType("blandat", [], ["Syrah", "Riesling"])).toBeUndefined();
  });

  it("Vin & Natur: pris från 1 flaska, stora flaskor tas inte med", () => {
    const p = (title: string, variants: ShopifyProduct["variants"]): ShopifyProduct =>
      ({ handle: "h", title, product_type: "Vin", tags: [], body_html: "", variants });
    expect(vinNaturVariant(p("Vin", [{ title: "6 flaskor", price: "1200.00", available: true }, { title: "1 flaska", price: "219.00", available: false }])))
      .toEqual({ price: 219, available: false });
    expect(vinNaturVariant(p("Vin", [{ title: "Default Title", price: "0.00", available: true }]))).toBeUndefined();
  });

  it("Vin & Natur: brödsmulor och skattetext", () => {
    const html = `<nav class="breadcrumbs"><a href="/collections/loire">Loire</a> › <a href="/collections/hodgson">Mai &amp; Kenji Hodgson</a> › <span>FXAUS</span></nav>
      <p>Pris 245 kr. Moms och alkoholskatt&nbsp;inkluderad.</p>`;
    expect(parseVinNaturPage(html)).toEqual({ taxIncluded: true, region: "Loire", producer: "Mai & Kenji Hodgson" });
    const s = parseVinNaturPage(`<nav><a href="/c/s">Strohmeier</a> › <a href="/c/x">Lestoa</a></nav><p>Moms ingår</p>`);
    expect(s).toEqual({ taxIncluded: false, region: "Steiermark", producer: "Strohmeier" });
  });

  it("Flaskvis: importör, smakvärden, årgång och region", () => {
    const html = `<span class="country">Lissabon</span><h1>Touriga Nacional</h1><ul class="wine-volume-meta"><li>2024</li><li>750 ml</li></ul>
      <div class="product-text">Mörka bär och kryddor.</div>
      <div class="meta-row"><label class="icon druvor">Druvor</label><div class="meta-items"> <span>Touriga Nacional</span></div></div>
      <div class="meta-row"><label class="icon stil">Stil</label><div class="meta-items"> <span>Kryddigt &amp; Mustigt</span> <span>Rött</span></div></div>
      <div class="flaskor-values"><div class="row torr-40"></div><div class="row fyllighet-90"></div><div class="row funk-0"></div><div class="row stravhet-70"></div></div>
      <div class="items" data-section="producer"><h3 class="no-max-width">Desviso Vinhos</h3></div>
      <div class="items" data-section="supplier"><h3>Kellner &amp; Kellner</h3></div>`;
    const p = parseFlaskvisPage(html);
    expect(p).toMatchObject({
      kellner: true, region: "Lissabon", year: "2024", grapes: ["Touriga Nacional"], producer: "Desviso Vinhos",
      values: { syra: 2, fyllighet: 5, funk: 1, stravhet: 4 },
    });
    expect(p.natural).toBe(false);
    expect(p.importer).toBe("Kellner & Kellner");
    expect(parseFlaskvisPage(html.replace("Kellner &amp; Kellner", "Annan Import AB")).kellner).toBe(false);
    expect(parseFlaskvisPage(html.replace("<span>Rött</span>", "<span>Natur</span> <span>Rött</span>")).natural).toBe(true);
    expect(flaskvisScale(0)).toBe(1);
    expect(splitOrigin("Sydafrika - Western Cape")).toEqual({ country: "Sydafrika", region: "Western Cape" });
    expect(splitOrigin("Terra Alta")).toEqual({ country: "Spanien", region: "Terra Alta" });
    expect(splitOrigin("Lissabon")).toEqual({ country: "Portugal", region: "Lissabon" });
  });
});

describe("Philipson Wine", () => {
  const p = (o: Partial<PhilipsonProduct>): PhilipsonProduct => ({
    name: "2023 Rethink Riesling Mosel Schmitt Söhne", link: "/produkter/rethink-riesling", priceDouble: 189.95,
    stockText: "På lager", availableForPurchase: true, type: "Vitt vin", country: "Tyskland", area: "Mosel",
    year: "2023", bottleSizeCl: "75", googleImpression: JSON.stringify({ brand: "Schmitt Söhne" }), ...o,
  });
  it("namn utan årgång och producent", () => {
    const x = p({});
    expect(philipsonProducer(x)).toBe("Schmitt Söhne");
    expect(philipsonName(x, "Schmitt Söhne")).toBe("Rethink Riesling Mosel");
  });
  it("vintyp, orange ur beskrivningen och pet nat ur namnet", () => {
    expect(philipsonWineType(p({}), "frisk citrus")).toBe("Vitt");
    expect(philipsonWineType(p({}), "två veckors skalkontakt")).toBe("Orange");
    expect(philipsonWineType(p({ type: "Rött vin" }), "")).toBe("Rött");
    expect(philipsonWineType(p({ type: "Mousserende", name: "PET' NAT' Pétillant Naturel" }), "")).toBe("Pét Nat");
    expect(philipsonWineType(p({ type: "Champagne" }), "")).toBe("Mousserande");
    expect(philipsonWineType(p({ type: "Rött vin", name: "2023 Sanctum Pet Nat, Pinot Noir" }), "")).toBe("Pét Nat");
  });
  it("bara 75 cl", () => {
    expect(isPhilipsonBottle(p({}))).toBe(true);
    expect(isPhilipsonBottle(p({ bottleSizeCl: "150" }))).toBe(false);
  });
});

describe("Just Wine", () => {
  const p = (o: Partial<ShopifyProduct>): ShopifyProduct => ({
    handle: "x", title: "2023 Saint Jean du Barroux La Pierre Noire", product_type: "", tags: ["Frankrike", "vinflaska"], vendor: "Saint Jean du Barroux",
    body_html: "<p>Mörkt och kryddigt.</p><p>Producent: Saint Jean du Barroux</p><p>Druva: Grenache och syrah</p><p>Region: Ventoux, Södra Rhone-dalen</p><p>Odling: Ekologisk</p>",
    variants: [{ title: "Default Title", price: "389.00", available: true }], ...o,
  });
  it("producent ur butikens fält, druvor och region ur faktadelen, land ur taggarna", () => {
    expect(parseJustWineProduct(p({}))).toMatchObject({ producer: "Saint Jean du Barroux", name: "La Pierre Noire", year: "2023", region: "Södra Rhone-dalen", country: "Frankrike", wineType: "Rött", grapes: ["Grenache", "Syrah"] });
  });
  it("bubbel och felstavad producent", () => {
    const x = parseJustWineProduct(p({ title: "2024 Il Farneto Frisant Rosso", vendor: "Il Farneto", tags: ["Italien", "vinflaska"], body_html: "<p>Rött och bubblande.</p><p>Druva: Olika lambruscodruvor</p>" }));
    expect(x).toMatchObject({ producer: "Il Farneto", name: "Frisant Rosso", wineType: "Mousserande", country: "Italien" });
    expect(parseJustWineProduct(p({ title: "Ciallarosso 2021", vendor: "Rochi di Cialla", tags: ["Italien", "vinflaska"] })).producer).toBe("Ronchi di Cialla");
  });
  it("bara flaskor, och skattetexten känns igen", () => {
    expect(isJustWineBottle(p({}))).toBe(true);
    expect(isJustWineBottle(p({ title: "Vinterlådan 2026", tags: ["vinlåda"] }))).toBe(false);
    expect(JUST_WINE_TAX_TEXT.test("Ordinarie pris 242 SEK Inklusive moms och svensk alkoholskatt.")).toBe(true);
  });
});

describe("Wine Trade", () => {
  const p = (o: Partial<ShopifyProduct>): ShopifyProduct => ({
    handle: "x", title: "Dard & Ribo, Crozes-Hermitage 2024", product_type: "Rött", tags: [],
    body_html: "<p>Crozes-Hermitages, Dard &amp; Ribo, Rhône, Frankrike<br>Syrah</p><p>Även de vita vinerna på Marsanne och Roussanne.</p>",
    variants: [{ title: "Default Title", price: "549.00", available: true }], ...o,
  });
  it("producent ur listan, druvor bara ur första stycket", () => {
    expect(parseWineTradeProduct(p({}))).toMatchObject({ producer: "Dard & Ribo", name: "Crozes-Hermitage", year: "2024", region: "Rhône", country: "Frankrike", wineType: "Rött", grapes: ["Syrah"] });
  });
  it("producent sist i titeln, region och land tas bort ur namnet", () => {
    const x = parseWineTradeProduct(p({ title: "Samodia, Rosato Frizzante, Emilia-Romagna", product_type: "", body_html: "<p>Samodia, Rosato Frizzante, Emilia-Romagna</p>" }));
    expect(x).toMatchObject({ producer: "Samodia", name: "Rosato Frizzante", country: "Italien", wineType: "Mousserande" });
  });
  it("färg ur Rouge och Tinto när druvorna inte räcker", () => {
    expect(parseWineTradeProduct(p({ title: "Benje Tinto, Envinate", product_type: "", body_html: "<p>Benje Tinto 2022, Envinate, Teneriffa, Spanien</p>" }))).toMatchObject({ producer: "Envinate", wineType: "Rött", country: "Spanien" });
  });
  it("okänd producent ger ingen producent", () => {
    expect(parseWineTradeProduct(p({ title: "Okänd, Vin 2024", body_html: "<p>Okänd</p>" })).producer).toBeUndefined();
  });
  it("lådor och trepack är inte enskilda viner", () => {
    expect(isWineTradeBottle(p({}))).toBe(true);
    expect(isWineTradeBottle(p({ title: "Höstlåda #1" }))).toBe(false);
    expect(isWineTradeBottle(p({ title: "Champagne 3 pack", variants: [{ title: "Default Title", price: "3790.00", available: true }] }))).toBe(false);
  });
});

describe("synkregler", () => {
  const url = "https://vinnatur.shop/products/fxaus-2024";
  const existing = [
    wine({
      id: "vn-fxaus-2024", slug: "vn-fxaus-2024", name: "FXAUS", shop: "Vin & Natur", price: "245",
      source: "vinnatur.shop", sourceId: "fxaus-2024",
      offers: [{ shop: "Vin & Natur", url, price: 245, inStock: true, lastSyncedAt: NOW }],
    }),
    wine({
      id: "vn-gone", slug: "vn-gone", name: "Gone", shop: "Vin & Natur", source: "vinnatur.shop", sourceId: "gone",
      offers: [{ shop: "Vin & Natur", url: "https://vinnatur.shop/products/gone", price: 199, inStock: true, lastSyncedAt: NOW }],
    }),
    wine({ id: "sb", slug: "sb", name: "SB", offers: [{ shop: "Systembolaget", url: "https://sb/1", price: 150, inStock: true, lastSyncedAt: NOW }] }),
  ];
  const newWine = wine({ id: "vn-ny", slug: "vn-ny", name: "Ny", producer: "Q", shop: "Vin & Natur", source: "vinnatur.shop", sourceId: "ny" });
  const feed = (o: Partial<ShopFeed> = {}): ShopFeed => ({
    shop: "Vin & Natur", source: "vinnatur.shop", complete: true, errors: [],
    items: [
      { sourceId: "fxaus-2024", url, price: 255, inStock: true, taxIncluded: true },
      { sourceId: "ny", url: "https://vinnatur.shop/products/ny", price: 300, inStock: true, taxIncluded: true, newWine },
    ],
    ...o,
  });

  it("uppdaterar pris, skapar nytt vin och markerar saknade som slut", () => {
    const { wines, reports } = applySync(existing, [feed()], LATER);
    const r = reports[0];
    expect(r.added).toEqual(["vn-ny"]);
    expect(r.outOfStock).toEqual(["vn-gone"]);
    const fx = wines.find((w) => w.id === "vn-fxaus-2024")!;
    expect(fx.offers![0]).toMatchObject({ price: 255, inStock: true, lastSyncedAt: LATER });
    expect(fx.price).toBe("255");
    expect(wines.find((w) => w.id === "vn-ny")).toMatchObject({ published: true, offers: [{ shop: "Vin & Natur", price: 300 }] });
    expect(wines.find((w) => w.id === "sb")!.offers![0].inStock).toBe(true);
  });

  it("två körningar ger inga dubbletter och inga nya ändringar", () => {
    const first = applySync(existing, [feed()], LATER);
    const second = applySync(first.wines, [feed()], LATER);
    expect(second.wines).toHaveLength(first.wines.length);
    expect(second.reports[0]).toMatchObject({ added: [], changed: [], outOfStock: [] });
  });

  it("två produkter för samma vin i samma butik skriver inte över varandra", () => {
    const dup = feed({ items: [
      { sourceId: "fxaus-2024", url, price: 255, inStock: true },
      { sourceId: "fxaus-2024-b", url: "https://vinnatur.shop/products/fxaus-2024-b", price: 999, inStock: true,
        newWine: wine({ id: "vn-fxaus-2024-b", slug: "vn-fxaus-2024-b", name: "FXAUS", producer: "P" }) },
    ] });
    const a = applySync(existing, [dup], LATER);
    const b = applySync(a.wines, [dup], LATER);
    expect(b.wines.find((w) => w.id === "vn-fxaus-2024")!.offers![0].price).toBe(255);
    expect(b.reports[0].changed).toEqual([]);
  });

  it("ofullständig produktlista markerar inget som slut", () => {
    const { reports } = applySync(existing, [feed({ complete: false })], LATER);
    expect(reports[0].outOfStock).toEqual([]);
  });

  it("låsta fält skrivs aldrig över", () => {
    const locked = existing.map((w) => (w.id === "vn-fxaus-2024" ? { ...w, lockedFields: ["offers", "price"] } : w));
    const { wines } = applySync(locked, [feed()], LATER);
    const fx = wines.find((w) => w.id === "vn-fxaus-2024")!;
    expect(fx.offers![0].price).toBe(245);
    expect(fx.price).toBe("245");
  });

  it("saknad skattetext avpublicerar, och vinet publiceras igen när den finns tillbaka", () => {
    const noTax = feed({ items: [{ sourceId: "fxaus-2024", url, price: 245, inStock: true, taxIncluded: false }] });
    const a = applySync(existing, [noTax], LATER);
    const fx = a.wines.find((w) => w.id === "vn-fxaus-2024")!;
    expect(fx).toMatchObject({ published: false, syncHidden: TAX_HIDDEN });
    expect(a.alerts[0]).toContain("avpublicerades");

    const b = applySync(a.wines, [feed()], LATER);
    const back = b.wines.find((w) => w.id === "vn-fxaus-2024")!;
    expect(back.published).toBe(true);
    expect(back.syncHidden).toBeUndefined();
  });

  it("ett vin som admin själv har avpublicerat publiceras inte av synken", () => {
    const manual = existing.map((w) => (w.id === "vn-fxaus-2024" ? { ...w, published: false } : w));
    const { wines } = applySync(manual, [feed()], LATER);
    expect(wines.find((w) => w.id === "vn-fxaus-2024")!.published).toBe(false);
  });

  it("slut i alla butiker döljs, och visas igen när det finns i lager", () => {
    const first = applySync(existing, [feed()], LATER);
    expect(first.wines.find((w) => w.slug === "vn-gone")).toMatchObject({ published: false, syncHidden: STOCK_HIDDEN });
    expect(first.reports[0].unpublished).toEqual(["vn-gone"]);
    expect(first.wines.find((w) => w.slug === "sb")!.published).toBe(true);
    const back = feed({ items: [...feed().items, { sourceId: "gone", url: "https://vinnatur.shop/products/gone", price: 199, inStock: true }] });
    const second = applySync(first.wines, [back], LATER);
    expect(second.wines.find((w) => w.slug === "vn-gone")).toMatchObject({ published: true });
    expect(second.wines.find((w) => w.slug === "vn-gone")!.syncHidden).toBeUndefined();
    expect(second.reports[0].republished).toEqual(["vn-gone"]);
  });
  it("slut i webbutiken men kvar på Systembolaget döljs inte", () => {
    const both = existing.map((w) => (w.slug === "vn-gone" ? { ...w, systembolagetUrl: "https://www.systembolaget.se/produkt/vin/x-1/" } : w));
    expect(applySync(both, [feed()], LATER).wines.find((w) => w.slug === "vn-gone")!.published).toBe(true);
  });

  it("nytt vin som redan finns hos Systembolaget får ett extra erbjudande i stället för en dubblett", () => {
    const sbWine = wine({ id: "sb-ny", slug: "ny-2024", name: "Ny", producer: "Q", year: "2024",
      offers: [{ shop: "Systembolaget", url: "https://sb/2", price: 280, inStock: true, lastSyncedAt: NOW }] });
    const inc = { ...newWine, year: "2024" };
    const { wines, reports } = applySync([sbWine], [feed({ items: [{ sourceId: "ny", url: "https://vinnatur.shop/products/ny", price: 300, inStock: true, taxIncluded: true, newWine: inc }] })], LATER);
    expect(wines).toHaveLength(1);
    expect(wines[0].offers!.map((o) => o.shop)).toEqual(["Systembolaget", "Vin & Natur"]);
    expect(reports[0].added).toEqual([]);
  });
});

describe("matkategorier ur druva, färg och land", () => {
  it("rött, vitt, orange och bubbel", () => {
    expect(deriveFoodCategories({ wineType: "Rött", grape: "Touriga Nacional", country: "Portugal" })).toEqual(["kott", "flask"]);
    expect(deriveFoodCategories({ wineType: "Rött", grape: "Gamay", country: "Frankrike" })).toEqual(["fagel", "vego"]);
    expect(deriveFoodCategories({ wineType: "Vitt", grape: "Gewürztraminer", country: "Frankrike", region: "Alsace" })).toEqual(["kryddigt", "vego", "flask"]);
    expect(deriveFoodCategories({ wineType: "Vitt", grape: "Arinto", country: "Portugal" })).toEqual(["fisk", "vego"]);
    expect(deriveFoodCategories({ wineType: "Orange", grape: "Kharji", country: "Armenien", stravhet: 3 })).toEqual(["vego", "kryddigt", "fagel"]);
    expect(deriveFoodCategories({ wineType: "Mousserande", country: "Frankrike", region: "Champagne" })).toEqual(["aperitif", "fisk", "ost"]);
  });

  it("fyller bara i viner som saknar kategorier och rör inte låsta", () => {
    const ws = [
      wine({ id: "a", slug: "a", wineType: "Rött", grape: "Syrah" }),
      wine({ id: "b", slug: "b", foodCategories: ["ost"] }),
      wine({ id: "c", slug: "c", lockedFields: ["foodCategories"] }),
    ];
    expect(fillFoodCategories(ws)).toEqual(["a"]);
    expect(ws[0].foodCategories).toEqual(["kott", "flask"]);
    expect(ws[1].foodCategories).toEqual(["ost"]);
    expect(ws[2].foodCategories).toBeUndefined();
  });
});
