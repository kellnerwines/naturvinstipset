import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bars, citySlug, getBarBySlug, getBarsByCity, instagramUrl, mapsUrl } from "@/lib/bars";

export async function generateStaticParams() {
  return bars.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const bar = getBarBySlug(slug);
  if (!bar) return { title: "Naturvinsbar" };
  const title = `${bar.name} – naturvinsbar i ${bar.city}`;
  return {
    title,
    description: bar.description,
    openGraph: { title, description: bar.description, url: `https://www.naturvinstipset.se/naturvinsbarer/${slug}` },
  };
}

export default async function BarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bar = getBarBySlug(slug);
  if (!bar) notFound();

  const nearby = getBarsByCity(bar.city).filter((b) => b.slug !== bar.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": bar.type === "Restaurang" ? "Restaurant" : "BarOrPub",
    name: bar.name,
    description: bar.description,
    address: { "@type": "PostalAddress", streetAddress: bar.address, addressLocality: bar.city, addressCountry: "SE" },
    geo: { "@type": "GeoCoordinates", latitude: bar.lat, longitude: bar.lng },
    ...(bar.website ? { url: bar.website } : {}),
    ...(bar.instagram ? { sameAs: [instagramUrl(bar.instagram)] } : {}),
  };
  const link = "inline-flex items-center text-sm font-semibold border border-[var(--fg)] rounded-full px-4 py-2 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors";

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href={`/naturvinsbarer#${citySlug(bar.city)}`} className="text-sm text-[var(--muted)] hover:text-[var(--fg)] mb-8 inline-block">
        ← Naturvinsbarer i {bar.city}
      </Link>

      <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--muted)] mb-3">
        {bar.type} · {bar.neighborhood}, {bar.city}
      </p>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-5">{bar.name}</h1>
      <p className="text-[var(--muted)] leading-relaxed mb-8 text-[16px]">{bar.description}</p>

      <div className="flex flex-wrap gap-3 mb-10">
        {bar.website ? <a href={bar.website} target="_blank" rel="noopener" className={link}>Webbplats</a> : null}
        {bar.instagram ? <a href={instagramUrl(bar.instagram)} target="_blank" rel="noopener" className={link}>Instagram @{bar.instagram}</a> : null}
        <a href={mapsUrl(bar)} target="_blank" rel="noopener" className={link}>Vägbeskrivning</a>
      </div>

      <div className="border border-[var(--rule)] rounded-xl overflow-hidden mb-12">
        <table className="w-full text-sm">
          <tbody>
            {[
              ["Adress", `${bar.address}, ${bar.city}`],
              ["Stadsdel", bar.neighborhood],
              ["Typ", bar.type],
              ["Vinet", bar.wine_focus],
              ["Mat", bar.food ? "Ja" : "Snacks eller ingen mat"],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-[var(--rule)] last:border-0">
                <td className="px-4 py-2.5 text-[var(--muted)] whitespace-nowrap w-32">{label}</td>
                <td className="px-4 py-2.5 font-medium">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-[var(--muted)] mb-12">
        Öppettider och vinlista ändras ofta. Kolla {bar.instagram ? "Instagram" : "webbplatsen"} innan du går dit.
      </p>

      {nearby.length ? (
        <div className="border-t border-[var(--rule)] pt-10">
          <h2 className="text-lg font-bold mb-5">Fler naturvinsbarer i {bar.city}</h2>
          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {nearby.map((b) => (
              <li key={b.slug}>
                <Link href={`/naturvinsbarer/${b.slug}`} className="font-semibold hover:opacity-60 transition-opacity">{b.name}</Link>
                <span className="text-sm text-[var(--muted)]"> · {b.neighborhood}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
