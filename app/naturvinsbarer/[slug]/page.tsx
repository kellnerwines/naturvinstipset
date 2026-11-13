import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
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
    alternates: { canonical: `/naturvinsbarer/${slug}` },
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
  const link = "inline-flex items-center text-sm font-bold border-2 border-[var(--ink)] text-[var(--ink)] rounded-full px-4 py-2 hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors";

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <JsonLd data={[jsonLd, breadcrumbJsonLd([{ name: "Naturvinsbarer", path: "/naturvinsbarer" }, { name: bar.name, path: `/naturvinsbarer/${bar.slug}` }])]} />

      <Link href={`/naturvinsbarer#${citySlug(bar.city)}`} className="font-bold text-[var(--ink)] border-b-2 border-[var(--ink)] hover:text-[var(--accent)] hover:border-[var(--accent)] mb-8 block w-fit">
        ← Naturvinsbarer i {bar.city}
      </Link>

      <p className="inline-block bg-[var(--accent)] text-[var(--fg)] border-2 border-[var(--ink)] text-sm font-bold px-2 py-0.5 mb-4">
        {bar.type} · {bar.neighborhood}, {bar.city}
      </p>
      <h1 className="text-6xl md:text-8xl mb-5">{bar.name}</h1>
      <p className="leading-relaxed mb-8 text-lg">{bar.description}</p>

      <div className="flex flex-wrap gap-3 mb-10">
        {bar.website ? <a href={bar.website} target="_blank" rel="noopener" className={link}>Webbplats</a> : null}
        {bar.instagram ? <a href={instagramUrl(bar.instagram)} target="_blank" rel="noopener" className={link}>Instagram @{bar.instagram}</a> : null}
        <a href={mapsUrl(bar)} target="_blank" rel="noopener" className={link}>Vägbeskrivning</a>
      </div>

      <div className="border-[3px] border-[var(--ink)] bg-[var(--paper)] mb-12">
        <table className="w-full text-[15px]">
          <tbody>
            {[
              ["Adress", `${bar.address}, ${bar.city}`],
              ["Stadsdel", bar.neighborhood],
              ["Typ", bar.type],
              ["Vinet", bar.wine_focus],
              ["Mat", bar.food ? "Ja" : "Snacks eller ingen mat"],
            ].map(([label, value]) => (
              <tr key={label} className="border-b-2 border-[var(--rule)] last:border-0">
                <td className="px-4 py-2.5 font-bold whitespace-nowrap w-32">{label}</td>
                <td className="px-4 py-2.5">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-[var(--muted)] mb-12">
        Öppettider och vinlista ändras ofta. Kolla {bar.instagram ? "Instagram" : "webbplatsen"} innan du går dit.
      </p>

      {nearby.length ? (
        <div className="border-t-[3px] border-[var(--ink)] pt-10">
          <h2 className="text-4xl mb-5">Fler naturvinsbarer i {bar.city}</h2>
          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {nearby.map((b) => (
              <li key={b.slug}>
                <Link href={`/naturvinsbarer/${b.slug}`} className="font-[family-name:var(--font-display)] font-black uppercase text-2xl text-[var(--ink)] hover:text-[var(--accent)]">{b.name}</Link>
                <span className="text-sm text-[var(--muted)]"> · {b.neighborhood}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
