import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWines, getRatings, combinedRating, getSettings } from "@/lib/blob";
import { StarDisplay } from "@/components/Stars";
import RatingForm from "@/components/RatingForm";
import LikeButton from "@/components/LikeButton";
import OwnImportBadge from "@/components/OwnImportBadge";
import { buildWineProductJsonLd, getArticleNumber } from "@/lib/wineJsonLd";
import { kellnerProducerUrl } from "@/lib/kellnerLinks";
import { buyLinks, hasAnyOffer, retailerNote, whereSentence } from "@/lib/buyLinks";
import { FOOD } from "@/lib/compass/engine";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { Wine } from "@/lib/blob";

const TYPE_WORD: Record<string, string> = { "Rött": "rött", "Vitt": "vitt", Orange: "orange", "Rosé": "rosé", Mousserande: "mousserande", "Pét Nat": "pét-nat" };

/** Matkategorierna som text, t.ex. "fisk och skaldjur, fågel samt vegetariskt" ("samt" eftersom flera kategorier själva innehåller "och"). */
function foodList(w: Wine): string {
  const items = (w.foodCategories ?? []).map((c) => FOOD[c]?.toLowerCase()).filter(Boolean);
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} samt ${items[items.length - 1]}` : items[0] ?? "";
}

/** Senaste gången pris och lager kontrollerades hos något säljställe. */
function checkedDate(w: Wine): string | undefined {
  const d = [w.sbCheckedAt, ...(w.offers ?? []).map((o) => o.lastSyncedAt)].filter((x): x is string => !!x).sort().pop();
  return d ? new Date(d).toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" }) : undefined;
}

/** "Fleurie 2024 – rött naturvin från Frankrike, 439 kr" */
function wineHeadline(w: Wine): string {
  const name = `${w.name}${w.year && w.year !== "NV" ? ` ${w.year}` : ""}`;
  return `${name} – ${TYPE_WORD[w.wineType] ?? ""} naturvin${w.country ? ` från ${w.country}` : ""}${w.price ? `, ${w.price} kr` : ""}`;
}

/** Beskrivning för sökmotorer: producent, stil, druva, smak, mat och var den finns. Delar läggs till i prioritetsordning så länge texten ryms. */
function wineMetaDescription(w: Wine): string {
  const origin = [w.region, w.country].filter(Boolean).join(", ");
  const grapes = (w.grape ?? "").split(/,\s*/).filter(Boolean);
  const grapeText = grapes.length ? ` på ${grapes.slice(0, 3).join(", ")}${grapes.length > 3 ? " med flera" : ""}` : "";
  const parts = [
    `${w.name} från ${w.producer} är ett ${TYPE_WORD[w.wineType] ?? ""} naturvin${origin ? ` från ${origin}` : ""}${grapeText}.`,
    whereSentence(w),
    foodList(w) ? `Passar till ${foodList(w)}.` : "",
    w.flavorTags?.length ? `Smak: ${w.flavorTags.join(", ").toLowerCase()}.` : "",
  ].filter(Boolean);
  let text = parts[0];
  for (const p of parts.slice(1)) if (`${text} ${p}`.length <= 160) text = `${text} ${p}`;
  return text;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const wines = await getWines();
  const wine = wines.find((w) => w.slug === slug && w.published);
  if (!wine) return { title: "Vin" };
  const pageTitle = wineHeadline(wine);
  const ogTitle = `${pageTitle} – Naturvinstipset`;
  const description = wineMetaDescription(wine);
  const ogImageAlt = `${pageTitle}${wine.wineType ? ` ${wine.wineType.toLowerCase()} naturvin` : " naturvin"}${wine.country ? ` från ${wine.country}` : ""}`;
  return {
    title: pageTitle,
    description,
    alternates: { canonical: `/viner/${slug}` },
    openGraph: {
      title: ogTitle,
      description,
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
  const [wines, ratings, settings] = await Promise.all([getWines(), getRatings(), getSettings()]);
  const wine = wines.find((w) => w.slug === slug && w.published);
  if (!wine) notFound();

  const wineRatings = ratings.filter((r) => r.wineId === wine.id);
  const likeCount = wineRatings.filter((r) => r.liked).length;
  const score = combinedRating(wine, ratings);

  const articleNumber = getArticleNumber(wine);
  const importerUrl = kellnerProducerUrl(wine.producer);
  const links = buyLinks(wine, { source: "vinsida", path: `/viner/${wine.slug}` }, settings.retailerCompensation);
  const inTopList = !!wine.systembolagetUrl || (wine.offers ?? []).some((o) => o.shop === "Systembolaget");

  const specs = [
    { label: "Producent", value: wine.producer },
    { label: "Land", value: wine.country },
    { label: "Region", value: wine.region },
    { label: "Druva", value: wine.grape },
    { label: "Vintyp", value: wine.wineType },
    { label: "Årgång", value: wine.year },
    { label: "Pris", value: wine.price ? `${wine.price} kr` : undefined },
    { label: "Systembolaget art.nr", value: articleNumber },
    { label: "Passar till", value: foodList(wine) ? foodList(wine)[0].toUpperCase() + foodList(wine).slice(1) : undefined },
    { label: "Pris kontrollerat", value: checkedDate(wine) },
  ].filter((s) => s.value);
  const food = foodList(wine);

  const producerWines = wine.producer
    ? wines.filter((w) => w.published && w.id !== wine.id && w.producer === wine.producer).slice(0, 4)
    : [];

  const regionalWines = (wine.region || wine.country)
    ? wines
        .filter((w) => w.published && w.id !== wine.id && !producerWines.some((p) => p.id === w.id))
        .filter((w) => wine.region ? w.region === wine.region : w.country === wine.country)
        .slice(0, 4)
    : [];

  // Matsvaret byggs av vinets egna matkategorier och regionala mattext, inte av färgen.
  const foodAnswer = wine.foodPairing
    ? `${wine.name} passar till ${food || "mat"}. ${wine.foodPairing}`
    : food
    ? `${wine.name} passar till ${food}.`
    : `${wine.name} är ett ${TYPE_WORD[wine.wineType] ?? ""} naturvin som fungerar som matvin.`;

  const jsonLd = buildWineProductJsonLd(wine, {
    combinedRating: score,
    communityCount: wineRatings.length,
  });

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <JsonLd data={[jsonLd, breadcrumbJsonLd([
        ...(inTopList ? [{ name: "Topp 100", path: "/topp-100" }] : []),
        { name: `${wine.name}${wine.year && wine.year !== "NV" ? ` ${wine.year}` : ""}`, path: `/viner/${wine.slug}` },
      ])]} />

      <Link href={inTopList ? "/topp-100" : "/"} className="text-sm text-black/40 hover:text-[var(--green)] mb-8 inline-block">
        {inTopList ? "← Tillbaka till listan" : "← Till Vinkompassen"}
      </Link>

      {/* Top section */}
      <div className="grid md:grid-cols-2 gap-10 mb-14 items-start">
        {/* Image */}
        <div className="bg-[var(--green-light)] aspect-[3/4] rounded-xl overflow-hidden flex items-center justify-center">
          {wine.primaryImageUrl ? (
            <Image src={wine.primaryImageUrl} alt={`${wine.name}${wine.year ? ` ${wine.year}` : ""}${wine.wineType ? ` ${wine.wineType.toLowerCase()} naturvin` : " naturvin"}${wine.country ? ` från ${wine.country}` : ""}`} width={400} height={530} className={wine.sourceImageUrl ? "object-contain w-full h-full p-8" : "object-cover w-full h-full"} unoptimized />
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
            {wine.ownImport ? <OwnImportBadge /> : null}
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

          {/* Faktaruta som definitionslista, så att varje uppgift har en tydlig etikett */}
          <dl className="border-t border-black/8 pt-4 space-y-2 mb-6">
            {specs.map((s) => (
              <div key={s.label} className="flex justify-between text-sm gap-4">
                <dt className="text-black/40 shrink-0">{s.label}</dt>
                <dd className="font-medium text-right">{s.value}</dd>
              </div>
            ))}
          </dl>

          {/* CTA – ett per säljställe med vinet i lager */}
          {links.map((l, i) => (
            <div key={l.shop} className={i > 0 ? "mt-3" : ""}>
              <a
                href={l.href}
                target="_blank"
                rel={l.rel}
                className={i === 0
                  ? "block text-center bg-[var(--green)] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[var(--green-dark)] transition-colors"
                  : "block text-center border border-[var(--green)] text-[var(--green-dark)] font-semibold px-6 py-3 rounded-lg hover:bg-[var(--green-light)] transition-colors"}
              >
                {l.label}{l.price ? `, ${l.price} kr` : ""} →
              </a>
              <p className="text-center text-xs text-[var(--muted)] mt-1.5">{l.how}</p>
            </div>
          ))}
          {!links.length && hasAnyOffer(wine) ? (
            <p className="text-center text-sm font-semibold border border-[var(--rule)] rounded-lg px-6 py-3">Tillfälligt slut</p>
          ) : null}
          {links.length ? (
            <p className="text-[11px] text-[var(--muted)] leading-snug mt-4">{retailerNote(links)}</p>
          ) : null}

          {importerUrl && (
            <>
            <a
              href={importerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-black/40 hover:text-[var(--green)] mt-3 underline underline-offset-2"
            >
              Producenten hos Kellner & Kellner (kellnerwines.se) →
            </a>
            <p className="text-center text-[11px] text-[var(--muted)] mt-1">
              Kellner & Kellner är vinimportören som drivs av Naturvinstipsets grundare.
            </p>
            </>
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
          {whereSentence(wine) ? ` ${whereSentence(wine)}` : ""}
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
                  text: foodAnswer,
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
              {foodAnswer}
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
