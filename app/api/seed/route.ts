import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getWines, saveWines, getRatings, saveRatings, getBlogs, saveBlogs, Wine, Rating, BlogPost } from "@/lib/blob";
import { isAuthenticated } from "@/lib/auth";
import { buildCatalog, type FoodEntry } from "@/lib/wineData";
import { revalidatePath } from "next/cache";

// Merges data/*.json into Blob. Ratings and blogs: only adds missing entries (matched by id).
// Wines: migrates existing wines to the Vinkompassen model (offers, shop, food, ownImport),
// adds missing Systembolaget wines and merges in the web-shop imports. Existing values and
// lockedFields are never overwritten, so uploaded images and admin edits are preserved.
export async function POST() {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dataDir = path.join(process.cwd(), "data");

  const readData = async <T,>(file: string): Promise<T> =>
    JSON.parse(await readFile(path.join(dataDir, file), "utf-8"));
  const [seedWines, food, vinnatur, flaskvis] = await Promise.all([
    readData<Wine[]>("wines.json"),
    readData<Record<string, FoodEntry>>("food-systembolaget.json"),
    readData<Wine[]>("wines-vinnatur.json"),
    readData<Wine[]>("wines-flaskvis.json"),
  ]);

  let seedRatings: Rating[] = [];
  try { seedRatings = JSON.parse(await readFile(path.join(dataDir, "ratings.json"), "utf-8")); } catch { /* ok */ }

  let seedBlogs: BlogPost[] = [];
  try { seedBlogs = JSON.parse(await readFile(path.join(dataDir, "blogs.json"), "utf-8")); } catch { /* ok */ }

  const [existingWines, existingRatings, existingBlogs] = await Promise.all([
    getWines(), getRatings(), getBlogs(),
  ]);

  const existingRatingIds  = new Set(existingRatings.map((r) => r.id));
  const existingBlogIds    = new Set(existingBlogs.map((b) => b.id));

  const catalog = buildCatalog({
    existing: existingWines,
    systembolaget: seedWines,
    food,
    imports: [
      { wines: vinnatur, source: { source: "vinnatur.shop", autoProfile: true } },
      { wines: flaskvis, source: { source: "flaskvis.se", autoProfile: false } },
    ],
    now: new Date().toISOString(),
  });
  const winesChanged = catalog.report.added.length > 0 || catalog.report.updated.length > 0
    || JSON.stringify(catalog.wines) !== JSON.stringify(existingWines);
  const newRatings = seedRatings.filter((r) => !existingRatingIds.has(r.id));
  const newBlogs   = seedBlogs.filter((b) => !existingBlogIds.has(b.id));

  await Promise.all([
    winesChanged      && saveWines(catalog.wines),
    newRatings.length > 0 && saveRatings([...existingRatings, ...newRatings]),
    newBlogs.length   > 0 && saveBlogs([...existingBlogs, ...newBlogs]),
  ]);

  revalidatePath("/", "layout");
  return NextResponse.json({
    ok: true,
    added:   { wines: catalog.report.added.length, ratings: newRatings.length, blogs: newBlogs.length },
    skipped: { wines: catalog.report.unchanged, ratings: existingRatingIds.size, blogs: existingBlogIds.size },
    wines: {
      total: catalog.wines.length,
      updated: catalog.report.updated.length,
      merged: catalog.report.merged,
    },
  });
}
