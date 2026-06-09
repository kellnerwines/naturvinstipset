import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWines, getRatings, combinedRating } from "@/lib/blob";

export const dynamic = "force-dynamic";

const PROFILER: Record<string, { label: string; description: string; intro: string }> = {
  mineralisk: {
    label: "Mineralisk",
    description:
      "Mineraliska naturviner med salt, kritig karaktär och frisk syra. Hitta de bästa mineraliska naturvinerna på Systembolaget.",
    intro:
      "Mineraliska naturviner kännetecknas av en salt, kritig eller stenig karaktär som ofta kopplas till vinets terroir — den jord och det klimat där druvorna odlades. De har vanligtvis hög syra och en lång, fräsch eftersmak. Passar utmärkt till skaldjur, fisk och ljusa rätter.",
  },
  fruktig: {
    label: "Fruktig",
    description:
      "Fruktig naturviner med tydliga fruktiga aromer. Hitta de bästa fruktiga naturvinerna på Systembolaget.",
    intro:
      "Fruktig naturviner har tydliga aromer av färsk eller mogen frukt — allt från citrus och röda bär till tropisk frukt och stenfrukter. De är ofta tillgängliga och lättdruckna, och ett utmärkt val för den som är ny till naturvin.",
  },
  jordig: {
    label: "Jordig",
    description:
      "Jordiga naturviner med djupa, komplexa smaker. Hitta de bästa jordiga naturvinerna på Systembolaget.",
    intro:
      "Jordiga naturviner har en karaktär som påminner om fuktig jord, svamp, tryffel eller löv. Det är komplexa viner med djup och karaktär som ofta passar bra till matlagning med svamp, vilt och rotfrukter.",
  },
  latt: {
    label: "Lätt",
    description:
      "Lätta naturviner med låg alkohol och frisk karaktär. Hitta de bästa lätta naturvinerna på Systembolaget.",
    intro:
      "Lätta naturviner är luftiga och lättdruckna med låg alkohol och frisk syra. De passar till aperitif, picknick och lättare maträtter. Många pét nats och lätta röda viner hamnar i den här kategorin.",
  },
  funk: {
    label: "Funk",
    description:
      "Funky naturviner med brett, komplext och utmanande smakprofil. Hitta de bästa funky naturvinerna på Systembolaget.",
    intro:
      "Funky naturviner är de mest utmanande och komplexa i naturvinsvärld. De kan ha toner av cider, brett, läder, fermenterade frukter eller ladugård. Funk är inte ett fel — det är en stil som många naturvinsälskare aktivt söker. Utmärkt för den nyfikne.",
  },
};

export async function generateStaticParams() {
  return Object.keys(PROFILER).map((profil) => ({ profil }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ profil: string }>;
}): Promise<Metadata> {
  const { profil } = await params;
  const data = PROFILER[profil];
  if (!data) return { title: "Smakprofil" };
  return {
    title: `${data.label} naturvin på Systembolaget | Naturvinstipset`,
    description: data.description,
    openGraph: {
      title: `${data.label} naturvin på Systembolaget`,
      description: data.description,
      url: `https://www.naturvinstipset.se/smakprofil/${profil}`,
    },
  };
}

export default async function SmakprofilPage({
  params,
}: {
  params: Promise<{ profil: string }>;
}) {
  const { profil } = await params;
  const data = PROFILER[profil];
  if (!data) notFound();

  const [wines, ratings] = await Promise.all([getWines(), getRatings()]);

  const matchingWines = wines
    .filter(
      (w) =>
        w.published &&
        w.flavorTags?.some(
          (t) => t.toLowerCase() === data.label.toLowerCase()
        )
    )
    .sort((a, b) => {
      const scoreA = combinedRating(a, ratings);
      const scoreB = combinedRating(b, ratings);
      return scoreB - scoreA;
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${data.label} naturvin på Systembolaget`,
    description: data.description,
    url: `https://www.naturvinstipset.se/smakprofil/${profil}`,
    publisher: { "@type": "Organization", name: "Naturvinstipset" },
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div className="border-b border-[var(--rule)] pt-16 pb-14 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--muted)] mb-4">
            Smakprofil
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--fg)] mb-4 leading-tight tracking-tight">
            {data.label} naturvin på Systembolaget
          </h1>
          <p className="text-base text-[var(--muted)] leading-relaxed max-w-lg">
            {data.intro}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {matchingWines.length === 0 ? (
          <p className="text-[var(--muted)]">
            Inga viner hittades för denna smakprofil just nu.{" "}
            <Link href="/" className="underline">
              Se hela listan
            </Link>
            .
          </p>
        ) : (
          <>
            <p className="text-sm text-[var(--muted)] mb-8">
              {matchingWines.length} vin
              {matchingWines.length !== 1 ? "er" : ""} med smakprofilen{" "}
              <strong>{data.label.toLowerCase()}</strong>
            </p>
            <div className="space-y-4">
              {matchingWines.map((wine) => {
                const score = combinedRating(wine, ratings);
                return (
                  <Link
                    key={wine.id}
                    href={`/viner/${wine.slug}`}
                    className="block bg-white border border-black/8 rounded-xl p-5 hover:border-[var(--green)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--fg)] truncate">
                          {wine.name}
                          {wine.year ? ` ${wine.year}` : ""}
                        </p>
                        <p className="text-sm text-[var(--muted)] mt-0.5">
                          {wine.producer}
                          {wine.country ? ` · ${wine.country}` : ""}
                        </p>
                        {wine.description && (
                          <p className="text-sm text-[var(--muted)] mt-2 line-clamp-2">
                            {wine.description}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-[var(--fg)]">
                          {score.toFixed(1)}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {wine.wineType}
                        </p>
                        {wine.price && (
                          <p className="text-xs text-[var(--muted)] mt-1">
                            {wine.price} kr
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Other profiles */}
        <div className="mt-16 pt-12 border-t border-[var(--rule)]">
          <p className="text-sm font-semibold text-[var(--muted)] mb-4 uppercase tracking-wider">
            Andra smakprofiler
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PROFILER)
              .filter(([key]) => key !== profil)
              .map(([key, val]) => (
                <Link
                  key={key}
                  href={`/smakprofil/${key}`}
                  className="text-sm border border-black/10 px-4 py-2 rounded-full hover:border-[var(--green)] transition-colors"
                >
                  {val.label}
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
