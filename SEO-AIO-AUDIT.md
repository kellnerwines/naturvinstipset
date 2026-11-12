# SEO- och AIO-audit av naturvinstipset.se

Genomgång 2026-11-12 av koden (main) och den publicerade sajten. Fas 1 i arbetsordern: nuläge, problem och förslag till plan. Ingen kod är ändrad.

Analysen som arbetsordern bygger på utgår delvis från en äldre version av sajten (68 viner, inga egna vinsidor). Nuläget är ett annat, se nedan.

## Nuläge

| Område | Läge | Kommentar |
|---|---|---|
| Ramverk och rendering | ✅ | Next.js 14 (App Router). Alla publika sidor renderas på servern (`force-dynamic`), så text, priser och vinlistor finns i den första HTML-koden. `/rott` innehåller till exempel 210 vinlänkar utan JavaScript. |
| Data | ✅ | En källa: `wines.json` i Vercel Blob (typen `Wine` i `lib/blob.ts`). Cirka 500 publicerade viner med permanent `id` och `slug`, producent, land, region, druva, vintyp, årgång, pris, erbjudanden per butik med lagerstatus, smakprofil 1–5 (syra, fyllighet, strävhet, funk), smaktaggar, matkategorier, redaktionellt betyg och besökarbetyg (Neon). |
| Egna vinsidor | ✅ | `/viner/[slug]` för varje vin, med faktaruta (producent, land, region, druva, typ, årgång, pris, Systembolagets art.nr), köplänkar, smakprofil, "Om vinet" och FAQ. |
| Lagerkoll | ✅ | Webbutiker synkas varje månad, Systembolaget kontrolleras dagligen (varje vin högst en gång i månaden). Viner som är slut överallt döljs i hela sajten. |
| robots.txt | ✅ | GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended m.fl. tillåts uttryckligen. `/admin`, `/go/` och `/api/` (utom `/api/kompass`) är stängda. Googlebot och Bingbot omfattas av `*`. |
| sitemap.xml | ✅ | Automatisk, 567 adresser med `lastmod`. Admin och filtervyer ingår inte. |
| llms.txt | ✅ | Markdown med urval, oberoende, kompassens JSON-API och tio svar. |
| JSON-API för AI | ✅ | `/api/kompass` med filter för färg, budget, mat, smak, land, druva och butik. |
| Product-schema | ✅ | På vinsidor och Topp 100: `sku` (art.nr), ett `Offer` per säljställe i SEK med verklig lagerstatus, `Review` från Naturvinstipset (Organization). `aggregateRating` bara när verkliga besökarröster finns. |
| FAQPage | ⚠️ | Finns på startsidan, vinsidor, Topp 100, svarssidor, Vad är naturvin och barguiden. Saknas på kategorisidorna. |
| ItemList | ⚠️ | Bara på svarssidorna. Saknas på Topp 100 och kategorisidorna. |
| Canonical | ⚠️ | Saknas på vinsidor, kategorisidor, Vad är naturvin, Om listan, Om oss, bloggen och blogginlägg. |
| Organization / WebSite | ⚠️ | `WebSite` bara på startsidan, `Organization` bara som utgivare inne i andra scheman. |
| BreadcrumbList | ❌ | Finns inte. |
| Article / Person | ❌ | Blogginlägg saknar strukturerad data och canonical. Ingen författarsida. |
| Smakprofil som text | ✅ | Värdena står som text bredvid staplarna ("3/5"). |
| Metadata vinsidor | ⚠️ | Titeln är bara "Fred 12 NV – Naturvinstipset", beskrivningen är vinets korta text. |
| Faktaruta | ⚠️ | Finns men som `div`, inte `<dl>`. "Passar till" och "senast kontrollerat" saknas i rutan. |
| Producent- och druvsidor | ❌ | Finns inte. Data för att bygga dem finns (producent, druva, land på varje vin). |
| Landsidor | ❌ | Finns inte (t.ex. italienskt eller portugisiskt naturvin). |
| Bilder | ✅ | Alla bilder har alt-text. Flaskbilder ligger i Blob och optimeras via `next/image`. |
| 404 | ✅ | Okända adresser och vin svarar 404. |
| Omdirigeringar | ✅ | Gamla adresser (t.ex. Stockholmsbarer) har permanenta omdirigeringar. |

## Problem och risker

1. **Faktapåståenden i Vad är naturvin.** Texterna om baksmälla ("viss logik bakom det") och att naturvin är "veganskt per definition" behöver nyanseras och få källor. Hälsopåståenden bör undvikas helt.
2. **Producentnamn är inte normaliserade.** Samma producent kan stå som "Weingut Arndorfer" och "Arndorfer", eller med olika versaler. Producentsidor kräver en normalisering först, annars blir det dubbletter.
3. **Druvnamn varierar** ("Blaufrankisch" och "Blaufränkisch"). Samma sak: normalisera innan druvsidor byggs.
4. **Tunna sidor.** Producenter med ett vin och druvor med ett vin ger tunna sidor. Förslaget är att bara indexera producenter och druvor med minst två viner (övriga får `noindex` men finns för länkningen).
5. **Ingen verifierad producentfakta.** Biografier, filosofi och odling finns inte i datan. De ska inte genereras; sidorna byggs på det som finns och kompletteras redaktionellt.
6. **Byte av URL-struktur.** Arbetsordern föreslår `/vin/[producent]-[vin]` och `/naturvin/rott`. Vinsidorna finns redan på `/viner/[slug]` och kategorierna på `/rott` m.fl. Att byta ger omdirigeringar och tappad historik utan vinst. Förslag: behåll.
7. **"Under 150 kr".** Kompassens budgetsteg är 199, 299 och 400 kr. En sida under 150 kr blir tunn och överlappar "under 200 kr". Förslag: hoppa över.

## Föreslagen plan

### Etapp A – Teknisk grund (liten risk, inga nya sidor)
1. Canonical på alla publika sidor via gemensam metadata.
2. Global `Organization` och `WebSite` (med sökfunktion mot kompassen) i layouten.
3. `BreadcrumbList` på vinsidor, kategorisidor, blogginlägg, svarssidor och barsidor.
4. `ItemList` på Topp 100 och kategorisidorna.
5. `BlogPosting` med datum, utgivare och bild på blogginlägg.
6. Vinsidor: faktarutan som `<dl>` med "Passar till" och "Pris kontrollerat <datum>"; titel och beskrivning med typ, land, druva och pris.
7. `FAQPage` med 3–4 frågor på varje kategorisida, svaren byggda på listans riktiga siffror.
8. llms.txt utökas med kategorier, Topp 100, barguiden och betygsmetoden.

### Etapp B – Entiteter och internlänkar
1. Normalisera producent- och druvnamn (en tabell med alias, inga ändringar i lagrad data utan admins godkännande).
2. `/producenter/[slug]`: land, regioner, druvor och alla producentens viner, med länk från varje vinsida.
3. `/druvor/[slug]`: färg, länder och alla viner med druvan, plus en kort redaktionell text för de 15–20 vanligaste druvorna.
4. Landsidor för de största länderna (Frankrike, Italien, Spanien, Portugal, Österrike), med samma upplägg som kategorisidorna.
5. Länkar vin → producent, druva och land, och tillbaka.
6. Producenter och druvor med bara ett vin får `noindex`.

### Etapp C – Innehåll och förtroende (behöver redaktionell input)
1. Nyansera och källbelägg Vad är naturvin.
2. Författarsida (Person) och "Så betygsätter vi" som egen sida, med vem som provar och hur ofta priser kontrolleras.
3. Redaktionella texter för kategorier, druvor och de viktigaste producenterna.

### Etapp D – Mätning
Search Console, Bing Webmaster Tools, Rich Results Test och schema-validering när A och B är live.

## Rekommendation
Börja med etapp A. Den rör inga adresser eller data, går att göra i en PR och ger störst effekt för minst risk. Etapp B kräver ett beslut om namnnormaliseringen. Etapp C kräver din text och din expertis.

## Genomfört: etapp A (2026-11-12)
- Canonical på alla publika sidor.
- `Organization` och `WebSite` globalt i layouten (startsidans egen `WebSite` borttagen).
- `BreadcrumbList` på vinsidor, kategori- och guidesidor, smakprofiler, Topp 100, blogginlägg och barsidor.
- `ItemList` i rankningsordning på Topp 100 (100 viner) och kategori-, guide- och smakprofilsidor (upp till 50).
- `BlogPosting` med datum, bild och utgivare på blogginlägg.
- `FAQPage` med synliga frågor på kategori-, guide- och smakprofilsidor, med svar uträknade ur listan (bästa vinet, prisspann och var vinerna finns).
- Vinsidor: titel som "BRQA 2023 – rött naturvin från Portugal, 186 kr", beskrivning med producent, ursprung, druvor, säljställe, mat och smak; faktarutan som `<dl>` med "Passar till" och "Pris kontrollerat"; matsvaret i FAQ byggs av vinets egna matkategorier och regionala mattext.
- llms.txt: guider, smakprofiler, naturvinsbarer, data per vin och betygsmetod. "Fyra frågor" rättat till tre i metadata och llms.txt.
- Delade hjälpare: `lib/seo.ts`, `components/JsonLd.tsx` (escapar `<`), `components/GuideSeo.tsx`.
