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
import { countrySlug, grapeSlug, grapesOf, producerName, producerSlug } from "@/lib/entities";
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
      <span className="text-sm font-bold w-20 shrink-0">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className={`h-3 w-9 border-2 border-[var(--ink)] ${n <= filled ? "bg-[var(--ink)]" : ""}`} />
        ))}
      </div>
      <span className="text-sm text-[var(--muted)]">{value}/5</span>
    </div>
  );
}

// Platta tryckfärger per vintyp (globals.css), samma som på vinkorten.
const typeField: Record<string, string> = {
  Rött: "var(--wine-rott)", Vitt: "var(--wine-vitt)", Rosé: "var(--wine-rose)", Orange: "var(--wine-orange)",
  Mousserande: "var(--wine-mousserande)", "Pét Nat": "var(--wine-petnat)",
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

  // Producent, land och druvor länkar till sina egna sidor.
  const grapes = grapesOf(wine);
  const specs: { label: string; value?: string; links?: { href: string; label: string }[] }[] = [
    { label: "Producent", value: wine.producer, links: wine.producer ? [{ href: `/producenter/${producerSlug(wine.producer)}`, label: producerName(wine.producer) }] : undefined },
    { label: "Land", value: wine.country, links: wine.country ? [{ href: `/land/${countrySlug(wine.country)}`, label: wine.country }] : undefined },
    { label: "Region", value: wine.region },
    { label: grapes.length > 1 ? "Druvor" : "Druva", value: wine.grape, links: grapes.length ? grapes.map((g) => ({ href: `/druvor/${grapeSlug(g)}`, label: g })) : undefined },
    { label: "Vintyp", value: wine.wineType },
    { label: "Årgång", value: wine.year },
    { label: "Pris", value: wine.price ? `${wine.price} kr` : undefined },
    { label: "Systembolaget art.nr", value: articleNumber },
    { label: "Passar till", value: foodList(wine) ? foodList(wine)[0].toUpperCase() + foodList(wine).slice(1) : undefined },
    { label: "Pris kontrollerat", value: checkedDate(wine) },
  ].filter((s) => s.value);
  const food = foodList(wine);

  const producerWines = wine.producer
    ? wines.filter((w) => w.published && w.id !== wine.id && !!w.producer && producerSlug(w.producer) === producerSlug(wine.producer)).slice(0, 4)
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
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
      <JsonLd data={[jsonLd, breadcrumbJsonLd([
        inTopList ? { name: "Topp 100", path: "/topp-100" } : { name: "Alla viner", path: "/viner" },
        { name: `${wine.name}${wine.year && wine.year !== "NV" ? ` ${wine.year}` : ""}`, path: `/viner/${wine.slug}` },
      ])]} />

      <Link href={inTopList ? "/topp-100" : "/viner"} className="font-bold text-[var(--ink)] border-b-2 border-[var(--ink)] hover:text-[var(--accent)] hover:border-[var(--accent)] mb-8 inline-block">
        {inTopList ? "← Tillbaka till listan" : "← Alla viner"}
      </Link>

      {/* Top section */}
      <div className="grid md:grid-cols-2 gap-10 mb-14 items-start">
        {/* Bilden på vintypens färgfält */}
        <div className="h-[380px] md:h-auto md:aspect-[3/4] overflow-hidden flex items-center justify-center border-[3px] border-[var(--ink)]" style={{ backgroundColor: typeField[wine.wineType] ?? "var(--surface)" }}>
          {wine.primaryImageUrl ? (
            <Image src={wine.primaryImageUrl} alt={`${wine.name}${wine.year ? ` ${wine.year}` : ""}${wine.wineType ? ` ${wine.wineType.toLowerCase()} naturvin` : " naturvin"}${wine.country ? ` från ${wine.country}` : ""}`} width={400} height={530} className={wine.sourceImageUrl ? "object-contain w-full h-full p-8 mix-blend-multiply" : "object-cover w-full h-full"} unoptimized />
          ) : (
            <svg className="h-3/4 text-[var(--ink)]" viewBox="0 0 40 140" aria-hidden="true"><path d="M15 2h10v34c0 8 11 14 11 30v68a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V66c0-16 11-22 11-30z" fill="currentColor" opacity="0.3" /></svg>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[var(--accent)] text-[var(--fg)] border-2 border-[var(--ink)] text-sm font-bold px-2 py-0.5">
              {wine.wineType}
            </span>
            {wine.ownImport ? <OwnImportBadge /> : null}
          </div>

          <h1 className="text-6xl md:text-8xl mb-2">
            {wine.name}
          </h1>
          <p className="text-xl font-bold mb-4">{wine.producer}{wine.year ? ` · ${wine.year}` : ""}</p>

          {score > 0 ? (
            <div className="mb-6">
              <StarDisplay rating={score} count={wineRatings.length} />
            </div>
          ) : null}

          <p className="text-lg leading-relaxed mb-6">{wine.description}</p>

          {/* Flavor tags */}
          {wine.flavorTags && wine.flavorTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {wine.flavorTags.map((t) => (
                <span key={t} className="text-sm font-bold border-2 border-[var(--ink)] text-[var(--ink)] px-3 py-1 rounded-full">{t}</span>
              ))}
            </div>
          )}

          {/* Faktaruta som definitionslista, så att varje uppgift har en tydlig etikett */}
          <dl className="border-t-[3px] border-[var(--ink)] mb-6">
            {specs.map((s) => (
              <div key={s.label} className="flex justify-between gap-4 py-2 border-b-2 border-[var(--rule)]">
                <dt className="font-bold shrink-0">{s.label}</dt>
                <dd className="font-medium text-right">
                  {s.links
                    ? s.links.map((l, i) => (
                        <span key={l.href}>
                          {i > 0 && ", "}
                          <Link href={l.href} className="text-[var(--ink)] underline underline-offset-2 decoration-2 hover:text-[var(--accent)]">{l.label}</Link>
                        </span>
                      ))
                    : s.value}
                </dd>
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
                  ? "block text-center bg-[var(--accent)] text-[var(--fg)] border-[3px] border-[var(--ink)] font-bold text-lg px-6 py-4 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
                  : "block text-center border-[3px] border-[var(--ink)] text-[var(--ink)] font-bold px-6 py-3 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"}
              >
                {l.label}{l.price ? `, ${l.price} kr` : ""}
              </a>
              <p className="text-center text-xs text-[var(--muted)] mt-1.5">{l.how}</p>
            </div>
          ))}
          {!links.length && hasAnyOffer(wine) ? (
            <p className="text-center font-bold border-[3px] border-[var(--ink)] rounded-full px-6 py-3">Tillfälligt slut</p>
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
              className="block text-center text-sm text-[var(--muted)] hover:text-[var(--ink)] mt-3 underline underline-offset-2"
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
          <h2 className="text-4xl mb-5">Smakprofil</h2>
          <div className="space-y-3 mb-4">
            {wine.syra      != null && <ProfileMeter label="Syra"      value={wine.syra} />}
            {wine.fyllighet != null && <ProfileMeter label="Fyllighet" value={wine.fyllighet} />}
            {wine.funk      != null && <ProfileMeter label="Funk"      value={wine.funk} />}
            {wine.stravhet  != null && <ProfileMeter label="Strävhet"  value={wine.stravhet} />}
          </div>
          {wine.flavorNotes && (
            <p className="text-[17px] leading-relaxed mt-4">{wine.flavorNotes}</p>
          )}
        </div>
      )}

      {/* AEO intro + long description */}
      <div className="mb-14 max-w-2xl">
        <h2 className="text-4xl mb-4">Om vinet</h2>
        <p className="text-[17px] leading-relaxed mb-4">
          {wine.year ? `${wine.name} ${wine.year}` : wine.name} är ett{" "}
          {wine.wineType.toLowerCase()}{" "}
          <Link href="/vad-ar-naturvin" className="underline underline-offset-2 hover:text-[var(--accent)]">naturvin</Link>
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
          <p className="text-[17px] leading-relaxed whitespace-pre-line">{wine.longDescription}</p>
        )}
      </div>

      {/* Rating section */}
      <div className="border-t-[3px] border-[var(--ink)] pt-12">
        <h2 className="text-4xl mb-2">
          Vad tycker du?
        </h2>
        <p className="text-sm text-[var(--muted)] mb-6">
          Inget konto behövs. En röst per person och vin.
        </p>
        <div className="flex items-center gap-3 mb-8">
          <LikeButton wineId={wine.id} likeCount={likeCount} />
          <span className="text-sm text-[var(--muted)]">eller ge ett detaljerat betyg nedan</span>
        </div>
        <RatingForm wineId={wine.id} />
      </div>

      {/* User reviews */}
      {wineRatings.filter((r) => r.comment).length > 0 && (
        <div className="mt-10">
          <h3 className="text-lg font-bold mb-4">Kommentarer</h3>
          <div className="space-y-4">
            {wineRatings
              .filter((r) => r.comment)
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((r) => (
                <div key={r.id} className="bg-[var(--paper)] p-4 border-2 border-[var(--ink)]">
                  <div className="flex items-center gap-2 mb-2">
                    <StarDisplay rating={r.stars} />
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(r.createdAt).toLocaleDateString("sv-SE")}
                    </span>
                  </div>
                  <p className="text-[15px]">{r.comment}</p>
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
      <div className="mt-14 max-w-2xl border-t-[3px] border-[var(--ink)] pt-12">
        <h2 className="text-4xl mb-8">Vanliga frågor</h2>
        <div className="space-y-8">
          <div>
            <h3 className="font-bold text-lg mb-2">Vad smakar {wine.name}?</h3>
            <p className="text-sm text-[17px] leading-relaxed">
              {wine.flavorNotes
                ? wine.flavorNotes
                : `${wine.name} är ett ${wine.wineType.toLowerCase()} naturvin${wine.flavorTags?.length ? ` med smakprofil: ${wine.flavorTags.join(", ").toLowerCase()}` : ""}.${wine.syra != null ? ` Syra: ${wine.syra}/5.` : ""}${wine.fyllighet != null ? ` Fyllighet: ${wine.fyllighet}/5.` : ""}${wine.funk != null ? ` Funk: ${wine.funk}/5.` : ""}`}
            </p>
          </div>
          {wine.grape && (
            <div>
              <h3 className="font-bold text-lg mb-2">Vilka druvor ingår i {wine.name}?</h3>
              <p className="text-sm text-[17px] leading-relaxed">
                {wine.name} görs på {wine.grape}{wine.country ? ` från ${wine.country}` : ""}.
              </p>
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg mb-2">Vad passar {wine.name} till?</h3>
            <p className="text-sm text-[17px] leading-relaxed">
              {foodAnswer}
            </p>
          </div>
        </div>
      </div>

      {/* Related: same producer */}
      {producerWines.length > 0 && (
        <div className="mt-14 max-w-2xl border-t-[3px] border-[var(--ink)] pt-12">
          <h2 className="text-4xl mb-6">Fler viner från {producerName(wine.producer)}</h2>
          <ul className="space-y-3">
            {producerWines.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/viner/${w.slug}`}
                  className="flex items-center justify-between group py-2 border-b-2 border-[var(--rule)] last:border-0"
                >
                  <span className="font-medium group-hover:text-[var(--accent)] transition-colors">
                    {w.name}{w.year ? ` ${w.year}` : ""}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{w.wineType}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={`/producenter/${producerSlug(wine.producer)}`} className="inline-block mt-6 text-sm underline underline-offset-2 hover:text-[var(--accent)]">
            Alla viner från {producerName(wine.producer)}
          </Link>
        </div>
      )}

      {/* Related: same region/country */}
      {regionalWines.length > 0 && (
        <div className="mt-14 max-w-2xl border-t-[3px] border-[var(--ink)] pt-12">
          <h2 className="text-4xl mb-6">
            Andra naturviner från {wine.region ?? wine.country}
          </h2>
          <ul className="space-y-3">
            {regionalWines.map((w) => (
              <li key={w.id}>
                <Link
                  href={`/viner/${w.slug}`}
                  className="flex items-center justify-between group py-2 border-b-2 border-[var(--rule)] last:border-0"
                >
                  <span className="font-medium group-hover:text-[var(--accent)] transition-colors">
                    {w.name}{w.year ? ` ${w.year}` : ""}
                  </span>
                  <span className="text-xs text-[var(--muted)]">{w.producer}</span>
                </Link>
              </li>
            ))}
          </ul>
          {wine.country && (
            <Link href={`/land/${countrySlug(wine.country)}`} className="inline-block mt-6 text-sm underline underline-offset-2 hover:text-[var(--accent)]">
              Alla naturviner från {wine.country}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
