import type { Metadata } from "next";
import Link from "next/link";
import { getBarsByCity } from "@/lib/bars";

export const metadata: Metadata = {
  title: "Bästa naturvinsbarerna i Stockholm 2026 | Naturvinstipset",
  description:
    "Naturvinstipsets guide till de 15 bästa ställena att dricka naturvin i Stockholm — från Södermalms mysiga vinbarer till Östermalms avskalade alternativ. Med adresser, priser och omdömen.",
  openGraph: {
    title: "Bästa naturvinsbarerna i Stockholm 2026",
    description:
      "Naturvinstipsets guide till de bästa ställena att dricka naturvin i Stockholm.",
    url: "https://www.naturvinstipset.se/basta-naturvinsbarer-stockholm",
  },
};

const priceLabels: Record<string, string> = {
  $: "$ — Budgetvänligt",
  $$: "$$ — Mellanklass",
  $$$: "$$$ — Premium",
};

const pageFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Vad är en naturvinsbar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "En naturvinsbar är en bar eller restaurang med ett dedikerat urval av naturviner — viner gjorda med minimal inblandning, ekologiska druvor och utan eller med minimala tillsatser. Naturvinsbarerna kännetecknas av kunnig personal, roterande listor och en filosofi om äkthet framför kontroll.",
      },
    },
    {
      "@type": "Question",
      name: "Var hittar jag naturvin i Stockholm?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stockholms naturvinsscen är koncentrerad till Södermalm och Vasastan, men finns i hela staden. De bästa ställena inkluderar Dryck Wine Bar, Alba Vinbar och VINA på Södermalm, samt Savant Bar, Nektar och Grus Grus i Vasastan.",
      },
    },
    {
      "@type": "Question",
      name: "Vilket är det bästa stället för orange vin i Stockholm?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ambar på Tomtebogatan i Vasastan är Stockholms mest dedikerade destination för orangevin, kombinerat med japansk husmanskost. Dryck Wine Bar och Alba Vinbar på Södermalm erbjuder också bra urval av orangeviner på glas.",
      },
    },
    {
      "@type": "Question",
      name: "Vilka naturvinsbarer på Södermalm rekommenderar ni?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "På Södermalm rekommenderar vi Alba Vinbar nära Nytorget, Dryck Wine Bar vid Mariatorget, Café Nizza på östra Söder, VINA vid Garbos torg och Stockholm Ost & Chark på Renstiernas gata. Alla har naturvin på glas och välkomnande atmosfär.",
      },
    },
    {
      "@type": "Question",
      name: "Var kan nybörjare testa naturvin i Stockholm?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Alba Vinbar på Södermalm och Nektar i Vasastan är utmärkta för nybörjare — välkomnande atmosfär, kunnig personal och tillgängliga urval. Bar Oas i city är prisvänligast. Alla på den här listan har personal som gärna guidar dig rätt.",
      },
    },
  ],
};

export default function BastaNaturvinsbarer() {
  const stockholmBars = getBarsByCity("Stockholm");

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Bästa naturvinsbarerna i Stockholm 2026",
    description:
      "Naturvinstipsets guide till de bästa ställena att dricka naturvin i Stockholm",
    url: "https://www.naturvinstipset.se/basta-naturvinsbarer-stockholm",
    publisher: { "@type": "Organization", name: "Naturvinstipset" },
    hasPart: stockholmBars.map((bar) => ({
      "@type": "BarOrPub",
      name: bar.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: bar.address,
        addressLocality: "Stockholm",
        addressCountry: "SE",
      },
    })),
  };

  const barSchemas = stockholmBars.map((bar) => ({
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: bar.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: bar.address,
      addressLocality: "Stockholm",
      addressCountry: "SE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: bar.lat,
      longitude: bar.lng,
    },
    servesCuisine: "Natural Wine",
    priceRange: bar.price_level,
    ...(bar.website ? { url: bar.website } : {}),
  }));

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageFaqJsonLd) }}
      />
      {barSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Hero */}
      <div className="border-b border-[var(--rule)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">
            Stockholm · Guide
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--fg)] mb-4 leading-tight tracking-tight">
            Bästa naturvinsbarerna i Stockholm 2026
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Naturvinstipsets guide till de {stockholmBars.length} bästa ställena
            att dricka naturvin i Stockholm — från Södermalms mysiga vinbarer
            till Vasastans kunskapstunga adresser och overrated-fria alternativ
            utanför city.
          </p>
        </div>
      </div>

      {/* Jump links by neighborhood */}
      <div className="border-b border-[var(--rule)] bg-[var(--bg)] sticky top-14 z-10">
        <div className="max-w-2xl mx-auto px-6 py-3 flex gap-5 overflow-x-auto text-xs text-[var(--muted)] whitespace-nowrap">
          {[...new Set(stockholmBars.map((b) => b.neighborhood))].map((n) => (
            <a
              key={n}
              href={`#${n.toLowerCase().replace(/\s/g, "-")}`}
              className="hover:text-[var(--fg)] transition-colors shrink-0"
            >
              {n}
            </a>
          ))}
        </div>
      </div>

      {/* Bar list */}
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-16">
        {stockholmBars.map((bar, i) => (
          <article
            key={bar.slug}
            id={bar.neighborhood.toLowerCase().replace(/\s/g, "-")}
            className="scroll-mt-32"
          >
            <div className="flex items-start gap-5 mb-4">
              <span className="shrink-0 text-xs font-medium text-[var(--faint)] pt-1.5 w-5 text-right tabular-nums">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <h2 className="text-xl md:text-2xl font-bold text-[var(--fg)] leading-tight">
                    <Link
                      href={`/naturvinsbarer/${bar.slug}`}
                      className="hover:opacity-70 transition-opacity"
                    >
                      {bar.name}
                    </Link>
                  </h2>
                  <span className="shrink-0 text-sm font-medium text-[var(--muted)] mt-1">
                    {bar.price_level}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] mb-4">
                  {bar.neighborhood} · {bar.type}
                </p>

                <p className="text-[var(--muted)] leading-relaxed text-[15px] mb-6">
                  {bar.description}
                </p>

                {/* Specs table */}
                <div className="border border-black/8 rounded-xl overflow-hidden mb-6">
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
                        <tr
                          key={label}
                          className="border-b border-black/5 last:border-0"
                        >
                          <td className="px-4 py-2.5 text-[var(--muted)] whitespace-nowrap w-40">
                            {label}
                          </td>
                          <td className="px-4 py-2.5 font-medium text-[var(--fg)]">
                            {value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Our review */}
                <div className="bg-[var(--green-light)] rounded-xl p-5 mb-6">
                  <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[var(--muted)] mb-2">
                    Naturvinstipsets omdöme
                  </p>
                  <p className="text-[15px] text-[var(--fg)] leading-relaxed">
                    {bar.our_review}
                  </p>
                </div>

                {/* Per-bar FAQ */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-[var(--fg)]">
                    Är {bar.name} en bra naturvinsbar i Stockholm?
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {bar.faq_is_good}
                  </p>
                  <h3 className="font-semibold text-[var(--fg)]">
                    Har {bar.name} naturvin på glas?
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {bar.faq_glass_pours}
                  </p>
                  <h3 className="font-semibold text-[var(--fg)]">
                    Måste man boka bord på {bar.name}?
                  </h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {bar.faq_booking}
                  </p>
                </div>

                <div className="mt-5">
                  <Link
                    href={`/naturvinsbarer/${bar.slug}`}
                    className="inline-flex items-center text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--fg)] border-b border-[var(--fg)] hover:opacity-60 transition-opacity pb-px"
                  >
                    Mer om {bar.name} →
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Page FAQ */}
      <div className="border-t border-[var(--rule)] py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--fg)] mb-10">
            Vanliga frågor om naturvinsbarer i Stockholm
          </h2>
          <div className="space-y-8">
            {[
              {
                q: "Vad är en naturvinsbar?",
                a: "En naturvinsbar är en bar eller restaurang med ett dedikerat urval av naturviner — viner gjorda med minimal inblandning, ekologiska druvor och utan eller med minimala tillsatser. Naturvinsbarerna kännetecknas av kunnig personal, roterande listor och en filosofi om äkthet framför kontroll.",
              },
              {
                q: "Var hittar jag naturvin i Stockholm?",
                a: "Stockholms naturvinsscen är koncentrerad till Södermalm och Vasastan, men finns i hela staden. De bästa ställena inkluderar Dryck Wine Bar, Alba Vinbar och VINA på Södermalm, samt Savant Bar, Nektar och Grus Grus i Vasastan.",
              },
              {
                q: "Vilket är det bästa stället för orange vin i Stockholm?",
                a: "Ambar på Tomtebogatan i Vasastan är Stockholms mest dedikerade destination för orangevin, kombinerat med japansk husmanskost. Dryck Wine Bar och Alba Vinbar på Södermalm erbjuder också bra urval av orangeviner på glas.",
              },
              {
                q: "Vilka naturvinsbarer på Södermalm rekommenderar ni?",
                a: "På Södermalm rekommenderar vi Alba Vinbar nära Nytorget, Dryck Wine Bar vid Mariatorget, Café Nizza på östra Söder, VINA vid Garbos torg och Stockholm Ost & Chark på Renstiernas gata. Alla har naturvin på glas och välkomnande atmosfär.",
              },
              {
                q: "Var kan nybörjare testa naturvin i Stockholm?",
                a: "Alba Vinbar på Södermalm och Nektar i Vasastan är utmärkta för nybörjare — välkomnande atmosfär, kunnig personal och tillgängliga urval. Bar Oas i city är prisvänligast. Alla på den här listan har personal som gärna guidar dig rätt.",
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <h3 className="font-semibold text-[var(--fg)] mb-2">{q}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-[var(--rule)] py-16 px-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-1">
              Köp hem ett naturvin
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Vår rankning av de bästa naturvinerna på Systembolaget.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fg)] border border-[var(--fg)] px-5 py-3 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
          >
            Se Topp 100 →
          </Link>
        </div>
      </div>
    </div>
  );
}
