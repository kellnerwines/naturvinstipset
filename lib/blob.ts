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
};

// ─── Storage backends ─────────────────────────────────────────────────────────

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;
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
    const result = await blobGet(key, { access: "private" });
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

const WINES_KEY   = "naturvin/wines.json";
const RATINGS_KEY = "naturvin/ratings.json";
const BLOGS_KEY   = "naturvin/blogs.json";

export const getWines   = () => readJson<Wine>(WINES_KEY);
export const saveWines  = (d: Wine[]) => writeJson(WINES_KEY, d);

export const getRatings  = () => readJson<Rating>(RATINGS_KEY);
export const saveRatings = (d: Rating[]) => writeJson(RATINGS_KEY, d);

export const getBlogs   = () => readJson<BlogPost>(BLOGS_KEY);
export const saveBlogs  = (d: BlogPost[]) => writeJson(BLOGS_KEY, d);

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
