import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/blob";

export const metadata: Metadata = {
  alternates: { canonical: "/om-oss" },
  title: "Om oss",
  description:
    "Vi gör det enklare att hitta naturvin du faktiskt gillar. Ärliga betyg, smart filtrering och en community för alla som älskar naturvin — nybörjare som experter.",
  openGraph: {
    title: "Om oss – Naturvinstipset",
    description: "Vi gör det enklare att hitta naturvin du faktiskt gillar. Ärliga betyg, smart filtrering och en community för alla som älskar naturvin.",
    url: "https://www.naturvinstipset.se/om-oss",
    images: [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
  },
};

export const dynamic = "force-dynamic";

export default async function OmOssPage() {
  const settings = await getSettings().catch(() => ({ retailerCompensation: false }));
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
              Naturvin är fantastiskt — men det kan vara svårt att veta var man ska börja. Vilket vin passar din smak? Vad är egentligen bra? Och var hittar man det, på Systembolaget eller från en webbutik med hemleverans?
            </p>
            <p>
              Det är de frågorna vi startade Naturvinstipset för att svara på.
            </p>
            <p>
              Vi samlar naturviner på Systembolaget eller från webbutiker med hemleverans, betygsätter dem och hjälper dig hitta dem som passar din smak, din budget och din mat. Webbutikerna vi listar säljer till Sverige med svensk alkoholskatt inräknad i priset. Inga gissningar, inga pretentioner — bara ärliga betyg som hjälper dig hitta rätt.
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
            <p>
              Naturvinstipset drivs av grundaren av vinimportören Kellner &amp; Kellner. Viner från egen import är märkta och får ingen fördel i Vinkompassen.
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

      {/* Så rankar vi (BRIEF-KOMPASSEN.md, avsnitt 8) */}
      <section className="border-t border-[var(--rule)] py-16 px-6 scroll-mt-20" id="sa-rankar-vi">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">Oberoende</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--fg)] mb-8 leading-tight">
            Så rankar vi och så tjänar vi pengar
          </h2>
          <div className="space-y-8 text-[var(--muted)] leading-relaxed text-[15px]">
            <div>
              <h3 className="font-semibold text-[var(--fg)] mb-2">Vinkompassen</h3>
              <p>
                Kompassen sorterar först bort viner som inte passar dina hårda val: färg, budget, mat, land, druva och var du vill köpa. Resten får en matchning från 1 till 99 procent. Den räknas fram ur hur nära vinets smakprofil (syra, fyllighet, strävhet och funk) ligger det du har valt, hur många av dina smaktaggar och maträtter som stämmer, och till en liten del vårt eget betyg. Matchar för få viner släpper kompassen ett val i taget och säger vilket.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--fg)] mb-2">Topp 100</h3>
              <p>
                Topplistan börjar med naturvinerna på Systembolaget, ordnade efter ett snitt av vårt betyg och besökarnas betyg, där vårt betyg väger lika mycket som en röst. Räcker de inte till 100 fylls resten av platserna med naturviner med hemleverans från Flaskvis, i importörsordningen Kellner &amp; Kellner, Backyard Wines, Wine Rebels och Nordic 4 Wines.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--fg)] mb-2">Egen import</h3>
              <p>
                Naturvinstipset drivs av grundaren av vinimportören Kellner &amp; Kellner. Därför märks viner som Kellner &amp; Kellner importerar med &quot;Egen import&quot; överallt där de visas. I Vinkompassen ger egen import ingen extra poäng, och det kontrolleras av ett automatiskt test i koden. I Topp 100 kommer Kellner &amp; Kellners viner först bland webbutiksvinerna som fyller ut listan efter Systembolaget-vinerna.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--fg)] mb-2">Pengar</h3>
              {settings.retailerCompensation ? (
                <p>
                  Naturvinstipset kan få ersättning från webbutiker när du köper via våra länkar. Länkarna till dem är då märkta, och ersättningen påverkar inte rankningen. Från Systembolaget får vi ingen ersättning.
                </p>
              ) : (
                <p>
                  Naturvinstipset får i dag ingen ersättning, varken från Systembolaget eller från webbutikerna vi länkar till. Vi räknar hur många som klickar vidare till varje butik, utan kakor och utan att spara IP-adresser. Om vi i framtiden får ersättning från en webbutik står det här, och länkarna till den butiken märks.
                </p>
              )}
              <p className="mt-4">
                Köp och avhämtning sker hos Systembolaget, och köp med hemleverans sker hos webbutiken. Varken Systembolaget eller webbutikerna står bakom innehållet på sajten.
              </p>
            </div>
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
            href="/topp-100"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fg)] border border-[var(--fg)] px-5 py-3 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors"
          >
            Se Topp 100 →
          </Link>
        </div>
      </section>
    </div>
  );
}
