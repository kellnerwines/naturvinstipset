import { NextRequest, NextResponse } from "next/server";
import { getBlogInteractions, saveBlogInteractions, BlogInteraction } from "@/lib/blob";
import { isAuthenticated } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const blogId = req.nextUrl.searchParams.get("blogId");
  const all = await getBlogInteractions();
  const items = blogId ? all.filter((i) => i.blogId === blogId) : all;
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { blogId, type, fingerprint, name, comment } = body;

  if (!blogId || !fingerprint || (type !== "like" && type !== "comment")) {
    return NextResponse.json({ error: "Ogiltig data" }, { status: 400 });
  }
  if (type === "comment" && (!comment || comment.trim().length === 0)) {
    return NextResponse.json({ error: "Kommentar saknas" }, { status: 400 });
  }

  const all = await getBlogInteractions();

  if (type === "like") {
    const already = all.find((i) => i.blogId === blogId && i.type === "like" && i.fingerprint === fingerprint);
    if (already) {
      return NextResponse.json({ error: "Du har redan gillat detta inlägg." }, { status: 409 });
    }
  }

  const item: BlogInteraction = {
    id: randomUUID(),
    blogId,
    type,
    fingerprint,
    name: name?.trim().slice(0, 60) || undefined,
    comment: type === "comment" ? comment.trim().slice(0, 600) : undefined,
    createdAt: new Date().toISOString(),
  };

  all.push(item);
  await saveBlogInteractions(all);
  revalidatePath("/blogg", "layout");
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const all = await getBlogInteractions();
  await saveBlogInteractions(all.filter((i) => i.id !== id));
  return NextResponse.json({ ok: true });
}
