import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogs } from "@/lib/blob";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blogg",
  description: "Artiklar om naturvin, vinkultur och tips för nybörjare. Lär dig mer om vad som gör naturvin unikt.",
  openGraph: { url: "https://naturvinstipset.se/blogg" },
};

export default async function BloggPage() {
  const blogs = await getBlogs();
  const published = blogs
    .filter((b) => b.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <p className="text-xs font-semibold tracking-widest text-[var(--green)] uppercase mb-3">Blogg</p>
      <h1 className="text-4xl font-bold text-[var(--green-dark)] mb-12 leading-tight">Naturvinsbloggen</h1>

      {published.length === 0 ? (
        <div className="text-center py-20 text-black/40">
          <p className="text-4xl mb-4">✍️</p>
          <p>Artiklar kommer snart.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {published.map((post) => (
            <Link
              key={post.id}
              href={`/blogg/${post.slug}`}
              className="group flex gap-5 p-5 bg-white rounded-xl border border-black/8 hover:border-[var(--green)] hover:shadow-sm transition-all"
            >
              {post.imageUrl && (
                <div className="shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                  <Image src={post.imageUrl} alt={post.title} width={96} height={96} className="object-cover w-full h-full" unoptimized />
                </div>
              )}
              <div>
                <p className="text-xs text-black/40 mb-1">
                  {new Date(post.publishedAt).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" })}
                </p>
                <h2 className="font-bold text-[var(--green-dark)] group-hover:text-[var(--green)] transition-colors mb-2 leading-tight">
                  {post.title}
                </h2>
                <p className="text-sm text-black/60 line-clamp-2">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
