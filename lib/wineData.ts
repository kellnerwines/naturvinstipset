// Datamodell för Vinkompassen: migrering av befintliga viner, import av
// webbutiksviner och sammanslagning av dubbletter (BRIEF-KOMPASSEN.md, avsnitt 5).
//
// Rena funktioner utan I/O, så att de kan testas med Vitest och köras både från
// seed-routen och från scripts/seed-kompassen.mjs. Filen får bara ha
// typ-importer, eftersom skriptet laddar den direkt i Node (type stripping).

import type { FoodCategory, Offer, Wine } from "./blob";

export const SYSTEMBOLAGET = "Systembolaget";

/** Producenter vars viner är Kellner & Kellners egen import (5.2). */
export const OWN_IMPORT_PRODUCERS = [
  "Arribas Wine Company",
  "Barroca da Malhada",
  "Desviso Vinhos",
  "Gardunha Sul",
  "Adega Belém",
];

/**
 * Kända fall där samma vin heter olika i olika butiker. Nyckeln och värdet är
 * normaliserade "producent|namn"; värdet är namnet vinet matchas under.
 */
const NAME_ALIASES: Record<string, string> = {
  "barrocadamalhada|vinhobranco": "barrocawhite",
};

/** Fält som importen fyller i på ett befintligt vin när de saknas där. */
const FILLABLE_FIELDS = [
  "region", "grape", "description", "longDescription", "flavorTags",
  "syra", "fyllighet", "funk", "stravhet", "flavorNotes",
  "foodPairing", "foodCategories", "primaryImageUrl", "ownImport",
] as const satisfies readonly (keyof Wine)[];

export type FoodEntry = {
  foodPairing?: string;
  foodCategories?: FoodCategory[];
  ownImport?: boolean;
};

export type ImportSource = {
  /** t.ex. "vinnatur.shop" */
  source: string;
  /** true om smakprofilen är uppskattad från beskrivande text (Vin & Natur). */
  autoProfile: boolean;
};

// ─── Hjälpfunktioner ─────────────────────────────────────────────────────────

/** Gemener, utan diakritiska tecken och utan allt som inte är a–z/0–9. */
export function normalize(s: string | undefined): string {
  return (s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/æ/g, "ae").replace(/ø/g, "o").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, "");
}

/** Matchningsnyckel för dubbletter: producent + namn + årgång, normaliserat. */
export function matchKey(w: Pick<Wine, "producer" | "name" | "year">): string {
  const producer = normalize(w.producer);
  const name = normalize(w.name);
  const alias = NAME_ALIASES[`${producer}|${name}`] ?? name;
  const year = normalize(w.year) || "nv";
  return `${producer}|${alias}|${year}`;
}

/** "246", "246,50" eller "ca 246 kr" → 246.5. Ogiltigt → undefined. */
export function parsePrice(price: string | number | undefined): number | undefined {
  if (typeof price === "number") return Number.isFinite(price) ? price : undefined;
  if (!price) return undefined;
  const m = price.replace(/\s/g, "").replace(",", ".").match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : undefined;
}

export function isLocked(w: Wine, field: string): boolean {
  return w.lockedFields?.includes(field) ?? false;
}

/** Egen import enligt 5.2: producentlistan eller "kellner" i Systembolagets URL. */
export function isOwnImportByRule(w: Pick<Wine, "producer" | "systembolagetUrl">): boolean {
  const producer = normalize(w.producer);
  if (OWN_IMPORT_PRODUCERS.some((p) => normalize(p) === producer)) return true;
  return /kellner/i.test(w.systembolagetUrl ?? "");
}

function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
}

function sameOffer(a: Offer, b: Offer): boolean {
  return a.shop === b.shop && a.url === b.url && a.price === b.price && a.inStock === b.inStock;
}

// ─── Migrering av befintliga viner ───────────────────────────────────────────

/**
 * Lägger till de nya fälten på ett befintligt vin utan att ändra de gamla.
 * Idempotent: körs den igen på resultatet blir det ingen skillnad.
 */
export function migrateWine(wine: Wine, food: FoodEntry | undefined, now: string): Wine {
  const w: Wine = { ...wine };

  if (!w.offers?.length && w.systembolagetUrl && !isLocked(w, "offers")) {
    w.offers = [{
      shop: SYSTEMBOLAGET,
      url: w.systembolagetUrl,
      price: parsePrice(w.price) ?? 0,
      inStock: true,
      lastSyncedAt: now,
    }];
  }
  if (!w.shop && w.offers?.length) w.shop = w.offers[0].shop;

  if (food) {
    if (isEmpty(w.foodPairing) && food.foodPairing && !isLocked(w, "foodPairing"))
      w.foodPairing = food.foodPairing;
    if (isEmpty(w.foodCategories) && food.foodCategories?.length && !isLocked(w, "foodCategories"))
      w.foodCategories = [...food.foodCategories];
  }

  if (!isLocked(w, "ownImport")) {
    const own = isOwnImportByRule(w) || food?.ownImport === true || w.ownImport === true;
    if (own || w.ownImport !== undefined) w.ownImport = own;
  }

  return w;
}

// ─── Import av webbutiksviner ─────────────────────────────────────────────────

/** Gör om en post från data/wines-*.json till ett vin med `offers`. */
export function importedWine(raw: Wine, src: ImportSource, now: string): Wine {
  const w: Wine = { ...raw };
  if (!w.systembolagetUrl) delete w.systembolagetUrl;

  if (!w.shop || !w.shopUrl) throw new Error(`Importerat vin ${w.id} saknar shop/shopUrl`);
  const price = parsePrice(w.price);
  if (price === undefined) throw new Error(`Importerat vin ${w.id} saknar pris`);

  w.offers = [{ shop: w.shop, url: w.shopUrl, price, inStock: true, lastSyncedAt: now }];
  w.source = w.source || src.source;
  w.sourceId = w.sourceId || w.shopUrl.replace(/\/+$/, "").split("/").pop();
  w.autoProfile = src.autoProfile;
  w.ownImport = isOwnImportByRule(w) || w.ownImport === true;
  w.galleryImages ??= [];
  w.createdAt ||= now;
  return w;
}

// ─── Sammanslagning ──────────────────────────────────────────────────────────

export type MergeReport = {
  added: string[];                          // nya viner (slug)
  merged: { into: string; from: string }[]; // dubblett lagd som extra offer
  updated: string[];                        // befintliga viner som ändrats
  unchanged: number;
};

/**
 * Slår in `incoming` i `existing`. Matchar på id och annars på
 * producent + namn + årgång. Ett matchat vin får inkommande vins offers
 * (en per butik) och fält som saknas, men skriver aldrig över fält som redan
 * har ett värde eller som ligger i `lockedFields`.
 */
export function mergeWines(
  existing: Wine[],
  incoming: Wine[],
): { wines: Wine[]; report: MergeReport } {
  const wines = existing.map((w) => ({ ...w }));
  const byId = new Map(wines.map((w, i) => [w.id, i]));
  const byKey = new Map<string, number>();
  wines.forEach((w, i) => { if (!byKey.has(matchKey(w))) byKey.set(matchKey(w), i); });
  const slugs = new Set(wines.map((w) => w.slug));

  const report: MergeReport = { added: [], merged: [], updated: [], unchanged: 0 };
  const touched = new Set<number>();

  for (const inc of incoming) {
    const idx = byId.get(inc.id) ?? byKey.get(matchKey(inc));

    if (idx === undefined) {
      if (slugs.has(inc.slug)) throw new Error(`Slug-krock vid import: ${inc.slug}`);
      wines.push({ ...inc });
      const i = wines.length - 1;
      byId.set(inc.id, i);
      byKey.set(matchKey(inc), i);
      slugs.add(inc.slug);
      report.added.push(inc.slug);
      continue;
    }

    const target = wines[idx];
    const { wine: next, changed } = mergeInto(target, inc);
    wines[idx] = next;
    if (target.id !== inc.id) report.merged.push({ into: target.slug, from: inc.slug });
    if (changed && !touched.has(idx)) { report.updated.push(target.slug); touched.add(idx); }
    else if (!changed && target.id === inc.id) report.unchanged++;
  }

  return { wines, report };
}

function mergeInto(target: Wine, inc: Wine): { wine: Wine; changed: boolean } {
  const w: Wine = { ...target };
  let changed = false;

  if (!isLocked(w, "offers") && inc.offers?.length) {
    const offers = [...(w.offers ?? [])];
    for (const o of inc.offers) {
      const i = offers.findIndex((x) => x.shop === o.shop);
      if (i === -1) { offers.push({ ...o }); changed = true; }
      else if (!sameOffer(offers[i], o)) { offers[i] = { ...o }; changed = true; }
    }
    w.offers = offers;
    if (!w.shop) { w.shop = offers[0].shop; changed = true; }
  }

  for (const f of FILLABLE_FIELDS) {
    if (isLocked(w, f) || isEmpty(inc[f])) continue;
    if (f === "ownImport") {
      if (inc.ownImport && !w.ownImport) { w.ownImport = true; changed = true; }
      continue;
    }
    if (isEmpty(w[f])) {
      (w as Record<string, unknown>)[f] = structuredClone(inc[f]);
      changed = true;
    }
  }

  return { wine: w, changed };
}

// ─── Hela katalogen ──────────────────────────────────────────────────────────

export type CatalogInput = {
  existing: Wine[];
  systembolaget: Wine[];
  food: Record<string, FoodEntry>;
  imports: { wines: Wine[]; source: ImportSource }[];
  now: string;
};

/**
 * Migrerar befintliga viner, seedar Systembolaget-vinerna och slår in
 * webbutiksvinerna. Kan köras flera gånger utan att skapa dubbletter.
 */
export function buildCatalog(input: CatalogInput): { wines: Wine[]; report: MergeReport } {
  const { now, food } = input;
  const migrate = (w: Wine) => migrateWine(w, food[w.slug], now);

  const base = input.existing.map(migrate);
  const sb = mergeWines(base, input.systembolaget.map(migrate));

  let wines = sb.wines;
  const report: MergeReport = { ...sb.report, merged: [...sb.report.merged] };
  for (const imp of input.imports) {
    const res = mergeWines(wines, imp.wines.map((w) => importedWine(w, imp.source, now)));
    wines = res.wines;
    report.added.push(...res.report.added);
    report.merged.push(...res.report.merged);
    for (const s of res.report.updated) if (!report.updated.includes(s)) report.updated.push(s);
    report.unchanged += res.report.unchanged;
  }
  return { wines, report };
}
