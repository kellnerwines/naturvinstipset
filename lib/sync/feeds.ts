// Hämtning från webbutikerna för synken (BRIEF-KOMPASSEN.md, 6.1–6.2).
// Snäll mot butikerna: egen user-agent, få samtidiga anrop, väntar enligt
// Retry-After vid 429 och ger upp i tid så att funktionen hinner spara.

import type { Wine } from "../blob";
import { mapLimit, USER_AGENT } from "../wineImages";
import type { FeedItem, ShopFeed } from "./apply";
import {
  REGION_COUNTRY, deriveWineType, findGrapes, flaskvisWineType, heuristicProfile, htmlText, isVinNaturWine,
  parseFlaskvisPage, parseVinNaturPage, splitOrigin, tagList, vinNaturVariant, wooPrice,
  type ShopifyProduct, type WooProduct,
} from "./parse";

export const VIN_NATUR = "Vin & Natur";
export const FLASKVIS = "Flaskvis";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET med user-agent, timeout och upp till tre försök vid 429/5xx. Ger upp när deadline närmar sig. */
export async function politeFetch(url: string, deadline: number, accept = "text/html"): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    const left = deadline - Date.now();
    if (left < 2000) throw new Error("tiden tog slut");
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: accept },
      signal: AbortSignal.timeout(Math.min(20000, left - 1000)),
      cache: "no-store",
    });
    if (res.ok) return res;
    if ((res.status === 429 || res.status >= 500) && attempt < 2) {
      const ra = Number(res.headers.get("retry-after"));
      const wait = (Number.isFinite(ra) && ra > 0 ? ra * 1000 : 5000 * (attempt + 1));
      if (Date.now() + wait + 3000 > deadline) throw new Error(`HTTP ${res.status}, hinner inte vänta ${Math.round(wait / 1000)} s`);
      await sleep(wait);
      continue;
    }
    throw new Error(`HTTP ${res.status}`);
  }
}

const splitYear = (title: string) => {
  const m = title.match(/^(.*?)[\s,]+((?:19|20)\d{2})$/);
  return m ? { name: m[1].trim(), year: m[2] } : { name: title.trim(), year: "NV" };
};

const typeWord: Record<string, string> = { "Rött": "rött vin", "Vitt": "vitt vin", Orange: "orangevin", "Rosé": "rosévin", Mousserande: "mousserande vin", "Pét Nat": "pét-nat" };
const describe = (type: string, region: string | undefined, grapes: string[]) =>
  `Ett ${typeWord[type] ?? "vin"}${region ? ` från ${region}` : ""}${grapes.length ? ` på ${grapes.join(", ").toLowerCase()}` : ""}.`;

function baseWine(now: string): Omit<Wine, "id" | "slug" | "name" | "producer" | "country" | "wineType" | "description"> {
  return { adminRating: 0, createdAt: now, published: true, galleryImages: [], flavorTags: [], wineOfMonth: false };
}

// ─── Vin & Natur ──────────────────────────────────────────────────────────────

/**
 * Hämtar produktlistan sidvis och läser produktsidorna (skattetext, region, producent).
 * Produktsidor för viner som inte redan finns läses först, eftersom de behövs för att skapa vinet.
 */
export async function vinNaturFeed(known: Set<string>, deadline: number, now: string): Promise<ShopFeed> {
  const feed: ShopFeed = { shop: VIN_NATUR, source: "vinnatur.shop", complete: false, items: [], errors: [] };
  const products: ShopifyProduct[] = [];
  try {
    for (let page = 1; page <= 20; page++) {
      const res = await politeFetch(`https://vinnatur.shop/products.json?limit=250&page=${page}`, deadline, "application/json");
      const batch = ((await res.json()) as { products: ShopifyProduct[] }).products ?? [];
      if (!batch.length) { feed.complete = true; break; }
      products.push(...batch);
    }
  } catch (e) {
    feed.errors.push(`Produktlistan: ${(e as Error).message}`);
  }

  // Nya viner tas bara med om de finns i lager (6.1). Kända viner följs även när de är slut.
  const wines = products
    .filter((p) => isVinNaturWine(p) && (known.has(p.handle) || vinNaturVariant(p)!.available))
    .sort((a, b) => Number(known.has(a.handle)) - Number(known.has(b.handle)));
  let pageErrors = 0;
  // Ett anrop i taget med paus: butiken svarar annars 429.
  feed.items = await mapLimit(wines, 1, async (p): Promise<FeedItem> => {
    const v = vinNaturVariant(p)!;
    const url = `https://vinnatur.shop/products/${p.handle}`;
    const item: FeedItem = { sourceId: p.handle, url, price: v.price, inStock: v.available };
    let page: ReturnType<typeof parseVinNaturPage>;
    try {
      await sleep(400);
      page = parseVinNaturPage(await (await politeFetch(url, deadline)).text());
    } catch (e) {
      if (++pageErrors <= 5) feed.errors.push(`${p.handle}: produktsidan ${(e as Error).message}`);
      return item;
    }
    item.taxIncluded = page.taxIncluded;
    if (known.has(p.handle)) return item;

    const text = htmlText(p.body_html ?? "");
    const tags = tagList(p.tags);
    const grapes = findGrapes(`${p.title} ${text}`);
    const wineType = deriveWineType(`${p.title} ${text}`, tags, grapes);
    if (!page.region || !page.producer || !wineType) {
      feed.errors.push(`${p.handle}: kunde inte avgöra ${[!page.region && "region", !page.producer && "producent", !wineType && "färg"].filter(Boolean).join(", ")}, skapas inte`);
      return item;
    }
    const { name, year } = splitYear(p.title);
    const id = `vn-${p.handle}`;
    item.newWine = {
      ...baseWine(now), ...heuristicProfile(text, wineType),
      id, slug: id, name, year, producer: page.producer, region: page.region,
      country: REGION_COUNTRY[page.region] ?? "", grape: grapes.join(", "), wineType,
      price: String(v.price), shop: VIN_NATUR, shopUrl: url,
      description: describe(wineType, page.region, grapes),
      primaryImageUrl: p.images?.[0]?.src, source: `vinnatur.shop (synk ${now.slice(0, 10)})`, sourceId: p.handle,
      autoProfile: true,
    };
    return item;
  });
  if (pageErrors > 5) feed.errors.push(`… och ${pageErrors - 5} produktsidor till gick inte att läsa (skattetexten kontrolleras nästa gång)`);
  return feed;
}

// ─── Flaskvis ────────────────────────────────────────────────────────────────

/** Store API sidvis, sedan produktsidan för varje produkt: naturviner (stilen "Natur") och Kellner & Kellners viner tas med. */
export async function flaskvisFeed(known: Set<string>, deadline: number, now: string): Promise<ShopFeed> {
  const feed: ShopFeed = { shop: FLASKVIS, source: "flaskvis.se", complete: false, items: [], errors: [] };
  const products: WooProduct[] = [];
  try {
    for (let page = 1; page <= 20; page++) {
      const res = await politeFetch(`https://www.flaskvis.se/wp-json/wc/store/v1/products?per_page=100&page=${page}`, deadline, "application/json");
      const batch = (await res.json()) as WooProduct[];
      products.push(...batch);
      if (batch.length < 100) { feed.complete = true; break; }
    }
  } catch (e) {
    feed.errors.push(`Produktlistan: ${(e as Error).message}`);
  }

  const items = await mapLimit(products, 3, async (p): Promise<FeedItem | null> => {
    if (!known.has(p.slug) && !p.is_in_stock) return null; // nya viner bara om de finns i lager
    let page: ReturnType<typeof parseFlaskvisPage>;
    try {
      page = parseFlaskvisPage(await (await politeFetch(p.permalink, deadline)).text());
    } catch (e) {
      // Kända viner räknas som sedda så att de inte markeras som slut för att sidan inte svarade.
      if (known.has(p.slug)) { feed.errors.push(`${p.slug}: produktsidan ${(e as Error).message}`); return { sourceId: p.slug, url: p.permalink, price: wooPrice(p), inStock: p.is_in_stock }; }
      return null;
    }
    // Alla naturviner från Flaskvis (beslut 2026-11-10), Kellner & Kellners viner även om de inte är märkta.
    if (!page.natural && !page.kellner) return null;
    const item: FeedItem = { sourceId: p.slug, url: p.permalink, price: wooPrice(p), inStock: p.is_in_stock };
    if (known.has(p.slug)) return item;

    const text = page.description ?? "";
    const wineType = flaskvisWineType(page.style, page.grapes, text);
    if (!page.producer || !wineType) {
      feed.errors.push(`${p.slug}: kunde inte avgöra ${!page.producer ? "producent" : "färg"}, skapas inte`);
      return item;
    }
    const id = `fv-${p.slug}`;
    const flavorTags = page.style.filter((s) => !/^(natur|stilla|rött|vitt|orange|rosé|mousserande)$/i.test(s)).flatMap((s) => s.split(/\s*&\s*/)).slice(0, 4);
    item.newWine = {
      ...baseWine(now),
      id, slug: id, name: decodeName(p.name), year: page.year ?? "NV", producer: page.producer,
      ...splitOrigin(page.region), grape: page.grapes.join(", "),
      wineType, price: String(wooPrice(p)), shop: FLASKVIS, shopUrl: p.permalink,
      description: describe(wineType, splitOrigin(page.region).region, page.grapes),
      syra: page.values.syra, fyllighet: page.values.fyllighet, funk: page.values.funk, stravhet: page.values.stravhet,
      flavorTags, primaryImageUrl: p.images?.[0]?.src,
      source: `flaskvis.se (synk ${now.slice(0, 10)}, smakprofil från Flaskvis)`, sourceId: p.slug, autoProfile: false,
    };
    return item;
  });
  feed.items = items.filter((x): x is FeedItem => !!x);
  return feed;
}

const decodeName = (s: string) => htmlText(s);
