// Flyttar webbutikernas flaskbilder till Vercel Blob (BRIEF-KOMPASSEN.md, 5.1).
// För varje vin vars primaryImageUrl pekar på en extern butik: ladda ner,
// beskär vit/transparent kant, skala till max 600 px höjd, spara som WebP under
// naturvin/wines/<slug>.webp och peka primaryImageUrl på /api/image?url=….
// Originaladressen sparas i sourceImageUrl. Fält i lockedFields rörs inte.
//
// Kör (Node >= 22.18):
//   node scripts/migrate-images.mjs                  # torrkörning: laddar ner och bearbetar, skriver inget
//   node scripts/migrate-images.mjs --write          # laddar upp bilderna och uppdaterar wines.json
//   node scripts/migrate-images.mjs --write --limit 5
//
// Token läses från BLOB_READ_WRITE_TOKEN (preview-lagringen). Bakom proxy: NODE_USE_ENV_PROXY=1.
// Kan köras om: redan flyttade bilder hoppas över.

import { get, put } from "@vercel/blob";
import {
  blobImageSrc, downloadImage, imageKey, mapLimit, needsImageMigration, processBottleImage,
} from "../lib/wineImages.ts";

const WRITE = process.argv.includes("--write");
const limitArg = process.argv.indexOf("--limit");
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;
const CONCURRENCY = 5;
const WINES_KEY = "naturvin/wines.json";

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) { console.error("BLOB_READ_WRITE_TOKEN saknas i miljön."); process.exit(1); }
const storeId = token.split("_")[3]?.toLowerCase() ?? "?";

async function readWines() {
  const r = await get(WINES_KEY, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) return [];
  return JSON.parse(await new Response(r.stream).text());
}
async function writeJson(key, value) {
  await put(key, JSON.stringify(value), {
    access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json",
  });
}

console.log(`Blob-lagring: ${storeId}  ·  läge: ${WRITE ? "SKRIVER" : "torrkörning"}`);

const wines = await readWines();
const todo = wines.filter(needsImageMigration).slice(0, LIMIT);
console.log(`Viner: ${wines.length}  ·  bilder att flytta: ${todo.length}`);

let inBytes = 0, outBytes = 0;
const results = await mapLimit(todo, CONCURRENCY, async (w) => {
  const src = w.primaryImageUrl;
  try {
    const original = await downloadImage(src);
    const img = await processBottleImage(original);
    inBytes += original.length; outBytes += img.data.length;
    let newUrl = null;
    if (WRITE) {
      const blob = await put(imageKey(w), img.data, {
        access: "private", addRandomSuffix: false, allowOverwrite: true,
        contentType: "image/webp", cacheControlMaxAge: 60 * 60 * 24 * 30,
      });
      newUrl = blobImageSrc(blob.url);
    }
    return { id: w.id, slug: w.slug, src, newUrl, size: `${img.width}×${img.height}`, kb: Math.round(img.data.length / 1024) };
  } catch (e) {
    return { id: w.id, slug: w.slug, src, error: e instanceof Error ? e.message : String(e) };
  }
});

const ok = results.filter((r) => !r.error);
const failed = results.filter((r) => r.error);
for (const r of ok.slice(0, 5)) console.log(`  ✓ ${r.slug}  ${r.size}  ${r.kb} kB`);
if (ok.length > 5) console.log(`  … och ${ok.length - 5} till`);
for (const r of failed) console.log(`  ✗ ${r.slug}: ${r.error}  (${r.src})`);
console.log(`Klara: ${ok.length}  ·  fel: ${failed.length}  ·  ${Math.round(inBytes / 1024)} kB → ${Math.round(outBytes / 1024)} kB`);

if (WRITE && ok.length) {
  // Läs om precis före skrivning så att samtidiga ändringar i admin inte går förlorade.
  const latest = await readWines();
  const byId = new Map(ok.map((r) => [r.id, r]));
  let changed = 0;
  const updated = latest.map((w) => {
    const r = byId.get(w.id);
    if (!r || w.primaryImageUrl !== r.src || !needsImageMigration(w)) return w;
    changed++;
    return { ...w, primaryImageUrl: r.newUrl, sourceImageUrl: r.src };
  });
  if (changed) {
    const backupKey = `naturvin/backups/wines-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    await writeJson(backupKey, latest);
    await writeJson(WINES_KEY, updated);
    console.log(`Backup: ${backupKey}`);
    console.log(`✓ ${changed} viner pekar nu på bilder i Blob`);
  }
}

if (!WRITE) console.log("\nTorrkörning klar. Kör med --write för att ladda upp.");
if (failed.length) process.exitCode = 1;
