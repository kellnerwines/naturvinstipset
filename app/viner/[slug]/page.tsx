import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWines, getRatings, combinedRating } from "@/lib/blob";
import { StarDisplay } from "@/components/Stars";
import RatingForm from "@/components/RatingForm";
import LikeButton from "@/components/LikeButton";
import { buildWineProductJsonLd, getArticleNumber } from "@/lib/wineJsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const wines = await getWines();
  const wine = wines.find((w) => w.slug === slug && w.published);
  if (!wine) return { title: "Vin" };
  const pageTitle = `${wine.name}${wine.year ? ` ${wine.year}` : ""}`;
  const ogTitle = `${pageTitle} – Naturvinstipset`;
  const ogImageAlt = `${pageTitle}${wine.wineType ? ` ${wine.wineType.toLowerCase()} naturvin` : " naturvin"}${wine.country ? ` från ${wine.country}` : ""}`;
  return {
    title: pageTitle,
    description: wine.description,
    openGraph: {
      title: ogTitle,
      description: wine.description,
      url: `https://www.naturvinstipset.se/viner/${slug}`,
      images: wine.primaryImageUrl
        ? [{ url: wine.primaryImageUrl, alt: ogImageAlt }]
        : [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
    },
  };
}

function ProfileMeter({ label, value }: { label: string; value: number }) {
  const filled = Math.round(Math.max(0, Math.min(5, value)));
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs text-[var(--muted)] w-20 shrink-0">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={`h-1.5 w-8 rounded-full ${n <= filled ? "bg-[var(--fg)]" : "bg-[var(--fg)] opacity-10"}`} />
        ))}
      </div>
      <span className="text-xs text-[var(--faint)]">{value}/5</span>
    </div>
  );
}

const typeColor: Record<string, string> = {
  Rött:        "bg-red-100 text-red-700",
  Vitt:        "bg-yellow-100 text-yellow-700",
  Rosé:        "bg-pink-100 text-pink-700",
  Orange:      "bg-orange-100 text-orange-700",
  Mousserande: "bg-blue-100 text-blue-700",
  "Pét Nat":   "bg-purple-100 text-purple-700",
};

export default async function WinePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [wines, ratings] = await Promise.all([getWines(), getRatings()]);
  const wine = wines.find((w) => w.slug === slug && w.published);
  if (!wine) notFound();

  const wineRatings = ratings.filter((r) => r.wineId === wine.id);
  const likeCount = wineRatings.filter((r) => r.liked).length;
  const score = combinedRating(wine, ratings);

  const articleNumber = getArticleNumber(wine);

  const specs = [
    { label: "Producent", value: wine.producer },
    { label: "Land", value: wine.country },
    { label: "Region", value: wine.region },
    { label: "Druva", value: wine.grape },
    { label: "Vintyp", value: wine.wineType },
    { label: "Årgång", value: wine.year },
    { label: "Pris", value: wine.price ? `${wine.price} kr` : undefined },
    { label: "Systembolaget art.nr", value: articleNumber },
  ].filter((s) => s.value);

  const producerWines = wine.producer
    ? wines.filter((w) => w.published && w.id !== wine.id && w.producer === wine.producer).slice(0, 4)
    : [];

  const regionalWines = (wine.region || wine.country)
    ? wines
        .filter((w) => w.published && w.id !== wine.id && !producerWines.some((p) => p.id === w.id))
        .filter((w) => wine.region ? w.region === wine.region : w.country === wine.country)
        .slice(0, 4)
    : [];

  const jsonLd = buildWineProductJsonLd(wine, {
    combinedRating: score,
    communityCount: wineRatings.length,
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Link href="/" className="text-sm text-black/40 hover:text-[var(--green)] mb-8 inline-block">
        ← Tillbaka till listan
      </Link>

      {/* Top section */}
      <div className="grid md:grid-cols-2 gap-10 mb-14 items-start">
        {/* Image */}
        <div className="bg-[var(--green-light)] aspect-[3/4] rounded-xl overflow-hidden flex items-center justify-center">
          {wine.primaryImageUrl ? (
            <Image src={wine.primaryImageUrl} alt={`${wine.name}${wine.year ? ` ${wine.year}` : ""}${wine.wineType ? ` ${wine.wineType.toLowerCase()} naturvin` : " naturvin"}${wine.country ? ` från ${wine.country}` : ""}`} width={400} height={530} className="object-cover w-full h-full" unoptimized />
          ) : (
            <span className="text-6xl">🍷</span>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColor[wine.wineType] ?? "bg-gray-100 text-gray-600"}`}>
              {wine.wineType}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[var(--green-dark)] leading-tight mb-1">
            {wine.name}
          </h1>
          {wine.year && <p className="text-lg text-black/40 mb-4">{wine.year}</p>}

          <div className="mb-6">
            <StarDisplay rating={score} count={wineRatings.length} />
          </div>

          <p className="text-black/70 leading-relaxed mb-6">{wine.description}</p>

          {/* Flavor tags */}
          {wine.flavorTags && wine.flavorTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {wine.flavorTags.map((t) => (
                <span key={t} className="text-sm bg-[var(--green-light)] text-[var(--green-dark)] px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          )}

          {/* Specs */}
          <div className="border-t border-black/8 pt-4 space-y-2 mb-6">
            {specs.map((s) => (
              <div key={s.label} className="flex justify-between text-sm gap-4">
                <span className="text-black/40 shrink-0">{s.label}</span>
                <span className="font-medium text-right">{s.value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {wine.systembolagetUrl && (
            <a
              href={wine.systembolagetUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block text-center bg-[var(--green)] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[var(--green-dark)] transition-colors"
            >
              Köp på Systembolaget →
            </a>
          )}
        </div>
      </div>

      {/* Smakprofil */}
      {(wine.syra != null || wine.fyllighet != null || wine.funk != null || wine.stravhet != null || wine.flavorNotes) && (
        <div className="mb-14 max-w-2xl">
          <h2 className="text-sm font-semibold tracking-[0.15em] uppercase text-[var(--muted)] mb-5">Smakprofil</h2>
          <div className="space-y-3 mb-4">
            {wine.syra      != null && <ProfileMeter label="Syra"      value={wine.syra} />}
            {wine.fyllighet != null && <ProfileMeter label="Fyllighet" value={wine.fyllighet} />}
            {wine.funk      != null && <ProfileMeter label="Funk"      value={wine.funk} />}
            {wine.stravhet  != null && <ProfileMeter label="Strävhet"  value={wine.stravhet} />}
          </div>
          {wine.flavorNotes && (
            <p className="text-sm text-[var(--muted)] leading-relaxed italic mt-4">{wine.flavorNotes}</p>
          )}
        </div>
      )}

      {/* AEO intro + long description */}
      <div className="mb-14 max-w-2xl">
        <h2 className="text-lg font-bold text-[var(--green-dark)] mb-4">Om vinet</h2>
        <p className="text-black/70 leading-relaxed mb-4">
          {wine.year ? `${wine.name} ${wine.year}` : wine.name} är ett{" "}
          {wine.wineType.toLowerCase()}{" "}
          <Link href="/vad-ar-naturvin" className="underline underline-offset-2 hover:text-[var(--green)]">naturvin</Link>
          {wine.country ? ` från ${wine.country}` : ""}
          {wine.region ? ` (${wine.region})` : ""}
          {wine.producer ? `, producerat av ${wine.producer}` : ""}.
          {wine.grape ? ` Vinet görs på ${wine.grape}.` : ""}
          {wine.flavorTags && wine.flavorTags.length > 0
            ? ` Smakprofil: ${wine.flavorTags.join(", ").toLowerCase()}.`
            : ""}
          {" "}Det finns på Systembolaget i Sverige.
        </p>
        {wine.longDescription && (
          <p className="text-black/70 leading-relaxed whitespace-pre-line">{wine.longDescription}</p>
        )}
      </div>

      {/* Rating section */}
      <div className="border-t border-black/8 pt-12">
        <h2 className="text-lg font-bold text-[var(--green-dark)] mb-2">
          Vad tycker du?
        </h2>
        <p className="text-sm text-black/50 mb-6">
          Inget konto behövs. En röst per person och vin.
        </p>
        <div className="flex items-center gap-3 mb-8">
          <LikeButton wineId={wine.id} likeCount={likeCount} />
          <span className="text-sm text-black/30">eller ge ett detaljerat betyg nedan</span>
        </div>
        <RatingForm wineId={wine.id} />
      </div>

      {/* User reviews */}
      {wineRatings.filter((r) => r.comment).length > 0 && (
        <div className="mt-10">
          <h3 className="text-sm font-semibold text-black/50 uppercase tracking-widest mb-4">Kommentarer</h3>
          <div className="space-y-4">
            {wineRatings
              .filter((r) => r.comment)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((r) => (
                <div key={r.id} className="bg-white rounded-xl p-4 border border-black/8">
                  <div className="flex items-center gap-2 mb-2">
                    <StarDisplay rating={r.stars} />
                    <span className="text-xs text-black/30">
                      {new Date(r.createdAt).toLocaleDateString("sv-SE")}
                    </span>
                  </div>
                  <p className="text-sm text-black/70">{r.comment}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* AEO FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `Vad smakar ${wine.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: wine.flavorNotes
                    ? wine.flavorNotes
                    : `${wine.name} är ett ${wine.wineType.toLowerCase()} naturvin${wine.flavorTags?.length ? ` med smakprofil: ${wine.flavorTags.join(", ").toLowerCase()}` : ""}.${wine.syra != null ? ` Syra: ${wine.syra}/5.` : ""}${wine.fyllighet != null ? ` Fyllighet: ${wine.fyllighet}/5.` : ""}${wine.funk != null ? ` Funk: ${wine.funk}/5.` : ""}`,
                },
              },
              ...(wine.grape ? [{
                "@type": "Question",
                name: `Vilka druvor ingår i ${wine.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${wine.name} görs på ${wine.grape}${wine.country ? ` från ${wine.country}` : ""}.`,
                },
              }] : []),
              {
                "@type": "Question",
                name: `Vad passar ${wine.name} till?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: wine.wineType === "Orange"
                    ? `${wine.name} passar utmärkt till kryddiga rätter, ostar och grönsaker tack vare sin skalkontakt och komplexa smakprofil.`
                    : wine.wineType === "Pét Nat" || wine.wineType === "Mousserande"
                    ? `${wine.name} är ett mousserande vin som passar till aperitif, skaldjur och lättare rätter.`
                    : wine.wineType === "Rött"
                    ? `${wine.name} passar till kött och mörkare rätter.${wine.stravhet != null && wine.stravhet <= 2 ? " Med låg strävhet kan det serveras kylt och fungerar nästan som ett vitt." : ""}`
                    : `${wine.name} passar till ljusare rätter och fungerar som ett klassiskt matvin.`,
                },
              },
            ],
          }),
        }}
      />
      <div className="mt-14 max-w-2xl border-t border-black/8 pt-12">
        <h2 className="text-lg font-bold text-[var(--green-dark)] mb-8">Vanliga frågor</h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-semibold text-[var(--green-dark)] mb-2">Vad smakar {wine.name}?</h3>
            <p className="text-sm text-black/70 leading-relaxed">
              {wine.flavorNotes
                ? wine.flavorNotes
                : `${wine.name} är ett ${wine.wineType.toLowerCase()} naturvin${wine.flavorTags?.length ? ` med smakprofil: ${wine.flavorTags.join(", ").toLowerCase()}` : ""}.${wine.syra != null ? ` Syra: ${wine.syra}/5.` : ""}${wine.fyllighet != null ? ` Fyllighet: ${wine.fyllighet}/5.` : ""}${wine.funk != null ? ` Funk: ${wine.funk}/5.` : ""}`}
            </p>
          </div>
          {wine.grape && (
            <div>
              <h3 className="font-semibold text-[var(--green-dark)] mb-2">Vilka druvor ingår i {wine.name}?</h3>
              <p className="text-sm text-black/70 leading-relaxed">
                {wine.name} görs på {wine.grape}{wine.country ? ` från ${wine.country}` : ""}.
              </p>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-[var(--green-dark)] mb-2">Vad passar {wine.name} till?</h3>
            <p className="text-sm text-black/70 leading-relaxed">
              {wine.wineType === "Orange"
                ? `${wine.name} passar utmärkt till kryddiga rätter, ostar och grönsaker tack vare sin skalkontakt och komplexa smakprofil.`
                : wine.wineType === "Pét Nat" || wine.wineType === "Mousserande"
                ? `${wine.name} är ett mousserande vin som passar till aperitif, skaldjur och lättare rätter.`
                : wine.wineType === "Rött"
                ? `${wine.name} passar till kött och mörkare rätter.${wine.stravhet != null && wine.stravhet <= 2 ? " Med låg strävhet kan det serveras kylt och fungerar nästan som ett vitt." : ""}`
                : `${wine.name} passar till ljusare rätter och fungerar som ett klassiskt matvin.`}
            </p>
          </div>
        </div>
      </div>

      {/* Related: same producer */}
      {producerWines.length > 0 && (
        <div className="mt-14 max-w-2xl border-t border-black/8 pt-12">
          <h2 className="text-lg font-bold text-[var(--green-dark)] mb-6">Fler viner från {wine.producer}</h2>
          <ul className="space-y-3">
            {producerWines.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/viner/${w.slug}`}
                  className="flex items-center justify-between group py-2 border-b border-black/5 last:border-0"
                >
                  <span className="font-medium group-hover:text-[var(--green)] transition-colors">
                    {w.name}{w.year ? ` ${w.year}` : ""}
                  </span>
                  <span className="text-xs text-black/40">{w.wineType}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related: same region/country */}
      {regionalWines.length > 0 && (
        <div className="mt-14 max-w-2xl border-t border-black/8 pt-12">
          <h2 className="text-lg font-bold text-[var(--green-dark)] mb-6">
            Andra naturviner från {wine.region ?? wine.country}
          </h2>
          <ul className="space-y-3">
            {regionalWines.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/viner/${w.slug}`}
                  className="flex items-center justify-between group py-2 border-b border-black/5 last:border-0"
                >
                  <span className="font-medium group-hover:text-[var(--green)] transition-colors">
                    {w.name}{w.year ? ` ${w.year}` : ""}
                  </span>
                  <span className="text-xs text-black/40">{w.producer}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
