// Kontroll av Systembolaget-vinerna (beslut 2026-11-11): länk, pris och lager läses
// från produktsidan, som har produktdatan som JSON (__NEXT_DATA__). Snällt: varje vin
// högst en gång i månaden, ett anrop i taget med paus, och högst SB_PER_RUN per körning.
// Samma läsning skapar viner ur SB_IMPORT, Systembolaget-viner från naturvinsimportörer.

import type { Wine } from "../blob";
import { mapLimit } from "../wineImages";
import type { FeedItem, ShopFeed } from "./apply";
import { politeFetch } from "./feeds";
import { findGrapes, heuristicProfile } from "./parse";
import { STOCK_HIDDEN } from "./apply";

export const SYSTEMBOLAGET = "Systembolaget";
export const SB_PER_RUN = 80;
const RECHECK_DAYS = 30;
/** Viner som döljs för att de är slut kontrolleras oftare, så att de syns igen när de går att köpa. */
const HIDDEN_RECHECK_DAYS = 1;

/**
 * Naturviner på Systembolaget från importörernas egna listor (Wine Waves, Pompette och
 * utställarna på Natural Mystics), godkända av admin 2026-11-11 och 2026-11-13: artikelnummer och en del av producentens namn. Ett kort
 * artikelnummer kan ha återanvänts för ett annat vin, så producenten måste stämma.
 */
export const SB_IMPORT: { nr: string; producer: string; importer: string }[] = [
  ...([["9038201", "joiseph"], ["9538301", "nestarec"], ["9222701", "prameny"], ["9294534", "meinklang"], ["9019201", "mira"],
    ["7288901", "strekov"], ["8274802", "strekov"], ["7992701", "kolonia"], ["7964301", "kolonia"], ["7806401", "altenburger"]] as const)
    .map(([nr, producer]) => ({ nr, producer, importer: "Wine Waves" })),
  ...([["94488", "scheuermann"], ["90525", "scheuermann"], ["71252", "scheuermann"], ["79516", "scheuermann"], ["92643", "scheuermann"],
    ["71242", "scheuermann"], ["94774", "scheuermann"], ["50151", "scheuermann"], ["55904", "scheuermann"], ["92738", "heinrich"],
    ["79737", "arndorfer"], ["52075", "arndorfer"], ["72760", "arndorfer"], ["83136", "arndorfer"], ["92779", "arndorfer"],
    ["30661", "fuchs"], ["91103", "tépus"], ["56425", "tépus"], ["73040", "galouchey"], ["95283", "aigle"], ["93732", "cordulies"],
    ["76448", "chevillard"], ["70879", "ilusión"]] as const)
    .map(([nr, producer]) => ({ nr, producer, importer: "Pompette" })),
  // Utställare på Natural Mystics 2026 med enskilda flaskor på Systembolaget, kontrollerade mot
  // leverantören på produktsidan 2026-11-13 (godkänt av admin samma dag).
  ...([["5247701", "lissner"], ["7190801", "lissner"], ["7196101", "lissner"], ["7271101", "lissner"], ["7315801", "lissner"],
    ["7760401", "lissner"], ["5448301", "faller"], ["5571901", "faller"], ["5842001", "faller"], ["5868401", "faller"],
    ["7440101", "faller"], ["7625801", "faller"], ["7945401", "faller"], ["7962801", "faller"], ["7984901", "faller"],
    ["5629401", "simonis"], ["5640801", "simonis"], ["5842901", "simonis"], ["5860601", "simonis"], ["7410801", "simonis"],
    ["7838201", "simonis"], ["7841301", "simonis"], ["5670301", "binner"], ["5722001", "binner"], ["5796901", "binner"],
    ["5842401", "binner"], ["7647201", "binner"], ["5705101", "henriot"], ["5705401", "henriot"], ["7334001", "henriot"],
    ["7090701", "rückrich"], ["7090901", "rückrich"], ["7091601", "rückrich"], ["7432401", "rückrich"], ["7596001", "rückrich"],
    ["7624501", "rückrich"], ["7809001", "rückrich"], ["7784901", "pranzegg"], ["7883701", "pranzegg"], ["7884001", "pranzegg"],
    ["7884101", "pranzegg"]] as const)
    .map(([nr, producer]) => ({ nr, producer, importer: "RekoVin" })),
  ...([["5144301", "joubert"], ["5975201", "joubert"], ["7575901", "joubert"], ["5912301", "lindenlaub"], ["7717001", "lindenlaub"],
    ["7103501", "ballon"], ["7397701", "ballon"], ["7599201", "ballon"], ["7551201", "bourdonnaye"], ["7758306", "bourdonnaye"],
    ["7783301", "bourdonnaye"], ["7796601", "bourdonnaye"]] as const)
    .map(([nr, producer]) => ({ nr, producer, importer: "Buteljholmen" })),
  ...([["797401", "maias"], ["9209401", "maias"], ["9004501", "campolargo"], ["9413601", "campolargo"], ["9017801", "lopes"],
    ["9268001", "lopes"], ["9433801", "lopes"], ["9054601", "curral"], ["9203701", "tubarão"], ["9279401", "espera"],
    ["9445001", "mira do ó"]] as const)
    .map(([nr, producer]) => ({ nr, producer, importer: "Boa Pressão" })),
  ...([["9460901", "oubliée"]] as const)
    .map(([nr, producer]) => ({ nr, producer, importer: "Dryckesbutiken" })),
  ...([["7932001", "olivier"], ["7537501", "parera"]] as const)
    .map(([nr, producer]) => ({ nr, producer, importer: "Vin Vivant" })),
  ...([["3319701", "friberg"]] as const)
    .map(([nr, producer]) => ({ nr, producer, importer: "J. Friberg" })),
];

/** Artikelnumret i en Systembolaget-länk, t.ex. "9323901" ur …/fred-9323901/. */
export function sbNumber(url: string | undefined): string | undefined {
  return url?.match(/systembolaget\.se\/(?:.*-)?(\d{5,})\/?(?:[?#].*)?$/)?.[1];
}

/** Kortnumret (fem eller sex första siffror) och varianten avser samma vin, t.ex. 94488 och 9448801. */
const sameNumber = (a: string, b: string) => a === b || (a.length > b.length ? a.startsWith(b) : b.startsWith(a)) && Math.abs(a.length - b.length) <= 2;

export type SbProduct = {
  number: string;
  name: string;
  producer: string;
  country: string;
  region?: string;
  wineType?: string;
  year: string;
  price: number;
  volume: number;
  inStock: boolean;
  image?: string;
  supplier?: string;
  packaging?: string;   // "Flaska", "Påse", "Multipack" (vinlåda)
  grapes: string[];
};

const TYPES: Record<string, string> = { "Rött vin": "Rött", "Vitt vin": "Vitt", "Rosévin": "Rosé", "Mousserande vin": "Mousserande" };

/** Produktdatan ur sidans __NEXT_DATA__. undefined om sidan inte är en produkt. */
export function parseSystembolagetPage(html: string): SbProduct | undefined {
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return undefined;
  let fallback: Record<string, Record<string, unknown>>;
  try {
    fallback = JSON.parse(m[1]).props?.pageProps?.fallback ?? {};
  } catch {
    return undefined;
  }
  const productKey = Object.keys(fallback).find((k) => /"ecommerce","product","\d+"/.test(k));
  if (!productKey) return undefined;
  const p = fallback[productKey] as Record<string, unknown>;
  const online = Object.entries(fallback).find(([k]) => k.includes('"onlineavailability"'))?.[1] as { availabilityState?: { state?: string } } | undefined;
  const str = (k: string) => (typeof p[k] === "string" ? (p[k] as string).trim() : "");
  const bold = str("productNameBold");
  const thin = str("productNameThin");
  const full = str("producerName") || thin;
  const has = (x: string) => !!x && full.toLowerCase().includes(x.toLowerCase());
  // Delar ett ord på minst fyra bokstäver med producentnamnet, t.ex. "Niklas Rückrich" och "Weingut Rückrich Gbr".
  const shares = (x: string) => x.toLowerCase().split(/[\s-]+/).some((w) => w.length >= 4 && full.toLowerCase().split(/[\s-]+/).includes(w));
  // Systembolaget skriver antingen producenten i fetstil och vinet under ("Scheuermann" /
  // "Vin de Weiß") eller tvärtom ("Orange" / "Arndorfer"). Det kortare producentnamnet används.
  const [name, producer] = has(bold) && thin ? [thin, bold] : has(thin) ? [bold, thin] : shares(bold) && thin ? [thin, bold] : [bold, full];
  const text = `${str("productNameBold")} ${thin}`;
  // Orange och pét-nat har ingen egen kategori hos Systembolaget; de syns i namnet.
  const wineType = /pet[ -]?nat|pétillant/i.test(text) ? "Pét Nat"
    : /\borange\b|macerat|skin[- ]?(touch|contact)/i.test(text) ? "Orange" : TYPES[str("categoryLevel2")];
  // Beställningsvaror har läget "SupplierProduct" (Skickas från leverantör) och går att köpa,
  // så länge leverantören inte har markerat dem som ej tillgängliga.
  const state = online?.availabilityState?.state;
  const supplierOut = !!p.isSupplierNotAvailable || !!p.isSupplierTemporaryNotAvailable;
  const available = state === "Available" || (state === "SupplierProduct" && !supplierOut) || Number(p.availableNumberOfStores ?? 0) > 0;
  const image = (p.images as { imageUrl?: string }[] | undefined)?.[0]?.imageUrl;
  return {
    number: String(p.productNumber ?? ""),
    name,
    producer,
    country: str("country"),
    region: str("originLevel1") || undefined,
    wineType,
    year: p.vintage ? String(p.vintage) : "NV",
    price: Math.round(Number(p.priceInclVat ?? 0)),
    volume: Number(p.volume ?? 0),
    inStock: !p.isDiscontinued && !p.isCompletelyOutOfStock && available,
    image: image ? `${image}_400.png` : undefined,
    supplier: str("supplierName") || undefined,
    packaging: str("packagingLevel1") || undefined,
    // Druvorna står som "Pinot noir;Chardonnay"; kända druvor får sajtens stavning ("Pinot Noir").
    grapes: str("grapes").split(/\s*[;,]\s*/).filter(Boolean).map((g) => findGrapes(g)[0] ?? g[0].toUpperCase() + g.slice(1)),
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const checkedAt = (w: Wine) => w.sbCheckedAt ?? "";

/**
 * Läser produktsidorna för de Systembolaget-viner som inte kontrollerats på RECHECK_DAYS
 * dagar (äldst först), plus de importvin som saknas i katalogen. complete är alltid false:
 * ett vin som inte hanns med räknas inte som slut.
 */
export async function systembolagetFeed(existing: Wine[], deadline: number, now: string): Promise<ShopFeed> {
  const feed: ShopFeed = { shop: SYSTEMBOLAGET, source: "systembolaget.se", complete: false, items: [], errors: [] };
  const cutoff = new Date(Date.parse(now) - RECHECK_DAYS * 86_400_000).toISOString();
  const known = existing.map((w) => sbNumber(w.systembolagetUrl) ?? sbNumber(w.offers?.find((o) => o.shop === SYSTEMBOLAGET)?.url)).filter((n): n is string => !!n);

  const missing = SB_IMPORT.filter((i) => !known.some((n) => sameNumber(n, i.nr)));
  const hiddenCutoff = new Date(Date.parse(now) - HIDDEN_RECHECK_DAYS * 86_400_000).toISOString();
  const due = existing
    .filter((w) => (w.systembolagetUrl || w.offers?.some((o) => o.shop === SYSTEMBOLAGET)) && !w.lockedFields?.includes("offers"))
    .filter((w) => checkedAt(w) < (w.syncHidden === STOCK_HIDDEN ? hiddenCutoff : cutoff))
    .sort((a, b) => checkedAt(a).localeCompare(checkedAt(b)));
  const jobs = [
    ...missing.map((i) => ({ url: `https://www.systembolaget.se/${i.nr}`, importer: i.importer, producer: i.producer, isNew: true, price: 0 })),
    ...due.map((w) => ({ url: w.systembolagetUrl ?? w.offers!.find((o) => o.shop === SYSTEMBOLAGET)!.url, importer: undefined, producer: "", isNew: false, price: Number(w.price) || 0 })),
  ].slice(0, SB_PER_RUN);

  let broken = 0;
  const items = await mapLimit(jobs, 1, async (job): Promise<FeedItem | null> => {
    await sleep(1000);
    let res: Response;
    try {
      res = await politeFetch(job.url, deadline);
    } catch (e) {
      const msg = (e as Error).message;
      // 404: produkten finns inte längre. Då är vinet slut, och länken behöver ses över.
      if (/HTTP 404/.test(msg) && !job.isNew) {
        broken++;
        feed.errors.push(`Länken fungerar inte längre: ${job.url}`);
        const nr = sbNumber(job.url)!;
        return { sourceId: nr, url: job.url, price: job.price, inStock: false };
      }
      if (!/tiden tog slut/.test(msg)) feed.errors.push(`${job.url}: ${msg}`);
      return null;
    }
    const p = parseSystembolagetPage(await res.text());
    if (!p?.number) { feed.errors.push(`${job.url}: hittade ingen produktdata`); return null; }
    const item: FeedItem = { sourceId: p.number, url: res.url || job.url, price: p.price, inStock: p.inStock };
    if (!job.isNew) return item;

    if (!`${p.producer} ${p.name}`.toLowerCase().includes(job.producer)) {
      feed.errors.push(`${job.url} leder till ${p.producer} ${p.name}, inte ${job.producer}; skapas inte`);
      return null;
    }
    if (p.packaging === "Multipack") {
      feed.errors.push(`${p.producer} ${p.name}: vinlåda, bara enskilda viner tas med`);
      return null;
    }
    if (p.volume && p.volume < 500) {
      feed.errors.push(`${p.producer} ${p.name}: ${p.volume} ml, bara flaskor från 50 cl tas med`);
      return null;
    }
    if (!p.wineType || !p.producer || !p.country) {
      feed.errors.push(`${p.number}: kunde inte avgöra ${!p.wineType ? "färg" : !p.producer ? "producent" : "land"}, skapas inte`);
      return item;
    }
    const grapes = p.grapes.length ? p.grapes : findGrapes(p.name);
    const id = `sb-${p.number}`;
    const typeWord: Record<string, string> = { "Rött": "rött vin", "Vitt": "vitt vin", Orange: "orangevin", "Rosé": "rosévin", Mousserande: "mousserande vin", "Pét Nat": "pét-nat" };
    item.newWine = {
      id, slug: id, name: p.name, producer: p.producer, country: p.country, region: p.region,
      grape: grapes.join(", "), wineType: p.wineType, year: p.year, price: String(p.price),
      systembolagetUrl: item.url, shop: SYSTEMBOLAGET,
      description: `Ett ${typeWord[p.wineType]} från ${p.region ?? p.country}${p.volume && p.volume !== 750 ? ` i ${p.volume / 1000} liters flaska` : ""}.`,
      ...heuristicProfile("", p.wineType),
      primaryImageUrl: p.image, galleryImages: [], flavorTags: [],
      adminRating: 0, createdAt: now, published: true, wineOfMonth: false,
      importer: job.importer ?? p.supplier, autoProfile: true,
      source: `systembolaget.se (import ${now.slice(0, 10)}, ${job.importer})`, sourceId: p.number,
    };
    return item;
  });
  feed.items = items.filter((x): x is FeedItem => !!x);
  if (broken) feed.errors.push(`${broken} länkar till Systembolaget fungerar inte; vinerna är markerade som slut`);
  if (jobs.length < missing.length + due.length) feed.errors.push(`${missing.length + due.length - jobs.length} viner kontrolleras vid nästa körning`);
  return feed;
}
