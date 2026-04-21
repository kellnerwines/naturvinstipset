import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Om oss – Naturvinstipset",
  description:
    "Vi startade Naturvinstipset för att göra det enklare att hitta naturviner på Systembolaget. Läs om vår mission och kom i kontakt med oss.",
  openGraph: { url: "https://naturvinstipset.se/om-oss" },
};

export default function OmOssPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-[var(--rule)] pt-20 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">Om oss</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--fg)] leading-tight tracking-tight mb-6">
            Vi gör det enklare att hitta naturvin.
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            Naturvin ska inte vara komplicerat. Vi skapade Naturvinstipset för att du snabbt ska hitta något gott — utan att behöva läsa dig igenom tusen recensioner eller förstå termer som bara sommelier-studenter kan.
          </p>
        </div>
      </section>

      {/* About text + illustration */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-1 space-y-6 text-[var(--muted)] leading-relaxed text-[15px]">
            <p>
              Systembolaget har hundratals naturviner i sortimentet — men de är svåra att hitta. Det finns inget filter för naturvin, och etiketterna berättar sällan vad som faktiskt är i glaset.
            </p>
            <p>
              Vår topp 100-lista är gjord för dig som är nyfiken på naturvin men inte vet var du ska börja. Varje vin har en tydlig smakprofil, ett ärligt betyg och en direktlänk till Systembolaget.
            </p>
            <p>
              Vi är inte sponsrade av producenter eller importörer. Betygen sätts av oss och av er som besöker sajten — ett betyg per person, inget konto behövs.
            </p>
            <p>
              Har du hittat ett naturvin vi missat, eller vill du tipsa om ett vin du gillar? Hör av dig.
            </p>
          </div>

          <div className="shrink-0 flex justify-center md:justify-start">
            <Image
              src="/logo.png"
              alt="Naturvinstipset illustration"
              width={110}
              height={166}
              unoptimized
              className="opacity-75"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-[var(--rule)] py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-10">Vad vi tror på</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Enkelhet",
                body: "Naturvin behöver inte förklaras med jargong. Vi håller det enkelt och rakt på sak.",
              },
              {
                title: "Ärlighet",
                body: "Betyg och smakprofiler speglar vad vi faktiskt tycker — inte vad producenten vill att vi ska tycka.",
              },
              {
                title: "Tillgänglighet",
                body: "Alla viner vi listar finns eller har funnits på Systembolaget. Inga obskyra importörer.",
              },
            ].map((v) => (
              <div key={v.title}>
                <h3 className="font-bold text-[var(--fg)] mb-2">{v.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t border-[var(--rule)] py-16 px-6" id="kontakt">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">Kom i kontakt</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-6 leading-tight">
            Frågor, tips eller samarbeten?
          </h2>
          <p className="text-[var(--muted)] text-[15px] leading-relaxed mb-8 max-w-md">
            Vi svarar på allt — vinstips, frågor om sajten och förfrågningar om samarbeten. Hör av dig till oss direkt på mejl.
          </p>

          <a
            href="mailto:hej@naturvinstipset.se"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--fg)] border border-[var(--fg)] px-5 py-3 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
          >
            hej@naturvinstipset.se →
          </a>

          <div className="mt-12 pt-8 border-t border-[var(--rule-xs)] grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--faint)] mb-2">Mejl</p>
              <a href="mailto:hej@naturvinstipset.se" className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors">
                hej@naturvinstipset.se
              </a>
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[var(--faint)] mb-2">Svartid</p>
              <p className="text-[var(--muted)]">Vi svarar vanligtvis inom 2–3 dagar.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--rule)] py-16 px-6">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <h2 className="text-xl font-bold text-[var(--fg)]">Redo att hitta ditt nästa naturvin?</h2>
          <Link
            href="/"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fg)] border border-[var(--fg)] px-5 py-3 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
          >
            Se Topp 100 →
          </Link>
        </div>
      </section>
    </div>
  );
}
