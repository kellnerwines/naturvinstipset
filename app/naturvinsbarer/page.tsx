import type { Metadata } from "next";
import Link from "next/link";
import BarMap from "@/components/BarMap";
import { bars, CITIES, citySlug, getBarsByCity, instagramUrl, mapsUrl, type Bar } from "@/lib/bars";

const TITLE = "Naturvinsbarer i Sverige 2026";
const DESCRIPTION =
  "Naturvinstipsets guide till naturvinsbarer i Stockholm, Göteborg, Malmö, Uppsala och Örebro. Med karta, adresser, webbplatser och Instagram.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://www.naturvinstipset.se/naturvinsbarer" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "https://www.naturvinstipset.se/naturvinsbarer" },
};

const FAQ = [
  {
    q: "Vad är en naturvinsbar?",
    a: "En bar eller restaurang där en stor del av vinlistan är naturvin: vin av ekologiskt odlade druvor som jäst spontant och gjorts med lite eller inget tillsatt svavel. Listorna byts ofta och personalen hjälper gärna till att hitta rätt.",
  },
  {
    q: "Var finns flest naturvinsbarer i Sverige?",
    a: "I Stockholm, främst på Södermalm och i Vasastan. Göteborg har sina kring Järntorget, Haga och Vasastaden, och i Malmö ligger de i Gamla Väster, Davidshall och runt Möllevången.",
  },
  {
    q: "Vilka naturvinsbarer finns i Göteborg?",
    a: "Bar La Lune i Vasastaden, Folk i Folkteaterns foajé vid Järntorget och Bar Minimal på Skanstorget.",
  },
  {
    q: "Vilka naturvinsbarer finns i Malmö?",
    a: "Julie i Gamla Väster, Riket vid Davidshallstorg, Ava Vinbar vid Karlskronaplan och Far i Hatten i Folkets Park.",
  },
];

function BarCard({ bar }: { bar: Bar }) {
  const link = "text-sm font-semibold text-[var(--fg)] underline underline-offset-4 decoration-[var(--rule)] hover:decoration-[var(--fg)]";
  return (
    <article className="border border-[var(--rule)] rounded-xl p-5 bg-[var(--card)]">
      <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--muted)] mb-1.5">
        {bar.type} · {bar.neighborhood}
      </p>
      <h3 className="text-xl font-bold leading-tight tracking-tight mb-2">
        <Link href={`/naturvinsbarer/${bar.slug}`} className="hover:opacity-60 transition-opacity">{bar.name}</Link>
      </h3>
      <p className="text-[15px] text-[var(--muted)] leading-relaxed mb-3">{bar.description}</p>
      <p className="text-sm text-[var(--muted)] mb-4">
        {bar.address}, {bar.city} · <span className="text-[var(--fg)]">{bar.wine_focus}</span>
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {bar.website ? <a href={bar.website} target="_blank" rel="noopener" className={link}>Webbplats</a> : null}
        {bar.instagram ? <a href={instagramUrl(bar.instagram)} target="_blank" rel="noopener" className={link}>Instagram @{bar.instagram}</a> : null}
        <a href={mapsUrl(bar)} target="_blank" rel="noopener" className={link}>Vägbeskrivning</a>
      </div>
    </article>
  );
}

export default function Naturvinsbarer() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESCRIPTION,
    url: "https://www.naturvinstipset.se/naturvinsbarer",
    publisher: { "@type": "Organization", name: "Naturvinstipset" },
    hasPart: bars.map((b) => ({
      "@type": b.type === "Restaurang" ? "Restaurant" : "BarOrPub",
      name: b.name,
      url: `https://www.naturvinstipset.se/naturvinsbarer/${b.slug}`,
      address: { "@type": "PostalAddress", streetAddress: b.address, addressLocality: b.city, addressCountry: "SE" },
      geo: { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lng },
      ...(b.website || b.instagram ? { sameAs: [b.website, b.instagram && instagramUrl(b.instagram)].filter(Boolean) } : {}),
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  const cities = CITIES.filter((c) => getBarsByCity(c).length);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="border-b border-[var(--rule)] pt-16 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">Guide · Hela Sverige</p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">Naturvinsbarer i Sverige</h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-xl">
            {bars.length} ställen i {cities.length} städer där naturvinet står i centrum. Vinbarer, bistroer och ett par pizzerior,
            alla med länk till webbplats och Instagram så att du ser vad som är på gång just nu.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-10">
        <BarMap bars={bars} cities={cities} />
        <p className="text-xs text-[var(--muted)] mt-2">Tryck på en prick för att se stället. Klicka i kartan för att zooma med scrollhjulet.</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-14">
        {cities.map((city) => (
          <section key={city} id={citySlug(city)} className="scroll-mt-24">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">{city}</h2>
            <p className="text-sm text-[var(--muted)] mb-6">{getBarsByCity(city).length} naturvinsbarer</p>
            <div className="grid gap-4 md:grid-cols-2">
              {getBarsByCity(city).map((bar) => <BarCard key={bar.slug} bar={bar} />)}
            </div>
          </section>
        ))}
        <p className="text-sm text-[var(--muted)]">
          Saknar du ett ställe eller har något stängt? Mejla oss via <Link href="/om-oss" className="underline underline-offset-4">Om oss</Link>.
        </p>
      </div>

      <div className="border-t border-[var(--rule)] py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-10">Vanliga frågor om naturvinsbarer</h2>
          <div className="space-y-8">
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--rule)] py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Hitta ett naturvin att ta hem</h2>
            <p className="text-sm text-[var(--muted)]">Vinkompassen tipsar om naturvin på Systembolaget och från webbutiker.</p>
          </div>
          <Link href="/" className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold border border-[var(--fg)] px-5 py-3 hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors">
            Starta Vinkompassen →
          </Link>
        </div>
      </div>
    </div>
  );
}
