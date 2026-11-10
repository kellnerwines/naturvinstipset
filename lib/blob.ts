import path from "path";
import { readFile, writeFile, mkdir } from "fs/promises";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Wine = {
  id: string;
  slug: string;
  name: string;
  producer: string;
  country: string;
  region?: string;
  grape?: string;
  wineType: string; // Rött | Vitt | Rosé | Orange | Mousserande | Pét Nat
  year?: string;
  price?: string;
  systembolagetUrl?: string;
  description: string;       // short, shown in list
  longDescription?: string;  // shown on detail page
  flavorTags?: string[];     // e.g. ["Fruktig", "Mineralisk"]
  // Smakprofil 1–5
  syra?: number;       // acidity
  fyllighet?: number;  // body
  funk?: number;       // natural funk / brett
  stravhet?: number;   // tannins
  flavorNotes?: string; // free-text flavor description
  primaryImageUrl?: string;
  galleryImages?: string[];
  adminRating: number;       // 1–5, set by admin
  wineOfMonth?: boolean;     // pinned to #1 with glowy border
  createdAt: string;
  published: boolean;

  // ── Vinkompassen (BRIEF-KOMPASSEN.md, avsnitt 5) ──
  offers?: Offer[];              // alla säljställen; ersätter på sikt systembolagetUrl/price
  shop?: Shop;                   // primärt säljställe (för enkel filtrering)
  shopUrl?: string;
  ownImport?: boolean;           // Kellner & Kellner-import → "Egen import"-märkning
  foodPairing?: string;          // regional mattext, se 5.4
  foodCategories?: FoodCategory[];
  source?: string;               // t.ex. "vinnatur.shop", "flaskvis.se", "manual"
  sourceId?: string;             // butikens handle/slug
  autoProfile?: boolean;         // smakprofil uppskattad automatiskt
  sourceImageUrl?: string;       // butikens originalbild, innan den flyttats till Blob (5.1)
  lockedFields?: string[];       // fält som admin ändrat – importen får inte skriva över dem
  importer?: string;             // svensk importör enligt webbutiken, t.ex. "Wine Rebels" (Flaskvis)
  syncHidden?: string;           // varför synken avpublicerade vinet (6.1); publiceras igen när orsaken är borta
};

export type Shop = "Systembolaget" | "Vin & Natur" | "Flaskvis" | (string & {});

export type FoodCategory =
  | "fisk" | "fagel" | "kott" | "flask" | "vego" | "kryddigt" | "ost" | "aperitif";

export type Offer = {
  shop: Shop;
  url: string;          // butikens produktsida (rå URL, länkas via /go)
  price: number;        // SEK inkl. moms och svensk alkoholskatt
  inStock: boolean;
  lastSyncedAt: string; // ISO
};

export type Rating = {
  id: string;
  wineId: string;
  stars: number;          // 1–5; for likes always 5
  liked?: boolean;        // true when submitted via like button
  comment?: string;
  fingerprint: string;    // cookie UUID to prevent double-voting
  createdAt: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;        // markdown or plain text with \n
  imageUrl?: string;
  publishedAt: string;
  published: boolean;
  /** Vinkompassens parametrar för en vinlista som hämtas live när inlägget visas (t.ex. { mat: "ost" }). */
  wineQuery?: Record<string, string>;
  wineHeading?: string;
  /** Fotokredit, t.ex. "Nick Grappone på Unsplash", och länk till bilden. */
  imageCredit?: string;
  imageCreditUrl?: string;
};

/** Publicerat och publiceringsdagen har kommit (svensk tid). Inlägg med framtida datum syns först då. */
export function isPostLive(b: Pick<BlogPost, "published" | "publishedAt">, now = new Date()): boolean {
  const today = now.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
  return b.published && b.publishedAt.slice(0, 10) <= today;
}

export type BlogInteraction = {
  id: string;
  blogId: string;
  type: "like" | "comment";
  fingerprint: string;
  name?: string;
  comment?: string;
  createdAt: string;
};

// ─── Storage backends ─────────────────────────────────────────────────────────

// Blob används med en läs- och skrivtoken (lokalt och i skript) eller med Vercels
// OIDC-koppling, där lagringen anges med BLOB_STORE_ID (produktionen).
export const hasBlobCredentials = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
const useBlob = hasBlobCredentials();
const DATA_DIR = path.join(process.cwd(), "data");

async function fsRead<T>(filename: string): Promise<T[]> {
  try {
    const content = await readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function fsWrite<T>(filename: string, data: T[]) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

async function blobRead<T>(key: string): Promise<T[]> {
  const { get: blobGet } = await import("@vercel/blob");
  try {
    const result = await blobGet(key, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return [];
    const text = await new Response(result.stream).text();
    return JSON.parse(text);
  } catch {
    return [];
  }
}

async function blobWrite<T>(key: string, data: T[]) {
  const { put } = await import("@vercel/blob");
  await put(key, JSON.stringify(data), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function readJson<T>(key: string): Promise<T[]> {
  return useBlob ? blobRead<T>(key) : fsRead<T>(path.basename(key));
}
function writeJson<T>(key: string, data: T[]): Promise<void> {
  return useBlob ? blobWrite<T>(key, data) : fsWrite<T>(path.basename(key), data);
}

const WINES_KEY             = "naturvin/wines.json";
const RATINGS_KEY           = "naturvin/ratings.json";
const BLOGS_KEY             = "naturvin/blogs.json";
const BLOG_INTERACTIONS_KEY = "naturvin/blog-interactions.json";

export const getWines   = () => readJson<Wine>(WINES_KEY);
export const saveWines  = (d: Wine[]) => writeJson(WINES_KEY, d);

export const getRatings  = () => readJson<Rating>(RATINGS_KEY);
export const saveRatings = (d: Rating[]) => writeJson(RATINGS_KEY, d);

export const getBlogs   = () => readJson<BlogPost>(BLOGS_KEY);
export const saveBlogs  = (d: BlogPost[]) => writeJson(BLOGS_KEY, d);

export const getBlogInteractions  = () => readJson<BlogInteraction>(BLOG_INTERACTIONS_KEY);
export const saveBlogInteractions = (d: BlogInteraction[]) => writeJson(BLOG_INTERACTIONS_KEY, d);

// ─── Rating helpers ───────────────────────────────────────────────────────────

/** Combined score: admin rating = 1 vote, each user rating/like = 1 vote.
 *  Score floats as the community votes. */
export function combinedRating(wine: Wine, ratings: Rating[]): number {
  const mine = ratings.filter((r) => r.wineId === wine.id);
  const total = wine.adminRating + mine.reduce((s, r) => s + r.stars, 0);
  const count = 1 + mine.length;
  return Math.round((total / count) * 10) / 10;
}

export function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Inställningar (BRIEF-KOMPASSEN.md, 7.1) ──────────────────────────────────

export type SiteSettings = {
  /** Ersättning från webbutiker: slår på rel="sponsored nofollow" och ersättningsmeningen. */
  retailerCompensation: boolean;
};

const SETTINGS_KEY = "naturvin/settings.json";
const DEFAULT_SETTINGS: SiteSettings = { retailerCompensation: false };

export async function getSettings(): Promise<SiteSettings> {
  const rows = await readJson<SiteSettings>(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(rows[0] ?? {}) };
}
export const saveSettings = (s: SiteSettings) => writeJson(SETTINGS_KEY, [s]);

// ─── Synklogg och backup (BRIEF-KOMPASSEN.md, 6.3) ────────────────────────────

const SYNC_LOG_KEY = "naturvin/sync-log.json";
export const getSyncLog  = <T,>() => readJson<T>(SYNC_LOG_KEY);
export const saveSyncLog = <T,>(d: T[]) => writeJson(SYNC_LOG_KEY, d);

/** Sparar nuvarande vinlista som backup innan synken skriver. Bara i Blob. */
export async function backupWines(tag: string): Promise<string | null> {
  if (!useBlob) return null;
  const key = `naturvin/backups/wines-${tag}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  await blobWrite(key, await readJson<Wine>(WINES_KEY));
  return key;
}

/** Laddar upp en bearbetad flaskbild och returnerar adressen sajten visar den via. */
export async function putWineImage(key: string, data: Buffer): Promise<string | null> {
  if (!useBlob) return null;
  const { put } = await import("@vercel/blob");
  const blob = await put(key, data, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "image/webp" });
  return `/api/image?url=${encodeURIComponent(blob.url)}`;
}
