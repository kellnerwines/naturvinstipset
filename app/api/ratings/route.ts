import { NextRequest, NextResponse } from "next/server";
import { getRatings, saveRatings, Rating } from "@/lib/blob";
import { isAuthenticated } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const ratings = await getRatings();
  return NextResponse.json(ratings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { wineId, stars, comment, fingerprint } = body;

  if (!wineId || !stars || stars < 1 || stars > 5 || !fingerprint) {
    return NextResponse.json({ error: "Ogiltig data" }, { status: 400 });
  }

  const ratings = await getRatings();

  // One rating per fingerprint per wine
  const already = ratings.find(
    (r) => r.wineId === wineId && r.fingerprint === fingerprint
  );
  if (already) {
    return NextResponse.json({ error: "Du har redan betygsatt det här vinet." }, { status: 409 });
  }

  const newRating: Rating = {
    id: randomUUID(),
    wineId,
    stars: Math.round(stars),
    comment: comment?.slice(0, 300) || undefined,
    fingerprint,
    createdAt: new Date().toISOString(),
  };

  ratings.push(newRating);
  await saveRatings(ratings);
  revalidatePath("/", "layout");
  return NextResponse.json(newRating, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const ratings = await getRatings();
  await saveRatings(ratings.filter((r) => r.id !== id));
  return NextResponse.json({ ok: true });
}
