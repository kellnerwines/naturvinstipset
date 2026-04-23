import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Om oss – Naturvinstipset",
  description:
    "Vi gör det enklare att hitta naturvin du faktiskt gillar. Ärliga betyg, smart filtrering och en community för alla som älskar naturvin — nybörjare som experter.",
  openGraph: {
    title: "Om oss – Naturvinstipset",
    description: "Vi gör det enklare att hitta naturvin du faktiskt gillar. Ärliga betyg, smart filtrering och en community för alla som älskar naturvin.",
    url: "https://www.naturvinstipset.se/om-oss",
    images: [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
  },
};

export default function OmOssPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-[var(--rule)] pt-20 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">Om oss</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--fg)] leading-tight tracking-tight mb-6">
            Vi gör det enklare att hitta naturvin du faktiskt gillar.
          </h1>
        </div>
      </section>

      {/* About text + illustration */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-1 space-y-6 text-[var(--muted)] leading-relaxed text-[15px]">
            <p>
              Naturvin är fantastiskt — men det kan vara svårt att veta var man ska börja. Vilket vin passar din smak? Vad är egentligen bra? Och hur hittar man det på Systembolaget?
            </p>
            <p>
              Det är de frågorna vi startade Naturvinstipset för att svara på.
            </p>
            <p>
              Vi samlar de bästa naturvinerna på Systembolaget, betygsätter dem och låter dig filtrera efter din smakprofil. Inga gissningar, inga pretentioner — bara ärliga betyg som hjälper dig hitta rätt.
            </p>
            <p>
              Men lika viktigt som våra egna betyg är dina. Vi bygger en community där naturvinsälskare på alla nivåer kan betygsätta, dela och tipsa varandra. Nybörjare som precis testat sitt första naturvin är lika välkomna som den som druckit det i tio år.
            </p>
            <p>
              Saknar du ett naturvin i vår lista? Tipsa oss gärna.
            </p>
            <p>
              Tillsammans gör vi det lättare för fler att hitta viner de verkligen gillar.
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

      {/* Contact */}
      <section className="border-t border-[var(--rule)] py-16 px-6" id="kontakt">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">Kom i kontakt</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-6 leading-tight">
            Frågor, tips eller samarbeten?
          </h2>
          <p className="text-[var(--muted)] text-[15px] leading-relaxed mb-8 max-w-md">
            Hör av dig till oss direkt på mejl.
          </p>

          <a
            href="mailto:hej@naturvinstipset.se"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--fg)] border border-[var(--fg)] px-5 py-3 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
          >
            hej@naturvinstipset.se →
          </a>
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
