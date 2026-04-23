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
      url: `https://www.naturvinstipset.se/blogg/${slug}`,
      images: post.imageUrl
        ? [{ url: post.imageUrl, alt: post.title }]
        : [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blogs = await getBlogs();
  const post = blogs.find((b) => b.slug === slug && b.published);
  if (!post) notFound();

  const date = new Date(post.publishedAt).toLocaleDateString("sv-SE", {
    year: "numeric", month: "long", day: "numeric",
  });

  const paragraphs = post.content.split(/\n+/).filter(Boolean);

  return (
    <article>
      {/* ── Hero with title overlay ─────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: "clamp(420px, 65vh, 720px)" }}>
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--fg)]" />
        )}

        {/* Gradient — heavier at bottom so title is legible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(13,13,13,0.15) 0%, rgba(13,13,13,0.30) 40%, rgba(13,13,13,0.82) 100%)",
          }}
        />

        {/* Back link */}
        <div className="absolute top-6 left-6">
          <Link
            href="/blogg"
            className="text-white/70 hover:text-white text-xs font-semibold tracking-[0.18em] uppercase transition-colors"
          >
            ← Blogg
          </Link>
        </div>

        {/* Title block — bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 max-w-3xl">
          <p className="text-white/55 text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            {date}
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
            {post.title}
          </h1>
        </div>
      </div>

      {/* ── Article body ────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 py-14">
        {post.excerpt && (
          <p className="text-lg md:text-xl text-[var(--fg)] leading-relaxed font-medium mb-10 border-l-2 border-[var(--fg)] pl-5">
            {post.excerpt}
          </p>
        )}

        <div className="space-y-6 text-[15px] text-black/70 leading-[1.85]">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-14 pt-8 border-t border-[var(--rule)]">
          <Link
            href="/blogg"
            className="text-sm font-semibold text-[var(--fg)] hover:opacity-60 transition-opacity"
          >
            ← Fler artiklar
          </Link>
        </div>
      </div>
    </article>
  );
}
