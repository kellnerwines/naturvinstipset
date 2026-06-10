import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getWines, saveWines, getRatings, saveRatings, getBlogs, saveBlogs, Wine, Rating, BlogPost } from "@/lib/blob";
import { isAuthenticated } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Merges data/*.json into Blob — only adds missing entries (matched by id).
// Never overwrites existing entries so uploaded images are preserved.
export async function POST() {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dataDir = path.join(process.cwd(), "data");

  const seedWines: Wine[] = JSON.parse(await readFile(path.join(dataDir, "wines.json"), "utf-8"));

  let seedRatings: Rating[] = [];
  try { seedRatings = JSON.parse(await readFile(path.join(dataDir, "ratings.json"), "utf-8")); } catch { /* ok */ }

  let seedBlogs: BlogPost[] = [];
  try { seedBlogs = JSON.parse(await readFile(path.join(dataDir, "blogs.json"), "utf-8")); } catch { /* ok */ }

  const [existingWines, existingRatings, existingBlogs] = await Promise.all([
    getWines(), getRatings(), getBlogs(),
  ]);

  const existingWineIds    = new Set(existingWines.map((w) => w.id));
  const existingRatingIds  = new Set(existingRatings.map((r) => r.id));
  const existingBlogIds    = new Set(existingBlogs.map((b) => b.id));

  const newWines   = seedWines.filter((w) => !existingWineIds.has(w.id));
  const newRatings = seedRatings.filter((r) => !existingRatingIds.has(r.id));
  const newBlogs   = seedBlogs.filter((b) => !existingBlogIds.has(b.id));

  await Promise.all([
    newWines.length   > 0 && saveWines([...existingWines, ...newWines]),
    newRatings.length > 0 && saveRatings([...existingRatings, ...newRatings]),
    newBlogs.length   > 0 && saveBlogs([...existingBlogs, ...newBlogs]),
  ]);

  revalidatePath("/", "layout");
  return NextResponse.json({
    ok: true,
    added:   { wines: newWines.length, ratings: newRatings.length, blogs: newBlogs.length },
    skipped: { wines: existingWineIds.size, ratings: existingRatingIds.size, blogs: existingBlogIds.size },
  });
}
