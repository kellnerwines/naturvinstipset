import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogs, getBlogInteractions, getWines, isPostLive } from "@/lib/blob";
import { answer, compassLink } from "@/lib/answers";
import { isAuthenticated } from "@/lib/auth";
import OwnImportBadge from "@/components/OwnImportBadge";
import BlogLikeButton from "@/components/BlogLikeButton";
import BlogComments from "@/components/BlogComments";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blogs = await getBlogs();
  const post = blogs.find((b) => b.slug === slug && isPostLive(b));
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
  // Kommande inlägg kan förhandsgranskas av admin innan publiceringsdagen.
  const found = blogs.find((b) => b.slug === slug && b.published);
  const preview = !!found && !isPostLive(found) && (await isAuthenticated());
  const post = found && (isPostLive(found) || preview) ? found : undefined;
  if (!post) notFound();
  // Vinlistan hämtas live med kompassens motor, så att inlägget alltid visar viner som finns i lager.
  const live = post.wineQuery ? answer(await getWines(), post.wineQuery, 6) : null;

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
      {preview ? (
        <p className="bg-[var(--amber-light)] text-sm text-center px-4 py-2">
          Förhandsvisning: inlägget publiceras {new Date(post.publishedAt).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })} och syns bara för dig som är inloggad.
        </p>
      ) : null}
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

        {live && live.results.length ? (
          <section className="mt-14 border-t border-[var(--rule)] pt-10">
            <h2 className="text-base font-bold text-[var(--fg)] tracking-tight mb-1">{post.wineHeading ?? "Viner som passar just nu"}</h2>
            <p className="text-xs text-[var(--muted)] mb-5">Vinkompassens förslag, uppdaterade med lagerstatus och pris inklusive svensk alkoholskatt.</p>
            <ol className="space-y-3">
              {live.results.map((r) => (
                <li key={r.url} className="border border-[var(--rule)] rounded-lg p-4">
                  <p className="font-bold leading-snug">
                    <a href={r.url.replace("https://www.naturvinstipset.se", "")} className="hover:opacity-60">{r.name}</a>
                    {r.vintage && r.vintage !== "NV" ? ` ${r.vintage}` : ""}
                    {r.ownImport ? <OwnImportBadge className="ml-2 align-middle" /> : null}
                  </p>
                  <p className="text-sm text-[var(--muted)] mt-0.5">{[r.producer, r.type, r.country].filter(Boolean).join(" · ")}</p>
                  <p className="text-sm mt-1.5">
                    ca {r.price} kr hos {r.shop} ·{" "}
                    <a href={r.buyUrl.replace("https://www.naturvinstipset.se", "")} rel="nofollow noopener" target="_blank" className="underline underline-offset-2">
                      {r.shop === "Systembolaget" ? "Se vinet hos Systembolaget" : `Köp hos ${r.shop}`} →
                    </a>
                  </p>
                </li>
              ))}
            </ol>
            <Link href={compassLink(post.wineQuery!)} className="inline-block mt-5 text-sm font-semibold underline underline-offset-4">
              Finjustera i Vinkompassen →
            </Link>
          </section>
        ) : null}

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
