import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogs, getBlogInteractions } from "@/lib/blob";
import BlogLikeButton from "@/components/BlogLikeButton";
import BlogComments from "@/components/BlogComments";

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
  const [blogs, allInteractions] = await Promise.all([getBlogs(), getBlogInteractions()]);
  const post = blogs.find((b) => b.slug === slug && b.published);
  if (!post) notFound();

  const postInteractions = allInteractions.filter((i) => i.blogId === post.id);
  const likeCount = postInteractions.filter((i) => i.type === "like").length;
  const comments = postInteractions
    .filter((i) => i.type === "comment")
    .map(({ id, name, comment, createdAt }) => ({ id, name, comment, createdAt }));

  const date = new Date(post.publishedAt).toLocaleDateString("sv-SE", {
    year: "numeric", month: "long", day: "numeric",
  });

  const blocks = post.content.split(/\n+/).filter(Boolean);

  // Parse inline [text](url) markdown links into React nodes
  function parseInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    const re = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
    let last = 0, m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      parts.push(
        <a key={m.index} href={m[2]} className="underline underline-offset-2 hover:opacity-60 transition-opacity">
          {m[1]}
        </a>
      );
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }

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
          {blocks.map((block, i) => {
            if (block.startsWith("## ")) {
              return (
                <h2 key={i} className="text-base font-bold text-[var(--fg)] mt-10 mb-2 tracking-tight">
                  {block.slice(3)}
                </h2>
              );
            }
            return <p key={i}>{parseInline(block)}</p>;
          })}
        </div>

        {/* Like + Comments */}
        <div className="mt-14">
          <BlogLikeButton blogId={post.id} initialCount={likeCount} />
          <BlogComments blogId={post.id} initial={comments} />
        </div>

        {/* Footer */}
        <div className="mt-10 pt-8 border-t border-[var(--rule)]">
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
