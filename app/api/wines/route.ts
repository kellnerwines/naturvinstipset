import { NextRequest, NextResponse } from "next/server";
import { getWines, saveWines, Wine, toSlug } from "@/lib/blob";
import { isAuthenticated } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/** Fält som import/synk kan skriva; ändras de av admin hamnar de i lockedFields. */
const IMPORT_FIELDS = [
  "name", "producer", "country", "region", "grape", "wineType", "year", "price",
  "description", "longDescription", "flavorTags", "syra", "fyllighet", "funk", "stravhet",
  "flavorNotes", "primaryImageUrl", "offers", "ownImport", "foodPairing", "foodCategories",
] as const satisfies readonly (keyof Wine)[];

/** Tomma värden ("", null, [], undefined) räknas som lika så att formuläret inte låser i onödan. */
function comparable(v: unknown): string {
  if (v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0)) return "";
  return JSON.stringify(v);
}

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
    const update = { ...body };
    // Never wipe an existing image with an empty value — require a non-empty URL to overwrite
    if (!update.primaryImageUrl) delete update.primaryImageUrl;
    if (!update.galleryImages?.length) delete update.galleryImages;
    // Fält som admin ändrar låses så att import och synk inte skriver över dem (5.4, 6.3).
    const locked = new Set(wines[idx].lockedFields ?? []);
    for (const f of IMPORT_FIELDS) {
      if (f in update && comparable(update[f]) !== comparable(wines[idx][f])) locked.add(f);
    }
    if (Array.isArray(body.lockedFields)) for (const f of body.lockedFields) locked.add(String(f));
    update.lockedFields = [...locked];
    if (!update.lockedFields.length) delete update.lockedFields;
    wines[idx] = { ...wines[idx], ...update };
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
