// Synkens regler (BRIEF-KOMPASSEN.md, 6.3): uppdatera pris och lager per
// butik, skapa nya viner, markera slutsålda och avpublicera vid saknad
// skattetext. Ren funktion utan I/O. Kan köras flera gånger med samma indata
// utan dubbletter, och skriver aldrig över fält i lockedFields.

import type { Offer, Wine } from "../blob";
import { isLocked, matchKey, mergeWines } from "../wineData";

export type FeedItem = {
  /** Butikens handle/slug. */
  sourceId: string;
  url: string;
  price: number;
  inStock: boolean;
  /** Skattetexten på produktsidan. undefined = inte kontrollerad den här gången. */
  taxIncluded?: boolean;
  /** Svensk importör enligt butiken. Uppdateras på befintliga viner om den ändrats. */
  importer?: string;
  /** Komplett vin att skapa om det inte redan finns. Saknas när sidan inte gick att läsa. */
  newWine?: Wine;
};

export type ShopFeed = {
  shop: string;
  /** t.ex. "vinnatur.shop" – jämförs med början av Wine.source. */
  source: string;
  /** Hela produktlistan hämtades. Annars markeras inga saknade viner som slut. */
  complete: boolean;
  items: FeedItem[];
  errors: string[];
};

export type ShopReport = {
  shop: string;
  seen: number;
  added: string[];
  changed: string[];
  outOfStock: string[];
  backInStock: string[];
  unpublished: string[];
  republished: string[];
  errors: string[];
};

export const TAX_HIDDEN = "Skattetexten saknas på butikens produktsida";
export const STOCK_HIDDEN = "Slut i alla butiker";

const atSystembolaget = (w: Wine) => !!w.systembolagetUrl || (w.offers ?? []).some((o) => o.shop === "Systembolaget");

const normUrl = (u: string) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/+$/, "").toLowerCase();

function findExisting(wines: Wine[], feed: ShopFeed, item: FeedItem): number {
  const url = normUrl(item.url);
  const byOffer = wines.findIndex((w) => w.offers?.some((o) => o.shop === feed.shop && normUrl(o.url) === url));
  if (byOffer > -1) return byOffer;
  const bySource = wines.findIndex((w) => w.sourceId === item.sourceId && (w.source ?? "").startsWith(feed.source));
  if (bySource > -1) return bySource;
  return item.newWine ? wines.findIndex((w) => w.id === item.newWine!.id) : -1;
}

function setOffer(w: Wine, shop: string, next: Offer): { wine: Wine; changed: boolean; was?: Offer } {
  if (isLocked(w, "offers")) return { wine: w, changed: false };
  const offers = [...(w.offers ?? [])];
  const i = offers.findIndex((o) => o.shop === shop);
  const was = i > -1 ? offers[i] : undefined;
  const changed = !was || was.price !== next.price || was.inStock !== next.inStock || normUrl(was.url) !== normUrl(next.url);
  if (i > -1) offers[i] = next; else offers.push(next);
  const wine: Wine = { ...w, offers };
  if (wine.shop === shop && !isLocked(wine, "price") && String(next.price) !== String(wine.price)) wine.price = String(next.price);
  return { wine, changed, was };
}

export function applySync(existing: Wine[], feeds: ShopFeed[], now: string): { wines: Wine[]; reports: ShopReport[]; alerts: string[] } {
  let wines = existing.map((w) => ({ ...w }));
  const reports: ShopReport[] = [];
  const alerts: string[] = [];

  for (const feed of feeds) {
    const r: ShopReport = {
      shop: feed.shop, seen: feed.items.length, added: [], changed: [], outOfStock: [], backInStock: [],
      unpublished: [], republished: [], errors: [...feed.errors],
    };
    const seen = new Set<number>();

    for (const item of feed.items) {
      let idx = findExisting(wines, feed, item);

      if (idx === -1) {
        if (!item.newWine) continue; // feeds.ts har redan loggat varför vinet inte kunde skapas
        if (item.taxIncluded === false) { alerts.push(`${feed.shop}: ${item.sourceId} saknar skattetext, skapas inte`); continue; }
        const twin = wines.findIndex((w) => matchKey(w) === matchKey(item.newWine!));
        if (twin > -1 && seen.has(twin)) continue; // samma vin har redan fått butikens erbjudande i den här körningen
        const before = wines.length;
        const res = mergeWines(wines, [{ ...item.newWine, offers: [{ shop: feed.shop, url: item.url, price: item.price, inStock: item.inStock, lastSyncedAt: now }] }]);
        wines = res.wines;
        if (wines.length > before) { r.added.push(item.newWine.slug); idx = wines.length - 1; }
        else { idx = wines.findIndex((w) => w.slug === res.report.merged[0]?.into); r.changed.push(res.report.merged[0]?.into ?? item.sourceId); }
        if (idx > -1) seen.add(idx);
        continue;
      }

      // Två produkter i samma butik för samma vin: det första erbjudandet gäller, annars skriver de över varandra.
      if (seen.has(idx)) continue;
      seen.add(idx);
      const { wine, changed, was } = setOffer(wines[idx], feed.shop, { shop: feed.shop, url: item.url, price: item.price, inStock: item.inStock, lastSyncedAt: now });
      let w = wine;
      let fieldChanged = false;
      if (item.importer && w.importer !== item.importer && !isLocked(w, "importer")) { w = { ...w, importer: item.importer }; fieldChanged = true; }
      if (changed || fieldChanged) r.changed.push(w.slug);
      if (was?.inStock && !item.inStock) r.outOfStock.push(w.slug);
      if (was && !was.inStock && item.inStock) r.backInStock.push(w.slug);

      if (item.taxIncluded === false && w.published && !isLocked(w, "published")) {
        w = { ...w, published: false, syncHidden: TAX_HIDDEN };
        r.unpublished.push(w.slug);
        alerts.push(`${feed.shop}: ${w.name} avpublicerades, "Moms och alkoholskatt inkluderad" saknas på ${item.url}`);
      } else if (item.taxIncluded === true && w.syncHidden === TAX_HIDDEN) {
        w = { ...w, published: true };
        delete w.syncHidden;
        r.republished.push(w.slug);
        alerts.push(`${feed.shop}: ${w.name} publicerades igen, skattetexten finns tillbaka`);
      }
      wines[idx] = w;
    }

    // Viner som inte längre finns i butikens lista är slut (bara om hela listan hämtades).
    if (feed.complete) {
      wines.forEach((w, i) => {
        if (seen.has(i)) return;
        const o = w.offers?.find((x) => x.shop === feed.shop);
        if (!o || !o.inStock || isLocked(w, "offers")) return;
        wines[i] = setOffer(w, feed.shop, { ...o, inStock: false, lastSyncedAt: now }).wine;
        r.outOfStock.push(w.slug);
        r.changed.push(w.slug);
      });
    }

    reports.push(r);
  }

  // Webbutiksviner som är slut överallt döljs och visas igen när något säljställe har dem (beslut 2026-11-11).
  // Viner på Systembolaget rörs inte, eftersom synken inte ser Systembolagets lager.
  const report = (w: Wine) => reports.find((r) => r.shop === w.shop) ?? reports[0];
  wines = wines.map((w) => {
    if (!w.offers?.length || atSystembolaget(w) || isLocked(w, "published") || !report(w)) return w;
    const inStock = w.offers.some((o) => o.inStock);
    if (!inStock && w.published) {
      report(w).unpublished.push(w.slug);
      return { ...w, published: false, syncHidden: STOCK_HIDDEN };
    }
    if (inStock && w.syncHidden === STOCK_HIDDEN) {
      report(w).republished.push(w.slug);
      const next = { ...w, published: true };
      delete next.syncHidden;
      return next;
    }
    return w;
  });
  const hidden = reports.reduce((n, r) => n + r.unpublished.filter((slug) => wines.find((w) => w.slug === slug)?.syncHidden === STOCK_HIDDEN).length, 0);
  if (hidden) alerts.push(`${hidden} viner dolda eftersom de är slut i alla butiker`);

  return { wines, reports, alerts };
}
