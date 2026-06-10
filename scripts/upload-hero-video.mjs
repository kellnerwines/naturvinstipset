import { put } from "@vercel/blob";
import { readFile } from "fs/promises";
import { createRequire } from "module";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const match = line.match(/^([^#=\s]+)\s*=\s*"?(.*?)"?\s*$/);
  if (match) process.env[match[1]] = match[2];
}

const videoPath = "/Users/simon.kellner/Downloads/8849374-hd_1920_1080_24fps.mp4";
const data = await readFile(videoPath);

console.log("Laddar upp video till Vercel Blob...");
const result = await put("naturvin/hero-video.mp4", data, {
  access: "public",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "video/mp4",
});

console.log("Klar!");
console.log("URL:", result.url);
