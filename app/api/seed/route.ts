import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { saveWines, saveRatings, saveBlogs, Wine, Rating, BlogPost } from "@/lib/blob";
import { isAuthenticated } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// One-time endpoint to migrate data/*.json → Vercel Blob storage.
// Must be logged in as admin to call.
export async function POST() {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dataDir = path.join(process.cwd(), "data");

  const winesRaw = await readFile(path.join(dataDir, "wines.json"), "utf-8");
  const wines: Wine[] = JSON.parse(winesRaw);

  let ratings: Rating[] = [];
  try {
    const ratingsRaw = await readFile(path.join(dataDir, "ratings.json"), "utf-8");
    ratings = JSON.parse(ratingsRaw);
  } catch { /* ratings.json may not exist locally */ }

  let blogs: BlogPost[] = [];
  try {
    const blogsRaw = await readFile(path.join(dataDir, "blogs.json"), "utf-8");
    blogs = JSON.parse(blogsRaw);
  } catch { /* blogs.json may not exist locally */ }

  await saveWines(wines);
  await saveRatings(ratings);
  await saveBlogs(blogs);
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, wines: wines.length, ratings: ratings.length, blogs: blogs.length });
}
