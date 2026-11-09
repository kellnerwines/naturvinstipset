// Flaskbilder från webbutiker → Vercel Blob (BRIEF-KOMPASSEN.md, avsnitt 5.1).
// Bilden laddas ner, vit eller transparent kant beskärs, den skalas till högst
// 600 px höjd och sparas som WebP. Används av scripts/migrate-images.mjs och
// senare av synken. Bara relativa typ-importer, så att Node kan ladda filen direkt.

import sharp from "sharp";
import type { Wine } from "./blob";

export const MAX_IMAGE_HEIGHT = 600;
export const USER_AGENT = "NaturvinstipsetBot/1.0 (+https://www.naturvinstipset.se/om-oss)";

/** Blob-nyckel för ett vins flaskbild. */
export function imageKey(w: Pick<Wine, "slug">): string {
  return `naturvin/wines/${w.slug}.webp`;
}

/** Samma form som app/api/upload returnerar: privata blobbar visas via /api/image. */
export function blobImageSrc(blobUrl: string): string {
  return `/api/image?url=${encodeURIComponent(blobUrl)}`;
}

/** Bilden pekar på en extern butik och ska flyttas till Blob. */
export function needsImageMigration(w: Wine): boolean {
  const url = w.primaryImageUrl ?? "";
  if (!/^https?:\/\//i.test(url)) return false;          // /uploads/… eller /api/image?…
  if (url.includes("blob.vercel-storage.com")) return false;
  return !(w.lockedFields?.includes("primaryImageUrl") ?? false);
}

/**
 * Beskär enfärgad kant (vit eller transparent, utgår från hörnpixeln), skalar
 * till högst MAX_IMAGE_HEIGHT och kodar som WebP. Transparens behålls.
 */
export async function processBottleImage(input: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  let img = sharp(input, { failOn: "none" }).rotate();
  try {
    const trimmed = await img.clone().trim({ threshold: 12 }).toBuffer();
    img = sharp(trimmed);
  } catch {
    // Helt enfärgad bild eller inget att beskära – använd originalet.
  }
  const { data, info } = await img
    .resize({ height: MAX_IMAGE_HEIGHT, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

/** Hämtar en bild med snäll user-agent och timeout. */
export async function downloadImage(url: string, timeoutMs = 20000): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "image/*" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get("content-type") ?? "";
  if (type && !type.startsWith("image/")) throw new Error(`Inte en bild: ${type}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Kör `fn` över `items` med högst `limit` samtidiga anrop. */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}
