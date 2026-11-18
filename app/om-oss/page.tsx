import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSettings, getWines, getRatings } from "@/lib/blob";
import { answer } from "@/lib/answers";
import { toCompassWine, type CompassWine } from "@/lib/compass/engine";
import JsonLd from "@/components/JsonLd";
import { SITE, publisherRef } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/om-oss" },
  title: "Så funkar Naturvinstipset",
  description:
    "Hur Vinkompassen matchar naturvin mot din smak, vad betygen betyder, vem som står bakom och varför butikerna inte betalar för att synas.",
  openGraph: {
    title: "Så funkar Naturvinstipset",
    description: "Hur Vinkompassen matchar naturvin mot din smak, vad betygen betyder och vem som står bakom.",
    url: "https://www.naturvinstipset.se/om-oss",
    images: [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
  },
};

export const dynamic = "force-dynamic";

// Exemplet i "Varför matchar vinet dig?" är ett riktigt svar från kompassen med de här valen.
const EXAMPLE = { farg: "rott", budget: "199", mat: "kott", syra: "4", fyllighet: "2", stravhet: "2", funk: "2" };
const EXAMPLE_AXES: [string, keyof typeof EXAMPLE, "syra" | "fyllighet" | "stravhet" | "funk"][] = [
  ["Syra", "syra", "syra"], ["Fyllighet", "fyllighet", "fyllighet"], ["Strävhet", "stravhet", "stravhet"], ["Funk", "funk", "funk"],
];

// Vilka som står bakom sajten, som strukturerad data (samma uppgifter som i "Vem står bakom?").
const KELLNER = { "@type": "Organization", name: "Kellner & Kellner", url: "https://www.kellnerwines.se" };
const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: `${SITE}/om-oss`,
  name: "Så funkar Naturvinstipset",
  about: publisherRef,
  mainEntity: [
    { "@type": "Person", name: "Simon Kellner", worksFor: KELLNER, memberOf: publisherRef, image: `${SITE}/om/simon-och-stefan.jpg` },
    { "@type": "Person", name: "Stefan Kellner", worksFor: KELLNER, memberOf: publisherRef, image: `${SITE}/om/simon-och-stefan.jpg` },
  ],
};

const card = "border-[3px] border-[var(--ink)] bg-[var(--paper)]";
const h3 = "font-display font-black uppercase text-[var(--ink)] leading-none";

function Meter({ wine, you }: { wine: number; you: number }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <i key={n} className={`relative w-[26px] h-3 border-2 border-[var(--ink)] ${n <= wine ? "bg-[var(--ink)]" : ""}`}>
          {n === you ? <span className="absolute left-1/2 -top-[7px] -bottom-[7px] w-[3px] -ml-[1.5px] bg-[var(--accent)]" /> : null}
        </i>
      ))}
    </span>
  );
}

function Verdict({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span className={`inline-block text-[13px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${ok ? "bg-[var(--ink)] text-[var(--paper)]" : "border-2 border-[var(--ink)] text-[var(--ink)]"}`}>
      {children}
    </span>
  );
}

function Dots({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 20" aria-hidden="true">
      <path d="M2 10 H58" stroke="var(--ink)" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
    </svg>
  );
}

const row = "grid grid-cols-[84px_1fr] sm:grid-cols-[92px_1fr_140px] gap-x-3 gap-y-2 items-center py-2.5 text-[15px]";

export default async function OmOssPage() {
  const [settings, wines, ratings] = await Promise.all([
    getSettings().catch(() => ({ retailerCompensation: false })),
    getWines(),
    getRatings().catch(() => []),
  ]);
  const W = wines.map(toCompassWine).filter((w): w is CompassWine => !!w);
  const shops = [...new Set(W.map((w) => w.shop))].sort((a, b) => Number(b === "Systembolaget") - Number(a === "Systembolaget"));
  const webShops = shops.filter((s) => s !== "Systembolaget");

  const ex = answer(wines, EXAMPLE, 1).results[0];
  const exSlug = ex?.url.split("/viner/")[1];
  const exWine = exSlug ? wines.find((w) => w.slug === exSlug) : undefined;
  const exVotes = exWine ? ratings.filter((r) => r.wineId === exWine.id) : [];
  const exCommunity = exVotes.length ? Math.round((exVotes.reduce((s, r) => s + r.stars, 0) / exVotes.length) * 10) / 10 : null;
  const fmt = (n: number) => n.toFixed(1).replace(".", ",");

  return (
    <div>
      <JsonLd data={aboutJsonLd} />
      {/* 1. Rubrik och faktarad */}
      <section className="px-6 pt-16 md:pt-20 pb-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-[clamp(52px,9vw,112px)]">Så funkar<br />Naturvinstipset</h1>
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mt-5">
            Vi samlar naturvinerna som går att köpa i Sverige just nu och ger varje vin en smakprofil. Vinkompassen
            jämför profilerna med det du gillar, och sedan köper du vinet där det säljs.
          </p>
          <div className={`${card} grid grid-cols-2 md:grid-cols-4 mt-10`}>
            {[
              [String(W.length), "naturviner som går att köpa just nu"],
              [String(shops.length), `ställen att köpa: Systembolaget och ${webShops.length} webbutiker med hemleverans`],
              ["Löpande", "kontrolleras pris och lager hos Systembolaget"],
              ["4", "smakmått per vin: syra, fyllighet, strävhet och funk, från 1 till 5"],
            ].map(([n, t], i) => (
              <div key={i} className={`p-5 border-[var(--ink)] ${i % 2 === 0 ? "border-r-[3px]" : "md:border-r-[3px]"} ${i < 2 ? "border-b-[3px] md:border-b-0" : ""} ${i === 3 ? "md:border-r-0" : ""}`}>
                <div className={`font-display font-black text-[var(--ink)] leading-none ${n.length > 3 ? "text-[34px] pt-2.5" : "text-[54px]"}`}>{n}</div>
                <p className="text-[15px] text-[var(--muted)] mt-1.5">{t}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-[var(--muted)] mt-2.5">Butikerna: {shops.join(", ")}.</p>
        </div>
      </section>

      {/* 2. Två problem, en lösning */}
      <section className="px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(38px,5.6vw,68px)]">Två sidor av samma hylla</h2>
          <div className="grid md:grid-cols-2 gap-5 md:gap-7 mt-9">
            {[
              ["var(--wine-vitt)", "Du som dricker vin", "Hundratals naturviner. Vilket passar dig?", "Etiketten säger sällan hur vinet smakar, och utbudet är stort. Det slutar ofta i en chansning eller i samma flaska som förra gången."],
              ["var(--wine-petnat)", "Importörer och butiker", "Bra viner som ingen hittar", "Ett litet vin från en liten producent drunknar lätt i sortimentet. Alkoholreklam är hårt begränsad, så det går inte att köpa sig synlig."],
            ].map(([color, who, title, text]) => (
              <div key={who} className={card}>
                <div className="h-[18px] border-b-[3px] border-[var(--ink)]" style={{ background: color }} />
                <div className="p-6">
                  <p className="font-bold text-[15px] mb-2">{who}</p>
                  <h3 className={`${h3} text-[28px] mb-2.5`}>{title}</h3>
                  <p className="text-[var(--muted)]">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <svg className="block w-full h-[70px] md:h-[110px]" viewBox="0 0 1000 110" preserveAspectRatio="none" aria-hidden="true">
            <path d="M250 0 C250 60 500 40 500 104" fill="none" stroke="var(--ink)" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d="M750 0 C750 60 500 40 500 104" fill="none" stroke="var(--ink)" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="relative overflow-hidden bg-[var(--ink)] border-[3px] border-[var(--ink)] text-center px-5 py-9 md:px-8 md:py-11">
            <span aria-hidden="true" className="absolute rounded-full bg-[var(--accent)] w-[130px] h-[130px] -right-[60px] -top-[70px] md:w-[260px] md:h-[260px] md:-right-20 md:-top-[110px]" />
            <h2 className="relative !text-[var(--paper)] text-[clamp(38px,5.6vw,68px)]">Naturvinstipset kopplar ihop dem</h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-lg text-[var(--paper)] opacity-90">
              Vinkompassen matchar vinerna mot din smak och länkar dig till stället där vinet säljs. Vi säljer inget
              själva, och butikerna betalar inget för att synas.
            </p>
            <div className="relative flex flex-wrap justify-center gap-2.5 mt-6">
              {["Matchat efter smak", "Länk till köp", "Oberoende betyg"].map((t) => (
                <span key={t} className="rounded-full bg-[var(--paper)] text-[var(--fg)] font-bold text-[15px] px-4 py-2">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tre steg */}
      <section className="px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(38px,5.6vw,68px)]">Från fråga till flaska</h2>
          <div className="grid md:grid-cols-[1fr_60px_1fr_60px_1fr] items-start mt-10">
            {[
              ["/om/steg-1-kompassen.jpg", "Vinkompassens första fråga: vilken färg är du sugen på?", "Svara på tre frågor", "Färg, budget och vad du ska äta. Du kan också skriva fritt, till exempel \"vitt till skaldjur\"."],
              ["/om/steg-2-matchning.jpg", "Ett förslag från kompassen med matchning i procent och smakprofil", "Se hur nära vinet ligger din smak", "Varje vin får en matchning i procent. Fäll ut kortet så ser du vinets profil med dina val markerade."],
              ["/om/steg-3-kop.jpg", "Vinsidan med knappen Köp på Systembolaget", "Köp där vinet finns", "Knappen går direkt till Systembolaget eller webbutiken. Själva köpet sker hos dem."],
            ].flatMap(([src, alt, title, text], i) => [
              ...(i > 0 ? [
                <div key={`d${i}`} className="flex justify-center items-center h-[76px] md:h-auto md:pt-[240px]" aria-hidden="true">
                  <Dots className="w-[60px] h-5 rotate-90 md:rotate-0" />
                </div>,
              ] : []),
              <div key={src}>
                <div className="border-[3px] border-[var(--ink)] bg-[var(--fg)] p-2 max-w-[290px] mx-auto">
                  <Image src={src} alt={alt} width={540} height={1000} className="block w-full h-auto" />
                </div>
                <div className="max-w-[290px] mx-auto mt-5">
                  <div className="w-11 h-11 rounded-full bg-[var(--accent)] border-[3px] border-[var(--ink)] grid place-items-center font-display font-black text-2xl mb-3">{i + 1}</div>
                  <h3 className={`${h3} text-[26px] mb-2`}>{title}</h3>
                  <p className="text-[var(--muted)]">{text}</p>
                </div>
              </div>,
            ])}
          </div>
        </div>
      </section>

      {/* 4. Varför matchar vinet dig? Riktigt svar från kompassen. */}
      {ex ? (
        <section className="px-6 py-14">
          <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_1.15fr] gap-10 md:gap-12 items-center">
            <div>
              <h2 className="text-[clamp(38px,5.6vw,68px)]">Varför matchar vinet dig?</h2>
              <p className="text-lg text-[var(--muted)] mt-5">
                Matchningen bygger på hur nära vinets smakprofil ligger det du valde. Här är kompassens bästa förslag just
                nu för rött till kött för högst 199 kr, med frisk syra, lätt kropp och lite funk.
              </p>
              <p className="text-sm text-[var(--muted)] mt-4">
                Viner som inte klarar dina hårda val, som färg och budget, sorteras bort först. Matchningen väger också in
                smaktaggar, mat och till en liten del vårt eget betyg.
              </p>
            </div>
            <div className={card}>
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center p-5 border-b-[3px] border-[var(--ink)]">
                <div>
                  <Link href={`/viner/${exSlug}`} className={`${h3} text-[30px] hover:underline`}>
                    {ex.name} {ex.vintage}
                  </Link>
                  <p className="text-sm text-[var(--muted)] mt-1.5">{ex.producer}, {ex.country}. {ex.grape}.</p>
                </div>
                <div className="text-right">
                  <b className="block font-display font-black text-[64px] leading-[.9] text-[var(--accent)]">{ex.match} %</b>
                  <span className="text-[13px] text-[var(--muted)]">matchning</span>
                </div>
              </div>
              <div className="px-5 pt-2 pb-4">
                {EXAMPLE_AXES.map(([label, q, f]) => {
                  const you = Number(EXAMPLE[q]), wine = ex.flavour[f], d = Math.abs(you - wine);
                  return (
                    <div key={label} className={`${row} border-b border-[var(--rule)]`}>
                      <span className="font-bold">{label}</span>
                      <Meter wine={wine} you={you} />
                      <span className="col-start-2 sm:col-start-auto sm:text-right"><Verdict ok={d === 0}>{d === 0 ? "Precis rätt" : d === 1 ? "Ett steg ifrån" : `${d} steg ifrån`}</Verdict></span>
                    </div>
                  );
                })}
                <div className={`${row} border-b border-[var(--rule)]`}>
                  <span className="font-bold">Pris</span>
                  <span>{ex.price} kr hos {ex.shop}</span>
                  <span className="col-start-2 sm:col-start-auto sm:text-right"><Verdict ok={ex.price <= 199}>{ex.price <= 199 ? "Inom budget" : "Över budget"}</Verdict></span>
                </div>
                {ex.foodPairing ? (
                  <div className={row}>
                    <span className="font-bold">Mat</span>
                    <span className="sm:col-span-2">{ex.foodPairing}</span>
                  </div>
                ) : null}
              </div>
              <div className="flex gap-5 text-[13px] text-[var(--muted)] px-5 pb-4">
                <span className="flex items-center gap-1.5"><i className="w-3.5 h-2.5 bg-[var(--ink)]" />Vinet</span>
                <span className="flex items-center gap-1.5"><i className="w-[3px] h-4 bg-[var(--accent)]" />Ditt val</span>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* 5. Tre siffror, tre frågor */}
      {ex && exWine ? (
        <section className="px-6 py-14">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-[clamp(38px,5.6vw,68px)]">Tre siffror, tre frågor</h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mt-5">
              Ett betyg säger hur bra ett vin är eller vad andra tyckte. Matchningen säger om det passar dig. Därför visar
              vi dem var för sig.
            </p>
            <div className="grid md:grid-cols-3 gap-5 mt-9">
              <div className={`${card} p-6`}>
                <p className="font-bold text-[15px]">Redaktionens betyg</p>
                <div className="font-display font-black text-[64px] leading-none text-[var(--ink)] my-2.5">{exWine.adminRating > 0 ? fmt(exWine.adminRating) : "Inget än"}</div>
                <p className="text-[var(--muted)]">Vår bedömning av vinet, av fem. Den är densamma för alla.</p>
              </div>
              <div className={`${card} p-6`}>
                <p className="font-bold text-[15px]">Besökarnas betyg</p>
                {exCommunity !== null ? (
                  <div className="font-display font-black text-[64px] leading-none text-[var(--ink)] my-2.5">{fmt(exCommunity)}</div>
                ) : (
                  <div className="font-display font-black text-[34px] leading-none text-[var(--muted)] pt-4 pb-3">Inga betyg än</div>
                )}
                <p className="text-[var(--muted)]">Vad andra som druckit vinet tycker. Inget konto behövs för att sätta ett betyg.</p>
              </div>
              <div className="border-[3px] border-[var(--ink)] bg-[var(--accent)] p-6">
                <p className="font-bold text-[15px]">Din matchning</p>
                <div className="font-display font-black text-[64px] leading-none my-2.5">{ex.match} %</div>
                <p>Hur väl vinet passar just dina svar. Med andra svar kan samma vin hamna långt ner.</p>
              </div>
            </div>
            <p className="text-[13px] text-[var(--muted)] mt-2.5">Siffrorna gäller {ex.name} {ex.vintage} och uppdateras när betygen ändras.</p>
          </div>
        </section>
      ) : null}

      {/* 6. Modellen */}
      <section className="px-6 py-14 bg-[var(--surface)] border-y-[3px] border-[var(--ink)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(38px,5.6vw,68px)]">Vem betalar för det här?</h2>
          <p className="text-lg text-[var(--muted)] mt-5">{settings.retailerCompensation ? "Så här hänger det ihop." : "Ingen, i dag. Så här hänger det ihop."}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-9">
            {[
              ["var(--wine-petnat)", "Gratis att använda", "Kompassen, listorna och betygen kostar inget, och du behöver inget konto."],
              settings.retailerCompensation
                ? ["var(--wine-vitt)", "Märkta länkar", "Vi kan få ersättning från webbutiker när du köper via våra länkar. De länkarna är märkta, och ersättningen påverkar inte rankningen."]
                : ["var(--wine-vitt)", "Ingen ersättning från butikerna", "Varken Systembolaget eller webbutikerna betalar oss. Om det ändras står det här, och länkarna till den butiken märks."],
              ["var(--accent)", "Egen import märks alltid", "Sajten drivs av Simon och Stefan på vinimporten Kellner & Kellner. Deras viner märks \"Egen import\" och får ingen förtur i kompassen eller i Topp 100."],
              ["var(--ink)", "Klick räknas utan kakor", "Vi räknar hur många som klickar vidare till varje butik, utan kakor och utan att spara IP-adresser."],
            ].map(([color, title, text]) => (
              <div key={title} className={`${card} p-6`}>
                <div className="w-[34px] h-[34px] rounded-full border-[3px] border-[var(--ink)] mb-4" style={{ background: color }} />
                <h3 className={`${h3} text-[26px] mb-2.5`}>{title}</h3>
                <p className="text-[15.5px] text-[var(--muted)]">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 font-bold"><a href="#sa-rankar-vi" className="underline">Så räknar vi fram Topp 100 och matchningen</a></p>
        </div>
      </section>

      {/* 7. Människorna bakom */}
      <section className="px-6 py-14" id="kontakt">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[300px_1fr] gap-8 md:gap-10 items-center">
          <div className="aspect-[4/5] max-w-[260px] md:max-w-none border-[3px] border-[var(--ink)] overflow-hidden">
            <Image src="/om/simon-och-stefan.jpg" alt="Simon och Stefan från Kellner & Kellner" width={900} height={1200} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-[clamp(38px,5.6vw,68px)]">Vem står bakom?</h2>
            <p className="text-lg text-[var(--muted)] mt-5 max-w-2xl">
              Naturvinstipset görs av Simon och Stefan, som driver vinimporten Kellner &amp; Kellner. Vi importerar själva
              naturvin från Portugal och Frankrike, och därför märks våra egna viner överallt där de syns här.
            </p>
            <p className="text-lg text-[var(--muted)] mt-4">
              Frågor, tips eller ett vin som saknas? Skriv till <a href="mailto:hej@naturvinstipset.se" className="underline text-[var(--ink)]">hej@naturvinstipset.se</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Så rankar vi: hela redovisningen (länkas från llms.txt och /api/kompass) */}
      <section className="border-t-[3px] border-[var(--ink)] py-14 px-6 scroll-mt-20" id="sa-rankar-vi">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[clamp(32px,4.5vw,52px)] mb-8">Så rankar vi och så tjänar vi pengar</h2>
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
                Topplistan börjar med naturvinerna på Systembolaget, ordnade efter ett snitt av vårt betyg och besökarnas betyg, där vårt betyg väger lika mycket som en röst. Räcker de inte till 100 fylls resten av platserna med naturviner med hemleverans från Flaskvis, från Kellner &amp; Kellner, Backyard Wines, Wine Rebels och Nordic 4 Wines. De ordnas också efter betyg, och ingen importör får förtur.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--fg)] mb-2">Egen import</h3>
              <p>
                Naturvinstipset drivs av Simon och Stefan på vinimporten Kellner &amp; Kellner. Därför märks viner som Kellner &amp; Kellner importerar med &quot;Egen import&quot; överallt där de visas. Egen import ger ingen extra poäng i Vinkompassen och ingen förtur i Topp 100. Båda delarna kontrolleras av automatiska tester i koden.
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

      {/* Avslutning */}
      <section className="border-t-[3px] border-[var(--ink)] py-16 px-6 text-center">
        <h2 className="text-[clamp(38px,5.6vw,68px)]">Vilket naturvin passar dig?</h2>
        <p className="text-[var(--muted)] mt-3 mb-7">Tre frågor, sedan dina förslag.</p>
        <Link href="/" className="inline-block bg-[var(--accent)] text-[var(--fg)] border-[3px] border-[var(--ink)] font-bold text-lg px-7 py-3.5 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">
          Starta Vinkompassen
        </Link>
      </section>
    </div>
  );
}
