import type { Metadata } from "next";
import { langAlternates, wordEn } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import { getSettings, getWines, getRatings } from "@/lib/blob";
import { answer } from "@/lib/answers";
import { toCompassWine, type CompassWine } from "@/lib/compass/engine";
import JsonLd from "@/components/JsonLd";
import { SITE, publisherRef } from "@/lib/seo";

// Engelsk version av app/(sv)/om-oss/page.tsx. Ändras den svenska texten behöver den här ändras för hand.
export const metadata: Metadata = {
  alternates: langAlternates("en", "/om-oss"),
  title: "How Naturvinstipset works",
  description:
    "How the Wine Compass matches natural wine to your taste, what the ratings mean, who is behind the site and why the shops don't pay to be listed.",
  openGraph: {
    title: "How Naturvinstipset works",
    description: "How the Wine Compass matches natural wine to your taste, what the ratings mean and who is behind the site.",
    url: "https://www.naturvinstipset.se/en/om-oss",
    images: [{ url: "/og-logo.png", width: 1200, height: 630, alt: "Naturvinstipset" }],
  },
};

export const dynamic = "force-dynamic";

// Exemplet i "Why does the wine match you?" är ett riktigt svar från kompassen med de här valen.
const EXAMPLE = { farg: "rott", budget: "199", mat: "kott", syra: "4", fyllighet: "2", stravhet: "2", funk: "2" };
const EXAMPLE_AXES: [string, keyof typeof EXAMPLE, "syra" | "fyllighet" | "stravhet" | "funk"][] = [
  ["Acidity", "syra", "syra"], ["Body", "fyllighet", "fyllighet"], ["Tannin", "stravhet", "stravhet"], ["Funk", "funk", "funk"],
];

// Vilka som står bakom sajten, som strukturerad data (samma uppgifter som i "Vem står bakom?").
const KELLNER = { "@type": "Organization", name: "Kellner & Kellner", url: "https://www.kellnerwines.se" };
const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: `${SITE}/en/om-oss`,
  name: "How Naturvinstipset works",
  inLanguage: "en",
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

export default async function AboutUsPage() {
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
  const fmt = (n: number) => n.toFixed(1);

  return (
    <div>
      <JsonLd data={aboutJsonLd} />
      {/* 1. Rubrik och faktarad */}
      <section className="px-6 pt-16 md:pt-20 pb-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-[clamp(52px,9vw,112px)]">How<br />Naturvinstipset works</h1>
          <p className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mt-5">
            We gather the natural wines you can buy in Sweden right now and give each wine a taste profile. The Wine Compass
            compares the profiles with what you like, and then you buy the wine where it is sold.
          </p>
          <div className={`${card} grid grid-cols-2 md:grid-cols-4 mt-10`}>
            {[
              [String(W.length), "natural wines you can buy right now"],
              [String(shops.length), `places to buy: Systembolaget and ${webShops.length} online shops with home delivery`],
              ["Ongoing", "checks of price and stock at Systembolaget"],
              ["4", "taste measures per wine: acidity, body, tannin and funk, from 1 to 5"],
            ].map(([n, t], i) => (
              <div key={i} className={`p-5 border-[var(--ink)] ${i % 2 === 0 ? "border-r-[3px]" : "md:border-r-[3px]"} ${i < 2 ? "border-b-[3px] md:border-b-0" : ""} ${i === 3 ? "md:border-r-0" : ""}`}>
                <div className={`font-display font-black text-[var(--ink)] leading-none ${n.length > 3 ? "text-[34px] pt-2.5" : "text-[54px]"}`}>{n}</div>
                <p className="text-[15px] text-[var(--muted)] mt-1.5">{t}</p>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-[var(--muted)] mt-2.5">The shops: {shops.join(", ")}.</p>
        </div>
      </section>

      {/* 2. Två problem, en lösning */}
      <section className="px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(38px,5.6vw,68px)]">Two sides of the same shelf</h2>
          <div className="grid md:grid-cols-2 gap-5 md:gap-7 mt-9">
            {[
              ["var(--wine-vitt)", "You who drink wine", "Hundreds of natural wines. Which one suits you?", "The label rarely says how the wine tastes, and the range is large. It often ends in a gamble or in the same bottle as last time."],
              ["var(--wine-petnat)", "Importers and shops", "Good wines that nobody finds", "A small wine from a small producer easily drowns in the range. Alcohol advertising is strictly limited, so you can't buy your way to visibility."],
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
            <h2 className="relative !text-[var(--paper)] text-[clamp(38px,5.6vw,68px)]">Naturvinstipset connects them</h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-lg text-[var(--paper)] opacity-90">
              The Wine Compass matches the wines to your taste and links you to the place where the wine is sold. We sell nothing
              ourselves, and the shops pay nothing to be listed.
            </p>
            <div className="relative flex flex-wrap justify-center gap-2.5 mt-6">
              {["Matched to taste", "Link to buy", "Independent ratings"].map((t) => (
                <span key={t} className="rounded-full bg-[var(--paper)] text-[var(--fg)] font-bold text-[15px] px-4 py-2">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Tre steg */}
      <section className="px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(38px,5.6vw,68px)]">From question to bottle</h2>
          <div className="grid md:grid-cols-[1fr_60px_1fr_60px_1fr] items-start mt-10">
            {[
              ["/om/steg-1-kompassen.jpg", "The Wine Compass's first question, in Swedish: which colour do you feel like?", "Answer three questions", "Colour, budget and what you are going to eat. You can also write freely (in Swedish), for example \"vitt till skaldjur\", white with shellfish."],
              ["/om/steg-2-matchning.jpg", "A suggestion from the compass with a match percentage and taste profile", "See how close the wine is to your taste", "Every wine gets a match in percent. Expand the card to see the wine's profile with your choices marked."],
              ["/om/steg-3-kop.jpg", "The wine page with the button Buy at Systembolaget", "Buy where the wine is", "The button goes straight to Systembolaget or the online shop. The purchase itself happens with them."],
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
              <h2 className="text-[clamp(38px,5.6vw,68px)]">Why does the wine match you?</h2>
              <p className="text-lg text-[var(--muted)] mt-5">
                The match is based on how close the wine&apos;s taste profile is to what you chose. Here is the compass&apos;s best suggestion right
                now for a red with meat for at most SEK 199, with fresh acidity, light body and a little funk.
              </p>
              <p className="text-sm text-[var(--muted)] mt-4">
                Wines that don&apos;t meet your hard choices, such as colour and budget, are sorted out first. The match also weighs in
                flavour tags, food and, to a small extent, our own rating.
              </p>
            </div>
            <div className={card}>
              <div className="grid grid-cols-[1fr_auto] gap-4 items-center p-5 border-b-[3px] border-[var(--ink)]">
                <div>
                  <Link href={`/viner/${exSlug}`} hrefLang="sv" className={`${h3} text-[30px] hover:underline`}>
                    {ex.name} {ex.vintage}
                  </Link>
                  <p className="text-sm text-[var(--muted)] mt-1.5">{ex.producer}, {wordEn(ex.country)}. {ex.grape}.</p>
                </div>
                <div className="text-right">
                  <b className="block font-display font-black text-[64px] leading-[.9] text-[var(--accent)]">{ex.match} %</b>
                  <span className="text-[13px] text-[var(--muted)]">match</span>
                </div>
              </div>
              <div className="px-5 pt-2 pb-4">
                {EXAMPLE_AXES.map(([label, q, f]) => {
                  const you = Number(EXAMPLE[q]), wine = ex.flavour[f], d = Math.abs(you - wine);
                  return (
                    <div key={label} className={`${row} border-b border-[var(--rule)]`}>
                      <span className="font-bold">{label}</span>
                      <Meter wine={wine} you={you} />
                      <span className="col-start-2 sm:col-start-auto sm:text-right"><Verdict ok={d === 0}>{d === 0 ? "Just right" : d === 1 ? "One step away" : `${d} steps away`}</Verdict></span>
                    </div>
                  );
                })}
                <div className={`${row} border-b border-[var(--rule)]`}>
                  <span className="font-bold">Price</span>
                  <span>SEK {ex.price} at {ex.shop}</span>
                  <span className="col-start-2 sm:col-start-auto sm:text-right"><Verdict ok={ex.price <= 199}>{ex.price <= 199 ? "Within budget" : "Over budget"}</Verdict></span>
                </div>
                {ex.foodPairing ? (
                  <div className={row}>
                    <span className="font-bold">Food</span>
                    <span className="sm:col-span-2" lang="sv">{ex.foodPairing} <span lang="en" className="text-[var(--muted)]">(in Swedish)</span></span>
                  </div>
                ) : null}
              </div>
              <div className="flex gap-5 text-[13px] text-[var(--muted)] px-5 pb-4">
                <span className="flex items-center gap-1.5"><i className="w-3.5 h-2.5 bg-[var(--ink)]" />The wine</span>
                <span className="flex items-center gap-1.5"><i className="w-[3px] h-4 bg-[var(--accent)]" />Your choice</span>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* 5. Tre siffror, tre frågor */}
      {ex && exWine ? (
        <section className="px-6 py-14">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-[clamp(38px,5.6vw,68px)]">Three numbers, three questions</h2>
            <p className="text-lg text-[var(--muted)] max-w-2xl mt-5">
              A rating says how good a wine is or what others thought. The match says whether it suits you. That is why we
              show them separately.
            </p>
            <div className="grid md:grid-cols-3 gap-5 mt-9">
              <div className={`${card} p-6`}>
                <p className="font-bold text-[15px]">The editors&apos; rating</p>
                <div className="font-display font-black text-[64px] leading-none text-[var(--ink)] my-2.5">{exWine.adminRating > 0 ? fmt(exWine.adminRating) : "None yet"}</div>
                <p className="text-[var(--muted)]">Our assessment of the wine, out of five. It is the same for everyone.</p>
              </div>
              <div className={`${card} p-6`}>
                <p className="font-bold text-[15px]">Visitors&apos; rating</p>
                {exCommunity !== null ? (
                  <div className="font-display font-black text-[64px] leading-none text-[var(--ink)] my-2.5">{fmt(exCommunity)}</div>
                ) : (
                  <div className="font-display font-black text-[34px] leading-none text-[var(--muted)] pt-4 pb-3">No ratings yet</div>
                )}
                <p className="text-[var(--muted)]">What others who have drunk the wine think. No account is needed to give a rating.</p>
              </div>
              <div className="border-[3px] border-[var(--ink)] bg-[var(--accent)] p-6">
                <p className="font-bold text-[15px]">Your match</p>
                <div className="font-display font-black text-[64px] leading-none my-2.5">{ex.match} %</div>
                <p>How well the wine suits your particular answers. With other answers the same wine can end up far down.</p>
              </div>
            </div>
            <p className="text-[13px] text-[var(--muted)] mt-2.5">The numbers are for {ex.name} {ex.vintage} and are updated when the ratings change.</p>
          </div>
        </section>
      ) : null}

      {/* 6. Modellen */}
      <section className="px-6 py-14 bg-[var(--surface)] border-y-[3px] border-[var(--ink)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[clamp(38px,5.6vw,68px)]">Who pays for this?</h2>
          <p className="text-lg text-[var(--muted)] mt-5">{settings.retailerCompensation ? "This is how it fits together." : "Nobody, today. This is how it fits together."}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-9">
            {[
              ["var(--wine-petnat)", "Free to use", "The compass, the lists and the ratings cost nothing, and you don't need an account."],
              settings.retailerCompensation
                ? ["var(--wine-vitt)", "Labelled links", "We may receive compensation from online shops when you buy through our links. Those links are labelled, and the compensation does not affect the ranking."]
                : ["var(--wine-vitt)", "No compensation from the shops", "Neither Systembolaget nor the online shops pay us. If that changes it will say so here, and the links to that shop will be labelled."],
              ["var(--accent)", "Own import is always labelled", "The site is run by Simon and Stefan of the wine importer Kellner & Kellner. Their wines are labelled \"Egen import\" (own import) and get no priority in the compass or in the Top 100."],
              ["var(--ink)", "Clicks counted without cookies", "We count how many people click through to each shop, without cookies and without storing IP addresses."],
            ].map(([color, title, text]) => (
              <div key={title} className={`${card} p-6`}>
                <div className="w-[34px] h-[34px] rounded-full border-[3px] border-[var(--ink)] mb-4" style={{ background: color }} />
                <h3 className={`${h3} text-[26px] mb-2.5`}>{title}</h3>
                <p className="text-[15.5px] text-[var(--muted)]">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 font-bold"><a href="#sa-rankar-vi" className="underline">How we calculate the Top 100 and the match</a></p>
        </div>
      </section>

      {/* 7. Människorna bakom */}
      <section className="px-6 py-14" id="kontakt">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[300px_1fr] gap-8 md:gap-10 items-center">
          <div className="aspect-[4/5] max-w-[260px] md:max-w-none border-[3px] border-[var(--ink)] overflow-hidden">
            <Image src="/om/simon-och-stefan.jpg" alt="Simon and Stefan of Kellner & Kellner" width={900} height={1200} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-[clamp(38px,5.6vw,68px)]">Who is behind it?</h2>
            <p className="text-lg text-[var(--muted)] mt-5 max-w-2xl">
              Naturvinstipset is made by Simon and Stefan, who run the wine importer <a href="https://www.kellnerwines.se" className="underline text-[var(--ink)]">Kellner &amp; Kellner</a>. We import
              natural wine from Portugal and France ourselves, and that is why our own wines are labelled wherever they appear here.
            </p>
            <p className="text-lg text-[var(--muted)] mt-4">
              Questions, tips or a missing wine? Write to <a href="mailto:hej@naturvinstipset.se" className="underline text-[var(--ink)]">hej@naturvinstipset.se</a>.
            </p>
          </div>
        </div>
      </section>

      {/* Så rankar vi: hela redovisningen (länkas från llms.txt och /api/kompass) */}
      <section className="border-t-[3px] border-[var(--ink)] py-14 px-6 scroll-mt-20" id="sa-rankar-vi">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-[clamp(32px,4.5vw,52px)] mb-8">How we rank and how we make money</h2>
          <div className="space-y-8 text-[var(--muted)] leading-relaxed text-[15px]">
            <div>
              <h3 className="font-semibold text-[var(--fg)] mb-2">The Wine Compass</h3>
              <p>
                The compass first sorts out wines that don&apos;t fit your hard choices: colour, budget, food, country, grape and where you want to buy. The rest get a match from 1 to 99 percent. It is calculated from how close the wine&apos;s taste profile (acidity, body, tannin and funk) is to what you have chosen, how many of your flavour tags and dishes match, and to a small extent our own rating. If too few wines match, the compass drops one choice at a time and says which.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--fg)] mb-2">Top 100</h3>
              <p>
                The top list starts with the natural wines at Systembolaget, ordered by an average of our rating and the visitors&apos; rating, where our rating weighs as much as one vote. If they don&apos;t add up to 100, the rest of the places are filled with natural wines with home delivery from Flaskvis, from Kellner &amp; Kellner, Backyard Wines, Wine Rebels and Nordic 4 Wines. They are also ordered by rating, and no importer gets priority.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--fg)] mb-2">Own import</h3>
              <p>
                Naturvinstipset is run by Simon and Stefan of the wine importer Kellner &amp; Kellner. That is why wines imported by Kellner &amp; Kellner are labelled &quot;Egen import&quot; (own import) wherever they appear. Own import gives no extra points in the Wine Compass and no priority in the Top 100. Both are checked by automated tests in the code.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--fg)] mb-2">Money</h3>
              {settings.retailerCompensation ? (
                <p>
                  Naturvinstipset may receive compensation from online shops when you buy through our links. The links to them are then labelled, and the compensation does not affect the ranking. We receive no compensation from Systembolaget.
                </p>
              ) : (
                <p>
                  Naturvinstipset receives no compensation today, neither from Systembolaget nor from the online shops we link to. We count how many people click through to each shop, without cookies and without storing IP addresses. If we receive compensation from an online shop in the future, it will say so here, and the links to that shop will be labelled.
                </p>
              )}
              <p className="mt-4">
                Purchase and collection happen at Systembolaget, and purchases with home delivery happen at the online shop. Neither Systembolaget nor the online shops are behind the content on the site.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Avslutning */}
      <section className="border-t-[3px] border-[var(--ink)] py-16 px-6 text-center">
        <h2 className="text-[clamp(38px,5.6vw,68px)]">Which natural wine suits you?</h2>
        <p className="text-[var(--muted)] mt-3 mb-7">Three questions, then your suggestions. The compass is in Swedish for now.</p>
        <Link href="/en" className="inline-block bg-[var(--accent)] text-[var(--fg)] border-[3px] border-[var(--ink)] font-bold text-lg px-7 py-3.5 rounded-full hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors">
          Start the Wine Compass
        </Link>
      </section>
    </div>
  );
}
