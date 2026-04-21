import { NextRequest, NextResponse } from "next/server";
import { getBlogs, saveBlogs, BlogPost, toSlug } from "@/lib/blob";
import { isAuthenticated } from "@/lib/auth";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export async function GET() {
  const blogs = await getBlogs();
  return NextResponse.json(blogs);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const blogs = await getBlogs();

  if (body.id) {
    const idx = blogs.findIndex((b) => b.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    blogs[idx] = { ...blogs[idx], ...body };
    await saveBlogs(blogs);
    revalidatePath("/", "layout");
    return NextResponse.json(blogs[idx]);
  }

  const newPost: BlogPost = {
    id: randomUUID(),
    slug: toSlug(body.title ?? "inlagg"),
    title: body.title ?? "",
    excerpt: body.excerpt ?? "",
    content: body.content ?? "",
    imageUrl: body.imageUrl,
    publishedAt: body.publishedAt ?? new Date().toISOString(),
    published: body.published ?? false,
  };
  blogs.push(newPost);
  await saveBlogs(blogs);
  revalidatePath("/", "layout");
  return NextResponse.json(newPost, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const blogs = await getBlogs();
  await saveBlogs(blogs.filter((b) => b.id !== id));
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
