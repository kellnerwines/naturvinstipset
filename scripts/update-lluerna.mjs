// Updates Lluerna 2021 in Vercel Blob production data.
// Run with: node scripts/update-lluerna.mjs
// Requires BLOB_READ_WRITE_TOKEN to be set in .env.local.
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=\s]+)\s*=\s*"?(.*?)"?\s*$/);
  if (match && match[2]) process.env[match[1]] = match[2];
}

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) {
  console.error("BLOB_READ_WRITE_TOKEN saknas i .env.local");
  process.exit(1);
}

const { get, put } = await import("@vercel/blob");

const KEY = "naturvin/wines.json";
const result = await get(KEY, { access: "private", token });
const text = await new Response(result.stream).text();
const wines = JSON.parse(text);

const LLUERNA_ID = "2579dc58-fa23-406a-b1d5-d424b50231f6";
const idx = wines.findIndex(w => w.id === LLUERNA_ID);
if (idx === -1) { console.error("Lluerna hittades inte"); process.exit(1); }

// Clear wineOfMonth on all other wines
for (let i = 0; i < wines.length; i++) {
  if (i !== idx) wines[i] = { ...wines[i], wineOfMonth: false };
}

wines[idx] = {
  ...wines[idx],
  grape: "Xarel-lo från kalk- och fossilrika jordar",
  price: "168",
  longDescription: "Els Vinyerons gör Lluerna på 100% Xarel-lo, den traditionella druvan i Penedès. Vin med rötter – gjort på gamla stockar med naturlig jäsning och utan svavel. Utmärkt till skaldjur och grillad fisk.\n\nLluerna bygger alltid på en blend av två årgångar. 90% från 2021 lagras efter press på ståltank i ca 5 månader. 10% från föregående årgång blandas sedan in — varje år sparas lite vin undan och läggs på 300-liters fat för att ge mer djup och botten till det efterföljande yngre vinet. Blandningen lagras sedan ytterligare en period på tank innan buteljering.",
  adminRating: 4,
  wineOfMonth: true,
};

await put(KEY, JSON.stringify(wines), {
  access: "private",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
  token,
});

console.log("✓ Lluerna 2021 uppdaterad i Vercel Blob");
