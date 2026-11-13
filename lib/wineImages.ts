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
 * Klipper bort enfärgad fotobakgrund, beskär kanten (utgår från hörnpixeln), skalar
 * till högst MAX_IMAGE_HEIGHT och kodar som WebP. Transparens behålls.
 */
export async function processBottleImage(input: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  // Enfärgad fotobakgrund klipps bort först, så att alla flaskor står fritt på sajtens färgfält.
  const cut = await cutOutBackground(input).catch(() => null);
  let img = sharp(cut ?? input, { failOn: "none" }).rotate();
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

/**
 * Tar bort en enfärgad fotobakgrund runt flaskan (t.ex. grå eller vit studiovägg).
 * Fyller från bildens kanter in mot flaskan så länge färgen liknar bakgrunden, och gör
 * de pixlarna genomskinliga med en mjuk övergång vid kanten. Bilder vars kant inte är
 * enfärgad (miljöbilder, redan genomskinliga) lämnas orörda: då returneras null.
 */
export async function cutOutBackground(input: Buffer): Promise<Buffer | null> {
  const { data, info } = await sharp(input, { failOn: "none" }).rotate().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const px = (i: number) => [data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]];

  // Kantpixlarna: redan genomskinlig kant betyder att bilden är klar.
  const border: number[] = [];
  for (let x = 0; x < w; x++) border.push(x, (h - 1) * w + x);
  for (let y = 0; y < h; y++) border.push(y * w, y * w + w - 1);
  const opaque = border.filter((i) => px(i)[3] > 200);
  if (opaque.length < border.length * 0.5) return null;

  // Bakgrundsfärgen är medianen av kanten; en spretig kant betyder att det inte är en studiovägg.
  const med = [0, 1, 2].map((c) => opaque.map((i) => data[i * 4 + c]).sort((a, b) => a - b)[opaque.length >> 1]);
  const dist = (i: number) => Math.hypot(data[i * 4] - med[0], data[i * 4 + 1] - med[1], data[i * 4 + 2] - med[2]);
  const near = opaque.filter((i) => dist(i) < 40).length / opaque.length;
  if (near < 0.85) return null;

  // Fyll från kanten. Toleransen följer hur mycket bakgrunden varierar (skuggor, gradient).
  const spread = opaque.map(dist).sort((a, b) => a - b)[Math.floor(opaque.length * 0.9)];
  const tol = Math.min(40, Math.max(18, spread * 1.8));
  const bg = new Uint8Array(w * h);
  const stack: number[] = [];
  for (const i of border) if (dist(i) < tol) { bg[i] = 1; stack.push(i); }
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w, y = (i / w) | 0;
    for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
      if (j >= 0 && !bg[j] && dist(j) < tol) { bg[j] = 1; stack.push(j); }
    }
  }
  // Skuggan på golvet: gråa (färglösa) pixlar som är mörkare än väggen men ljusare än flaskan,
  // i nedre delen av bilden och sammanhängande med bakgrunden.
  const lum = (i: number) => 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  const bgLum = 0.299 * med[0] + 0.587 * med[1] + 0.114 * med[2];
  const chroma = (i: number) => Math.max(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) - Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  const bgChroma = Math.max(...med) - Math.min(...med);
  const shadow = (i: number) => ((i / w) | 0) > h * 0.7 && lum(i) > bgLum * 0.45 && lum(i) < bgLum - 6 && Math.abs(chroma(i) - bgChroma) < 14;
  for (let i = 0; i < w * h; i++) if (bg[i] && ((i / w) | 0) > h * 0.7) stack.push(i);
  while (stack.length) {
    const i = stack.pop()!;
    const x = i % w, y = (i / w) | 0;
    for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
      if (j >= 0 && !bg[j] && shadow(j)) { bg[j] = 1; stack.push(j); }
    }
  }

  const removed = bg.reduce((n, v) => n + v, 0) / (w * h);
  // För lite borttaget: ingen bakgrund att tala om. För mycket: fyllningen har läckt in i flaskan.
  if (removed < 0.15 || removed > 0.93) return null;

  // Genomskinlig bakgrund, och en mjuk kant där flaskpixeln liknar bakgrunden.
  for (let i = 0; i < w * h; i++) {
    if (bg[i]) { data[i * 4 + 3] = 0; continue; }
    const x = i % w, y = (i / w) | 0;
    const edge = (x > 0 && bg[i - 1]) || (x < w - 1 && bg[i + 1]) || (y > 0 && bg[i - w]) || (y < h - 1 && bg[i + w]);
    if (edge) data[i * 4 + 3] = Math.round(data[i * 4 + 3] * Math.min(1, Math.max(0.35, (dist(i) - tol) / tol + 0.5)));
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
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
