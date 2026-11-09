// Seedar/migrerar vinkatalogen i Vercel Blob till Vinkompassens datamodell
// (BRIEF-KOMPASSEN.md, avsnitt 5): befintliga viner får offers/shop/mat/egen import,
// Systembolaget-vinerna i data/wines.json läggs till om de saknas och
// webbutiksvinerna i data/wines-vinnatur.json och data/wines-flaskvis.json slås in.
// Samma logik som POST /api/seed (lib/wineData.ts).
//
// Kör (Node >= 22.18, laddar lib/wineData.ts direkt):
//   node scripts/seed-kompassen.mjs           # torrkörning, skriver ingenting
//   node scripts/seed-kompassen.mjs --write   # skriver till Blob
//
// Token läses från BLOB_READ_WRITE_TOKEN i miljön. Använd preview-lagringens
// token – kör aldrig mot produktionens Blob utan att först ha tagit backup.
// Bakom en HTTP-proxy: sätt NODE_USE_ENV_PROXY=1.
//
// Före skrivning sparas nuvarande naturvin/wines.json (om den finns) som
// naturvin/backups/wines-<tid>.json i samma lagring.

import { get, put } from "@vercel/blob";
import { readFileSync } from "fs";
import { resolve } from "path";
import { buildCatalog } from "../lib/wineData.ts";

const WRITE = process.argv.includes("--write");
const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN saknas i miljön.");
  process.exit(1);
}
const storeId = token.split("_")[3]?.toLowerCase() ?? "?";

const data = (f) => JSON.parse(readFileSync(resolve(process.cwd(), "data", f), "utf-8"));

async function readBlob(key) {
  const r = await get(key, { access: "private", useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return JSON.parse(await new Response(r.stream).text());
}

async function writeBlob(key, value) {
  await put(key, JSON.stringify(value), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

/** Lägg till poster som saknas (matchat på id), som seed-routen gör för betyg och bloggar. */
async function seedById(key, file) {
  let seed;
  try { seed = data(file); } catch { return { key, added: 0, skipped: true }; }
  const existing = (await readBlob(key)) ?? [];
  const ids = new Set(existing.map((e) => e.id));
  const missing = seed.filter((e) => !ids.has(e.id));
  if (WRITE && missing.length) await writeBlob(key, [...existing, ...missing]);
  return { key, added: missing.length, existing: existing.length };
}

console.log(`Blob-lagring: ${storeId}  ·  läge: ${WRITE ? "SKRIVER" : "torrkörning"}`);

const existing = (await readBlob("naturvin/wines.json")) ?? [];
const { wines, report } = buildCatalog({
  existing,
  systembolaget: data("wines.json"),
  food: data("food-systembolaget.json"),
  imports: [
    { wines: data("wines-vinnatur.json"), source: { source: "vinnatur.shop", autoProfile: true } },
    { wines: data("wines-flaskvis.json"), source: { source: "flaskvis.se", autoProfile: false } },
  ],
  now: new Date().toISOString(),
});

const byShop = {};
for (const w of wines) byShop[w.shop ?? "?"] = (byShop[w.shop ?? "?"] ?? 0) + 1;

console.log(`Viner i Blob före: ${existing.length}  ·  efter: ${wines.length}`);
console.log(`Nya: ${report.added.length}  ·  uppdaterade: ${report.updated.length}  ·  oförändrade: ${report.unchanged}`);
console.log(`Dubbletter sammanslagna: ${report.merged.length}`);
for (const m of report.merged) console.log(`  ${m.from} → ${m.into}`);
console.log(`Per primär butik: ${JSON.stringify(byShop)}`);
console.log(`Egen import: ${wines.filter((w) => w.ownImport).length}  ·  utan matförslag: ${wines.filter((w) => !w.foodPairing).map((w) => w.slug).join(", ") || "inga"}`);

if (WRITE) {
  if (JSON.stringify(wines) !== JSON.stringify(existing)) {
    if (existing.length) {
      const backupKey = `naturvin/backups/wines-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      await writeBlob(backupKey, existing);
      console.log(`Backup: ${backupKey}`);
    }
    await writeBlob("naturvin/wines.json", wines);
    console.log("✓ naturvin/wines.json skriven");
  } else {
    console.log("Inga ändringar i naturvin/wines.json");
  }
}

for (const [key, file] of [["naturvin/ratings.json", "ratings.json"], ["naturvin/blogs.json", "blogs.json"]]) {
  const r = await seedById(key, file);
  if (r.skipped) console.log(`${key}: ingen data/${file}, hoppar över`);
  else console.log(`${key}: ${r.existing} befintliga, ${r.added} ${WRITE ? "tillagda" : "skulle läggas till"}`);
}

if (!WRITE) console.log("\nTorrkörning klar. Kör med --write för att skriva.");
