import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogs } from "@/lib/blob";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blogs = await getBlogs();
  const post = blogs.find((b) => b.slug === slug && b.published);
  if (!post) return { title: "Artikel" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://naturvinstipset.se/blogg/${slug}`,
      ...(post.imageUrl ? { images: [{ url: post.imageUrl }] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blogs = await getBlogs();
  const post = blogs.find((b) => b.slug === slug && b.published);
  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <Link href="/blogg" className="text-sm text-black/40 hover:text-[var(--green)] mb-8 inline-block">
        ← Tillbaka till bloggen
      </Link>

      <p className="text-xs text-black/40 mb-3">
        {new Date(post.publishedAt).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" })}
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-[var(--green-dark)] mb-6 leading-tight">
        {post.title}
      </h1>
      <p className="text-lg text-black/60 mb-10 leading-relaxed">{post.excerpt}</p>

      {post.imageUrl && (
        <div className="aspect-video rounded-xl overflow-hidden mb-10">
          <Image src={post.imageUrl} alt={post.title} width={800} height={450} className="object-cover w-full h-full" unoptimized />
        </div>
      )}

      <div className="prose prose-sm max-w-none text-black/70 leading-relaxed whitespace-pre-line">
        {post.content}
      </div>
    </div>
  );
}
