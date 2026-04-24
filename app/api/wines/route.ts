import { NextRequest, NextResponse } from "next/server";
import { getWines, saveWines, Wine, toSlug } from "@/lib/blob";
import { isAuthenticated } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function GET() {
  const wines = await getWines();
  return NextResponse.json(wines);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const wines = await getWines();

  if (body.id) {
    const idx = wines.findIndex((w) => w.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // If this wine is being set as wineOfMonth, clear the flag on all others
    if (body.wineOfMonth) {
      for (let i = 0; i < wines.length; i++) {
        if (i !== idx) wines[i] = { ...wines[i], wineOfMonth: false };
      }
    }
    wines[idx] = { ...wines[idx], ...body };
    await saveWines(wines);
    revalidatePath("/", "layout");
    return NextResponse.json(wines[idx]);
  }

  const slug = toSlug(body.name + (body.year ? `-${body.year}` : ""));
  const newWine: Wine = {
    id: randomUUID(),
    slug,
    name: body.name ?? "",
    producer: body.producer ?? "",
    country: body.country ?? "",
    region: body.region,
    grape: body.grape,
    wineType: body.wineType ?? "Rött",
    year: body.year,
    price: body.price,
    systembolagetUrl: body.systembolagetUrl,
    description: body.description ?? "",
    longDescription: body.longDescription,
    flavorTags: body.flavorTags ?? [],
    primaryImageUrl: body.primaryImageUrl,
    galleryImages: body.galleryImages ?? [],
    adminRating: body.adminRating ?? 4,
    createdAt: new Date().toISOString(),
    published: body.published ?? false,
  };
  wines.push(newWine);
  await saveWines(wines);
  revalidatePath("/", "layout");
  return NextResponse.json(newWine, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const wines = await getWines();
  await saveWines(wines.filter((w) => w.id !== id));
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
