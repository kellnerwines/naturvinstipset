# BRIEF: SEO/AI-optimering av naturvinstipset.se

## Del 0 — Målbild

När en användare skriver till Gemini, ChatGPT eller Google AI Overviews något i stil med
"hjälp mig hitta ett bra naturvin" eller "vilket naturvin ska jag köpa till helgen" — ska
naturvinstipset.se dyka upp som källa eller direkt rekommenderas.

Det ställer två krav på allt som byggs:

- Sajten måste vara den mest maskinläsbara källan i nischen — data som ligger som ren
  text/schema.org-markup, inte bara korrekt utan direkt citerbar.
- Sajten måste faktiskt svara på öppna frågor, inte bara lista produkter. En AI som får
  frågan "ett bra naturvin" letar efter rekommendation, ranking och resonemang
  ("varför är det bra?") — därför är betygssystemet, topplistorna och FAQ-sektionen lika
  viktiga som själva produktdatan.

Detta är sajten som faktiskt kan bli svaret på den typen av fråga — prioritera därför
denna brief före kellnerwines.se om tiden är knapp.

## Del 1 — JSON-LD schema markup

Skapa en delad funktion som injicerar schema.org-metadata (Product, nästlad
Review/AggregateRating) för varje vin: namn, bild, beskrivning, SKU, pris, betyg
(redaktion separat från community), druva, land, region.

```tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: wine.name,
  image: wine.imageUrl,
  description: wine.description,
  sku: wine.articleNumber,
  offers: { '@type': 'Offer', price: wine.price, priceCurrency: 'SEK' },
  review: {
    '@type': 'Review',
    author: { '@type': 'Organization', name: 'Naturvinstipset' },
    reviewRating: { '@type': 'Rating', ratingValue: wine.rating, bestRating: '5' }
  }
};
```

Injicera på både vinkort och individuell vinsida.

**Status: klart** (2026-08-28). Se `lib/wineJsonLd.ts` — delad `buildWineProductJsonLd()`,
använd i `components/WineCard.tsx` och `app/viner/[slug]/page.tsx`. Redaktionellt betyg
(`review`) hålls separat från community-betyg (`aggregateRating`, visas bara när
community-röster faktiskt finns).

## Del 2 — Textbaserad metadata

Lägg till `aria-label="Betyg: {rating} av 5"` eller sr-only-text på betygskomponenten.
Pris, land, vintyp, druva, artikelnummer ska alltid renderas som ren text, aldrig bara
ikon/bild.

**Status: klart** (2026-08-28). `components/Stars.tsx` och vinkortets betygsrad har
aria-label. Vinkortet har en textrad: "Land: … · Vintyp: … · Druva: … ·
Systembolaget art.nr: … · Pris: ca … kr". Artikelnummer extraheras ur `systembolagetUrl`
(`getArticleNumber()` i `lib/wineJsonLd.ts`).

## Del 3 — Dedikerade kategorisidor

Skapa `/rott`, `/vitt`, `/orange`, `/pet-nat`, `/systembolaget-fast-sortiment` som egna
routes. Överst på varje: en ren HTML-punktlista med de tre högst rankade vinerna, format
"1. [Vinnamn] – Betyg 5/5".

**Status: delvis klart** (2026-08-28).
- `/rott`, `/vitt`, `/orange`, `/pet-nat` skapade (`components/CategoryGuidePage.tsx`,
  delad mall). De gamla URL:erna `/basta-orangevin-systembolaget` och
  `/basta-pet-nat-systembolaget` är 301-redirectade till `/orange` och `/pet-nat`
  (`next.config.mjs`) för att undvika duplicerat innehåll.
- `/systembolaget-fast-sortiment` **byggdes medvetet inte** — det finns inget datafält
  för "fast sortiment" i `Wine`-typen, och naturvin säljs i praktiken nästan uteslutande
  via Systembolagets tillfälliga sortiment/beställningssortiment. En sida utan riktiga
  viner (eller en påhittad sådan) hade varit dålig SEO och missvisande. Bygg när/om det
  finns faktiska viner att tagga som fast sortiment.

## Del 4 — FAQ med schema

FAQ-komponent på startsidan med FAQPage-schema: "Vad är naturvin?", "Innehåller naturvin
sulfiter?", "Hur hittar man naturvin på Systembolaget?" — korta 2–3-meningarssvar, direkt
citerbara.

**Status: klart** (2026-08-28). `components/HomeFaq.tsx`, medvetet omformulerat jämfört
med `/vad-ar-naturvin`s befintliga FAQPage-schema för att undvika dubblerad
FAQPage-markup för samma frågor.

## Del 5 — Dynamisk sitemap

`app/sitemap.ts` hämtar automatiskt alla viner och genererar URL:er för startsida,
kategorisidor och vinsidor.

**Status: klart** (2026-08-28). Vin- och blogg-URL:er hämtas redan dynamiskt sedan
tidigare. Statiska kategori-URL:er uppdaterade till `/rott`, `/vitt`, `/orange`,
`/pet-nat` (gamla borttagna).

## Del 6 — Senare fas (egen brief)

Smakprofils-quiz, producent-/druv-/regionsidor, prisvärdhetsranking, "liknande viner",
personlig smakmotor. Större jobb — gör en separat produktbrief med datamodell när grunden
(Del 1–5) är på plats.

**Status: ej påbörjat.** Kräver egen datamodell/brief innan implementation.

## Öppna punkter / att bevaka

- `AGENTS.md` i detta repo hänvisar till `node_modules/next/dist/docs/` för
  "breaking changes" i Next.js — den mappen finns inte i praktiken. Filen verkar
  felaktig/vilseledande; ignorerad vid implementation (kör på faktisk Next.js 14.2-kod).
- Korslänkning med kellnerwines.se (nämnt i den sajtens brief Del 8) är inte byggd härifrån
  ännu — bör göras samordnat med kellnerwines.se-arbetet.
