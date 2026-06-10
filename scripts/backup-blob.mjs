// Run: node scripts/backup-blob.mjs
// Downloads current Blob data (incl. image URLs) to data/*.json as a local backup.
import { get } from "@vercel/blob";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=\s]+)\s*=\s*"?(.*?)"?\s*$/);
  if (match) process.env[match[1]] = match[2];
}

const token = process.env.BLOB_READ_WRITE_TOKEN;
if (!token) { console.error("BLOB_READ_WRITE_TOKEN saknas i .env.local"); process.exit(1); }

const keys = ["naturvin/wines.json", "naturvin/ratings.json", "naturvin/blogs.json", "naturvin/blog-interactions.json"];

for (const key of keys) {
  try {
    const result = await get(key, { access: "private", token });
    const text = await new Response(result.stream).text();
    const data = JSON.parse(text);
    const filename = `data/${key.split("/").pop()}`;
    writeFileSync(filename, JSON.stringify(data, null, 2), "utf-8");
    const withImg = data.filter(e => e.primaryImageUrl || e.imageUrl).length;
    console.log(`✓ ${filename} — ${data.length} poster, ${withImg} med bild`);
  } catch {
    console.log(`– ${key} finns inte i Blob (skip)`);
  }
}
console.log("\nBackup klar. Committa data/*.json för att spara lokalt.");
