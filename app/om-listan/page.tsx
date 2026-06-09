import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Om listan – Hur vi betygsätter naturvin | Naturvinstipset",
  description:
    "Alla viner på Naturvinstipsets lista håller hög kvalitet. Vi betygsätter på fyra parametrar: syra, fyllighet, strävhet och funk — så att du hittar rätt stil, inte bara ett generiskt bra vin.",
  openGraph: {
    title: "Om listan – Hur vi betygsätter naturvin",
    description:
      "Vi betygsätter naturvin på fyra parametrar: syra, fyllighet, strävhet och funk. Så här fungerar listan.",
    url: "https://www.naturvinstipset.se/om-listan",
  },
};

const parameters = [
  {
    name: "Syra",
    description:
      "Hur friskt och levande vinet känns i munnen. Högt syravärde ger en syrlig, pigg karaktär. Lågt syravärde ger ett mjukare, rundare vin.",
  },
  {
    name: "Fyllighet",
    description:
      "Vinets kropp och vikt. Ett lätt vin känns luftigt och lättdrucket. Ett fylligt vin har mer substans och passar bättre till mat.",
  },
  {
    name: "Strävhet",
    description:
      "Tanninerna — den snuddande, torra känslan som framförallt finns i röda viner. Högt värde passar den som gillar klassiska, stadiga röda. Lågt värde passar lättare stilar.",
  },
  {
    name: "Funk",
    description:
      "Hur utmanande vinet är smakmässigt — från rent och tillgängligt till brett och komplext. Funk är inte ett fel och inte ett krav. Det är en stil.",
  },
];

const schemaJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Om listan – Naturvinstipset",
  description:
    "Hur Naturvinstipset väljer ut och betygsätter naturvin. Fyra smakparametrar: syra, fyllighet, strävhet och funk.",
  url: "https://www.naturvinstipset.se/om-listan",
  publisher: {
    "@type": "Organization",
    name: "Naturvinstipset",
    url: "https://www.naturvinstipset.se",
  },
};

export default function OmListanPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      {/* Hero */}
      <div className="border-b border-[var(--rule)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">
            Om listan
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--fg)] mb-4 leading-tight tracking-tight">
            Hur vi betygsätter
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Alla viner håller hög kvalitet. Men kvalitet säger ingenting om vad
            just du tycker om.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-16">
        {/* Intro */}
        <section>
          <p className="text-[var(--muted)] leading-relaxed text-[15px] mb-4">
            Alla viner på vår lista håller hög kvalitet. Det är utgångspunkten.
            Vi lägger inte upp viner vi inte tror på — listan är ett resultat av
            noggrant urval i samarbete med Sveriges seriösaste
            naturvinsimportörer.
          </p>
          <p className="text-[var(--muted)] leading-relaxed text-[15px]">
            Men kvalitet säger ingenting om vad just du tycker om. Därför
            betygsätter vi varje vin på fyra parametrar som hjälper dig hitta
            rätt stil, inte bara ett generiskt bra vin.
          </p>
        </section>

        {/* Parameters */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--fg)] leading-tight mb-8">
            De fyra parametrarna
          </h2>
          <div className="space-y-8">
            {parameters.map((p) => (
              <div key={p.name} className="flex gap-6">
                <div className="shrink-0 w-24">
                  <span className="text-sm font-semibold text-[var(--fg)]">
                    {p.name}
                  </span>
                </div>
                <p className="text-[var(--muted)] leading-relaxed text-[15px]">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Editorial */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--fg)] leading-tight mb-4">
            Det redaktionella betyget
          </h2>
          <p className="text-[var(--muted)] leading-relaxed text-[15px]">
            Parametrarna sätts av redaktionen på Naturvinstipset, grundade i
            praktisk erfarenhet av naturvin och nära kontakt med de importörer
            och producenter vars viner finns på listan.
          </p>
        </section>

        {/* Community */}
        <section>
          <h2 className="text-xl md:text-2xl font-bold text-[var(--fg)] leading-tight mb-4">
            Community-betyget
          </h2>
          <p className="text-[var(--muted)] leading-relaxed text-[15px]">
            Utöver det redaktionella betyget kan du som användare betygsätta med
            stjärnor och skriva egna recensioner. Community-betyget visas separat
            på varje vinkort så att du alltid ser skillnaden.
          </p>
        </section>

        {/* Contact */}
        <section className="border-t border-[var(--rule)] pt-12">
          <p className="text-[var(--muted)] leading-relaxed text-[15px]">
            Har du frågor om hur vi betygsätter eller saknar ett vin? Hör av dig
            till{" "}
            <a
              href="mailto:hej@naturvinstipset.se"
              className="text-[var(--fg)] underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              hej@naturvinstipset.se
            </a>
          </p>
        </section>
      </div>

      {/* CTA */}
      <div className="border-t border-[var(--rule)] py-16 px-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--fg)] mb-1">
              Se listan
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Rankad lista med direktlänkar till Systembolaget.
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
