import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBarBySlug, bars } from "@/lib/bars";

const priceLabels: Record<string, string> = {
  $: "$ — Budgetvänligt",
  $$: "$$ — Mellanklass",
  $$$: "$$$ — Premium",
};

export async function generateStaticParams() {
  return bars.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const bar = getBarBySlug(slug);
  if (!bar) return { title: "Vinbar" };
  return {
    title: `${bar.name} – Naturvinsbar i ${bar.city} | Naturvinstipset`,
    description: bar.description,
    openGraph: {
      title: `${bar.name} – Naturvinsbar i ${bar.city}`,
      description: bar.description,
      url: `https://www.naturvinstipset.se/naturvinsbarer/${slug}`,
    },
  };
}

export default async function BarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bar = getBarBySlug(slug);
  if (!bar) notFound();

  const citySlug = `basta-naturvinsbarer-${bar.city.toLowerCase()}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: bar.name,
    description: bar.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: bar.address,
      addressLocality: bar.city,
      addressCountry: bar.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: bar.lat,
      longitude: bar.lng,
    },
    servesCuisine: "Natural Wine",
    priceRange: bar.price_level,
    ...(bar.website ? { url: bar.website } : {}),
    ...(bar.instagram ? { sameAs: [`https://instagram.com/${bar.instagram}`] } : {}),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Är ${bar.name} en bra naturvinsbar i ${bar.city}?`,
        acceptedAnswer: { "@type": "Answer", text: bar.faq_is_good },
      },
      {
        "@type": "Question",
        name: `Har ${bar.name} naturvin på glas?`,
        acceptedAnswer: { "@type": "Answer", text: bar.faq_glass_pours },
      },
      {
        "@type": "Question",
        name: `Måste man boka bord på ${bar.name}?`,
        acceptedAnswer: { "@type": "Answer", text: bar.faq_booking },
      },
    ],
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Link
        href={`/${citySlug}`}
        className="text-sm text-black/40 hover:text-[var(--green)] mb-8 inline-block"
      >
        ← Bästa naturvinsbarerna i {bar.city}
      </Link>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--green-light)] text-[var(--green-dark)]">
          {bar.type}
        </span>
        <span className="text-xs text-[var(--muted)]">{bar.neighborhood} · {bar.city}</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-[var(--green-dark)] leading-tight mb-6">
        {bar.name}
      </h1>

      <p className="text-black/70 leading-relaxed mb-8 text-[15px]">
        {bar.description}
      </p>

      {/* Specs */}
      <div className="border border-black/8 rounded-xl overflow-hidden mb-10">
        <table className="w-full text-sm">
          <tbody>
            {[
              ["Adress", bar.address],
              ["Stadsdel", bar.neighborhood],
              ["Typ", bar.type],
              ["Prisnivå", priceLabels[bar.price_level]],
              ["Mat", bar.food ? "Ja" : "Nej"],
              ["Naturvin på glas", bar.glass_pours ? "Ja" : "Nej"],
              ["Rekommenderas för", bar.recommended_for],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-2.5 text-black/40 whitespace-nowrap w-40">{label}</td>
                <td className="px-4 py-2.5 font-medium">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Our review */}
      <div className="bg-[var(--green-light)] rounded-xl p-6 mb-12">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[var(--muted)] mb-3">
          Naturvinstipsets omdöme
        </p>
        <p className="text-[15px] text-[var(--fg)] leading-relaxed">{bar.our_review}</p>
      </div>

      {/* FAQ */}
      <div className="border-t border-black/8 pt-10">
        <h2 className="text-lg font-bold text-[var(--green-dark)] mb-8">Vanliga frågor</h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-[var(--green-dark)] mb-2">
              Är {bar.name} en bra naturvinsbar i {bar.city}?
            </h3>
            <p className="text-sm text-black/70 leading-relaxed">{bar.faq_is_good}</p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--green-dark)] mb-2">
              Har {bar.name} naturvin på glas?
            </h3>
            <p className="text-sm text-black/70 leading-relaxed">{bar.faq_glass_pours}</p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--green-dark)] mb-2">
              Måste man boka bord på {bar.name}?
            </h3>
            <p className="text-sm text-black/70 leading-relaxed">{bar.faq_booking}</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-black/8 mt-16 pt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <p className="font-semibold text-[var(--fg)] mb-1">Köp hem naturvin</p>
          <p className="text-sm text-black/50">Vår rankning av de bästa naturvinerna på Systembolaget.</p>
        </div>
        <Link
          href="/"
          className="shrink-0 text-sm font-semibold text-[var(--fg)] border border-[var(--fg)] px-5 py-3 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
        >
          Se Topp 100 →
        </Link>
      </div>
    </div>
  );
}
