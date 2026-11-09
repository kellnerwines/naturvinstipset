# BRIEF: Vinkompassen, webbutiksviner, klickspårning och breddad positionering

Skriven 2026-11-09 inför bygget i Claude Code. Läs hela innan du börjar. Den bygger vidare på `BRIEF.md` (Del 1–5 för SEO) och ersätter dess "Del 6 – Senare fas" för smakprofils-quizet.

**Referensmaterial i repot**
- `design/vinkompassen-prototyp.html` är en fungerande prototyp av kompassen, en enda fil. Öppna den i en webbläsare. **Den visar flöde, beteende, texter och poänglogik, inte utseende.** Utseendet ska följa sajtens befintliga tema (se avsnitt 2).
- `data/wines-vinnatur.json` innehåller 231 importerade viner från vinnatur.shop i sajtens vinformat.
- `data/wines-flaskvis.json` innehåller 6 importerade Kellner & Kellner-viner från flaskvis.se.
- `data/wines.json` är de befintliga 68 vinerna från Systembolaget.
- `data/food-systembolaget.json` innehåller matförslag, matkategorier och flaggan för egen import för de 68 vinerna.

---

## 0. Målbild och ny positionering

Naturvinstipset breddas från "100 bästa naturvinerna på Systembolaget" till **en guide som hjälper dig hitta rätt naturvin, på Systembolaget och i svenska webbutiker**.

- Startsidan möter besökaren med **Vinkompassen**, ett chattflöde där fyra tryck ger ett första förslag. Därefter kan besökaren borra djupare.
- Den nuvarande topplistan blir flik nummer 2.
- Vinerna kommer från Systembolaget och från webbutiker som säljer till svenska konsumenter **med svensk alkoholskatt inräknad**.
- Sajten ska vara transparent med att den drivs av grundaren av vinimportören Kellner & Kellner.

### Ny metadata (`app/layout.tsx`)

- `title.default`: **"Naturvinstipset – hitta rätt naturvin på Systembolaget och i svenska webbutiker"**
- `description`: **"Svara på fyra snabba frågor och få naturvin som passar din smak, din budget och din mat. Viner från Systembolaget och svenska webbutiker, med smakprofiler, matförslag och köptips."**
- `keywords`: lägg till "naturvin online", "köpa naturvin", "naturvin hemleverans", "orange vin", "vinkompass" och "vilket vin passar".
- OpenGraph-texter ska uppdateras på samma sätt.
- Gå igenom alla texter som säger "på Systembolaget" som avgränsning: startsidan, `om-listan`, `om-oss`, kategorisidorna och FAQ (`HomeFaq.tsx`). Formulera om dem till "på Systembolaget och i svenska webbutiker" där det gäller hela sajten. Topplistan får fortsatt heta "Topp 100 på Systembolaget" om den bara innehåller viner från Systembolaget.

---

## 1. Teknisk utgångspunkt (befintligt)

- Next.js 14.2 med App Router, React 18, Tailwind 4, TypeScript och hosting på Vercel.
- **Obs:** `AGENTS.md` hänvisar till `node_modules/next/dist/docs/`, och den mappen finns inte. Ignorera det och kör på faktisk Next 14.2-kod (samma bedömning som i `BRIEF.md`).
- Vinerna lagras i Vercel Blob via `lib/blob.ts` (`getWines` och `saveWines`). Admin finns i `components/AdminPanel.tsx` och `app/api/wines`. Seed sker via `app/api/seed`.
- Befintliga komponenter att återanvända är bland andra `WineCard`, `WineGrid`, `Stars`, `AgeGate`, `CookieBanner`, `Nav`, `Footer` och `SiteShell`.
- Vinsidor ligger i `app/viner/[slug]`, smakprofilsidor i `app/smakprofil/[profil]` och JSON-LD i `lib/wineJsonLd.ts`.

---

## 2. Design: behåll sajtens tema

**Kompassen får inte kännas AI-genererad eller "Claude-byggd".** Den ska se ut som resten av naturvinstipset.se.

- **Använd tokens från `app/globals.css`:**
  - `--bg` #f0ebe2 (krämvit), `--fg` #0d0d0d, `--muted`, `--faint`, `--rule` och `--card`.
  - Typfärgerna `--wine-vitt`, `--wine-rott`, `--wine-rose`, `--wine-orange`, `--wine-petnat` och `--wine-mousserande`.
- **Typsnitt:** Outfit via `--font-syne`, som redan laddas i layouten. Inga nya typsnitt.
- **Stilen är redaktionell och minimal:**
  - Tunna linjer (`--rule`) och få eller inga skuggor.
  - Inga gradienter, glödeffekter eller "AI-gnistor".
  - Ingen generisk chattbot-ikon. Kompassens avatar är ett enkelt vinglas eller en kompassnål i `--fg`.
- **Prototypens färger och typsnitt ska inte användas.** Prototypen har en mörkröd accent och Instrument Serif, och båda byts mot sajtens tema. Behåll däremot rytmen:
  - agentens meddelanden till vänster och användarens svar som bubblor till höger
  - val som knappar
  - ett "tänker"-block med steg
  - skrivfältet som klistrar sig i nederkant
  - förslagsknappar under fältet
- **Användarbubblan:** `--fg` som bakgrund och `--bg` som text. Valda knappar får samma.
- **Vinkort:** utgå från befintliga `WineCard` och utöka dem (se avsnitt 4.6) i stället för att bygga en ny kortstil.
- **Tillgänglighet och mobil:**
  - Mobil först, 16 px marginal och ingen horisontell scroll.
  - Synlig fokusmarkering och `aria-live` på chattströmmen.
  - `prefers-reduced-motion` ska stänga av typewriter, spinners och glidanimationer.
- Inget mörkt läge behövs, eftersom sajten inte har det.

---

## 3. Navigation och placering

- **Flik 1, "Vinkompassen":** startsidan `/`. Det är det besökaren möter först.
- **Flik 2, "Topp 100":** den nuvarande startsidans topplista flyttas till en egen route, `/topp-100`. Behåll befintlig SEO-text och JSON-LD där.
  - Lägg in en 301-omdirigering från gamla ankare eller länkar om sådana finns.
  - Uppdatera `sitemap.ts` och interna länkar.
- **Övrig navigation** (kategorier, guider, barer, blogg) ligger kvar i `Nav.tsx`.
- **Under kompassen på startsidan:** en kort SEO-text, FAQ och en "Topp 100"-teaser. Startsidan ska fortfarande ranka på "naturvin", så den får inte bli en tom app-sida.
- **Server-rendering:** kompassen är en klientkomponent, men startsidan renderas på servern med rubrik, intro och FAQ i HTML.

---

## 4. Vinkompassen: funktionsspec

### 4.1 Flödet

1. **Hälsning:** rubriken "Vilket naturvin passar dig?" och en rad om att det finns över 300 naturviner på Systembolaget och i svenska webbutiker.
2. **Fyra frågor** ställs i chatten, en i taget, i den här ordningen:

| # | Fråga | Typ | Svar |
|---|---|---|---|
| 1 | Vilken färg är du sugen på? | flerval | Rött, Vitt, Orange, Rosé, Bubbel (Pét Nat + Mousserande) |
| 2 | Hur mycket vill du lägga? | ett val | Under 150 kr, Upp till 250 kr, Upp till 400 kr |
| 3 | Hur äventyrlig är du? | ett val | Som vanligt vin, Lite annorlunda, Ge mig funk |
| 4 | Ska vinet passa till mat? | flerval | Nej, bara dricka · Fisk och skaldjur · Fågel · Rött kött och vilt · Fläsk och chark · Vegetariskt · Kryddigt · Ost |

   - Varje fråga har dessutom valet **"Spelar ingen roll"**, en streckad knapp som hoppar över frågan.
   - **Ingen "Klar"-knapp.**
     - Ett val går vidare direkt.
     - Vid flerval startar en kort nedräkning på 1,2 s som syns som en tunn stapel, med texten "Välj fler om du vill, annars går jag vidare". Varje nytt tryck startar om nedräkningen.
     - Väljs "Nej, bara dricka" avmarkeras andra matval och flödet går vidare direkt.
   - Användarens svar visas som bubbla och uppdateras live om valet ändras.
   - Varje fråga visar "Fråga X av 4 · N viner i urvalet just nu".
   - **Tidigare svar går alltid att ändra.** Man trycker om i en tidigare fråga, och då uppdateras bubblan och förslagen utan att flödet börjar om.
3. **Tänker-block:** fyra steg med spinner som blir en bock, ungefär 0,5 s per steg. Stegen är urval, funk-matchning, matförslag och rangordning, med en kort sammanfattning under varje. Blocket fälls sedan ihop till "Tänkte i X s".
4. **Förslag:** "Mitt bästa förslag är {vin} från {producent}. Här är de som passar dig bäst." Under det kommer de 5 bästa vinkorten och knappen "Visa 7 till ({N} passar)". Inledningsmeningen uppdateras när urvalet ändras.
5. **"Vill du borra djupare?"** visas med knappar som öppnar paneler i chatten. Förslagen uppdateras live, med en kort markering och raden "Förslagen uppdaterade, N viner passar. Visa ↑". Panelerna är:
   - **Var jag köper:** Spelar ingen roll / Systembolaget / Hemleverans från webbutik
   - **Smakprofil:** fyra reglage för syra, fyllighet, strävhet och funk, 0–5 där 0 betyder "Spelar ingen roll"
   - **Smak:** smaktaggar (Fruktig, Mineralisk, Komplex, Krispig, Lättsam, Jordig, Frisk, Blommig, Tanninrik, Aromatisk, Kryddig, Citrus, Örtig)
   - **Mat:** matkategorier
   - **Land:** lista över länder
   - **Druva:** fritext
   - **Liknar ett vin jag gillar:** lista över alla viner
   - **Börja om**
6. **Skrivfältet** är alltid synligt längst ner. Under det finns förslagsknappar som byter innehåll före och efter första förslaget, till exempel "Något kryddigt till solnedgången på balkongen", "Ett vitt till skaldjur under 250 kr", "Mer mineraliskt", "Från Portugal", "Lite mer funk" och "Börja om".

### 4.2 Fritext: förstå och spegla

Fritexten tolkas med ordmatchning (se `parse()` och `reflect()` i prototypen). Ingen AI i fas 1, men koden ska vara förberedd för att byta tolkaren mot Claude Haiku via API i en senare fas.

**Vad tolkaren ska förstå**
- **Färg.** "Skalkontakt", "maceration" och "på skalen" betyder orange.
- **Budget.** "Under 200", "billigt" och "något fint".
- **Funknivå.** "Inte för funkigt" ska tolkas som det motsatta.
- **Mat.** Thaimat, lammgryta, ostron och liknande. Skilj "kryddig smak" från "kryddig mat".
- **Tillfälle:**
  - Balkong, solnedgång eller sommar ger friskt och lättdrucket, gott på egen hand.
  - Brasa, höst eller mys ger djup och jordighet med mer kropp.
  - Fest ger lätt att tycka om.
- **Smakord.** Mineraliskt, mjukt, fylligt, strävt och liknande.
- **Land.** Även adjektiv som "franskt".
- **Druva och liknande vin.** Druvnamn och "likt X".
- **Var man köper.** "Systembolaget" respektive "hemleverans".

**Svaret ska spegla tolkningen, inte bara lista den.** Exempel:
> "Solnedgång på balkongen, det låter som en fin kväll. Jag tänker ett vitt, och eftersom du nämner skalkontakt tar jag med orangeviner också … Det jag inte vet än är budget och hur äventyrlig du är, några tryck till så har du ditt förslag."

- Under svaret visas taggar för "Jag plockade upp", och motsvarande val markeras i frågorna ovanför.
- Därefter frågar kompassen bara det som saknas.
- **Inledningen anpassas efter mat:** "Kryddig mat, då behövs ett vin som tål hettan och inte är för strävt."
- **Om inget förstås:** be vänligt om färg, tillfälle eller mat, med ett exempel.
- **Meddelanden i kö.** Skriver användaren medan kompassen "tänker" köas meddelandet. Det får inte ignoreras.

### 4.3 Poängmotor (portera exakt från prototypen)

**Hårda filter:** färg, budget, mat (minst en matchande kategori), land, druva (delsträng) och butik.

**Mjuk poäng** startar på 100 och justeras så här:
| Del | Regel |
|---|---|
| Äventyr | Målvärde för funk 1,5 / 2,5 / 3,5. −12 per steg ifrån. |
| Reglage | −10 per steg ifrån målvärdet. |
| Smaktaggar | +6 per träff, −6 per miss. Matchning på prefix (5 tecken). |
| Matträffar | +5 per träff. |
| Likt vin | −7 × profilavståndet, +4 per delad tagg. |
| "Bara dricka" | +4 om vinet passar som aperitif. |
| Admin-betyg | +(betyg − 4) × 3. |
| Slutvärde | Begränsas till 1–99 och visas som "matchning %". |

**Egen import ger ingen poängfördel.** Det är ett krav och ska täckas av ett test.

**Släppa filter vid få träffar:** om färre än 3 viner matchar släpps ett filter i taget, i ordningen druva → land → butik → mat → budget → färg. Ett filter släpps bara om det faktiskt ger fler träffar. Färg släpps bara om det annars blir 0 träffar. Visa sedan: "För få viner matchade alla dina val, så jag bortsåg från budget och mat."

### 4.4 Delbar URL

Kompassens val ska speglas i URL:en, till exempel `?farg=vitt,orange&budget=250&aventyr=2&mat=fisk`. En länk öppnar kompassen med svaren ifyllda och förslaget visat, vilket är bra för delning och kampanjer.

### 4.5 Spårning i kompassen (utan personuppgifter)

Logga anonyma händelser: frågesvar, fritext (texten kortas och lagras utan IP-adress), använda paneler och klick på köplänkar. Händelserna används för att förbättra frågor och tolkning. De följer samma lagring som i avsnitt 7.

### 4.6 Vinkortet i kompassen

Kortet visar:
- **Flaskbild.** `primaryImageUrl`, med en enkel flask-SVG i vinets typfärg som reserv.
- **Rubrikraden:** typ · land · årgång, plus etiketten **"Egen import"** om `ownImport`.
- **Vinet:** namn, sedan producent · druva.
- **Matchningen** i procent.
- **Profilen:** fyra staplar (syra, fyllighet, strävhet, funk) med en markör för användarens målvärde.
- **"Passar till:"** följt av `foodPairing` (se avsnitt 5.4).
- **Taggar:** träffar markeras.
- **Pris och butik:**
  - Pris "ca X kr", och för webbutiker också "hemleverans, svensk skatt ingår".
  - Köplänk: "Se vinet hos Systembolaget →" eller "Köp hos {butik} →".
  - Har vinet flera säljställen (`offers`) visas en andra länk, till exempel "Eller hemleverans hos Flaskvis, 229 kr →".
- **Automatisk profil:** om `autoProfile` visas en diskret rad: "Smakprofilen är uppskattad automatiskt från butikens beskrivning."
- **Länkar:** kortet länkar till vinsidan `/viner/[slug]`. Alla köplänkar går via `/go/...` (avsnitt 7).

---

## 5. Datamodell: utöka `Wine` i `lib/blob.ts`

Lägg till fält **utan att bryta befintliga**:

```ts
type Shop = "Systembolaget" | "Vin & Natur" | "Flaskvis" | string;

interface Offer {
  shop: Shop;
  url: string;          // butikens produktsida (rå URL, länkas via /go)
  price: number;        // SEK inkl. moms och svensk alkoholskatt
  inStock: boolean;
  lastSyncedAt: string; // ISO
}

interface Wine {
  // ... befintliga fält (syra, fyllighet, funk, stravhet 1–5 finns redan)
  offers?: Offer[];              // ersätter på sikt systembolagetUrl/price som källa
  shop?: Shop;                   // primärt säljställe (för enkel filtrering)
  shopUrl?: string;
  ownImport?: boolean;           // Kellner & Kellner-import → "Egen import"-märkning
  foodPairing?: string;          // regional mattext, se 5.4
  foodCategories?: ("fisk"|"fagel"|"kott"|"flask"|"vego"|"kryddigt"|"ost"|"aperitif")[];
  source?: string;               // t.ex. "vinnatur.shop", "flaskvis.se", "manual"
  sourceId?: string;             // butikens handle/slug
  autoProfile?: boolean;         // smakprofil uppskattad automatiskt
  lockedFields?: string[];       // fält som admin ändrat – importen får inte skriva över dem
}
```

- **Migrering:** befintliga viner får `offers` med Systembolaget byggt från `systembolagetUrl` och `price`, samt `shop: "Systembolaget"`.
- **Import av JSON-filerna:** ladda in `data/wines-vinnatur.json` och `data/wines-flaskvis.json` via seed eller en engångsroute. Alla är `published: true`.
- **Dubbletter:** samma vin hos flera säljställen ska bli **ett vin med flera `offers`**, inte två vinsidor. Matcha på producent + namn + årgång, normaliserat.
  - Kända fall: "Saroto Palhete" (Systembolaget och Flaskvis) och "Barroca White", som heter "Vinho Branco" på Flaskvis.

### 5.1 Bilder

Webbutikernas flaskbilder ska **laddas ner och lagras i Vercel Blob** och inte hotlänkas. `primaryImageUrl` i importfilerna pekar på butikens original.

- Ladda ner bilden.
- Beskär vit eller transparent kant.
- Skala till max 600 px höjd och spara som WebP i Blob.
- Uppdatera `primaryImageUrl`.
- Visa med `next/image`. Lägg till Blob-domänen i `next.config.mjs` om det behövs.

### 5.2 Egen import

`ownImport: true` gäller producenterna Arribas Wine Company, Barroca da Malhada, Desviso Vinhos, Gardunha Sul och Adega Belém, samt alla viner med `kellner` i Systembolagets URL. Admin ska kunna ändra flaggan per vin.

### 5.3 Smakprofil för webbutiksviner

- **Flaskvis** har riktiga värden (CSS-klasser `torr-NN`, `fyllighet-NN`, `funk-NN` och `stravhet-NN` på 0–100). Omvandla till 1–5 med `max(1, round(v/20))`. `autoProfile: false`.
- **Vin & Natur** har bara beskrivande text. Profilen är heuristisk från nyckelord. `autoProfile: true`.
  - **Fas 2:** berika med Claude (Sonnet, Batch API, en gång per vin) för att sätta syra, fyllighet, strävhet, funk, smaktaggar, matkategorier och en kort egen beskrivning.
  - Spara resultatet och kör aldrig AI per sidvisning.
  - Kända fel att låta AI-berikningen eller admin rätta:
    - Två Saint-Aubin är markerade röda men är troligen vita: `saint-aubin-1er-cru-sur-le-sentier-du-clou-2023` och `la-sauvage-saint-aubin-1er-cru-la-chateniere-2022`.
    - Druva saknas på drygt 30 viner.

### 5.4 Matförslag ("if it grows, it goes")

`foodPairing` är **en mening på enkel svenska med 2–3 konkreta rätter**, där vinets trakt syns i råvaror och smaker, inte i främmande rättnamn. Inga extra rader som "Hemma funkar…". Exempel:
- Loire, vitt: "Getost, gös med smörsås eller sparris."
- Languedoc, rött: "Bönor och korv i långkok, lammkorv eller grillat kött med timjan."
- Trás-os-Montes, rött: "Grillad oxkotlett, rökt korv eller långkok på fläsk och kål."
- Mähren, orange: "Anka med rödkål, grön curry med kyckling eller en bit lagrad getost."

Regler:
- Första rätten har tydlig koppling till regionen. De följande är vardagsmat som går att laga i Sverige.
- Inga generiska Systembolaget-fraser som "passar till fisk och fågel".
- Den som skriver nya texter ska följa samma stil. I fas 2 gäller det även Claude-berikningen.

Texterna finns i importfilerna och, för vinerna från Systembolaget, i `data/food-systembolaget.json` (slug → foodPairing, foodCategories, ownImport). Admin ska kunna redigera dem, och redigerade fält läggs i `lockedFields`.

---

## 6. Import och synk av webbutiksviner

Bygg skript i `scripts/` och kör dem som **Vercel Cron en gång per månad** (den 1:a, natt). De ska också kunna köras manuellt från admin med knappen "Synka nu". Synken är vanlig kod utan AI och kostar inga Claude-krediter. Håll den inom Vercels gratisnivå.

### 6.1 Vin & Natur (vinnatur.shop, Shopify)

**Hämtning**
- Produkter: `https://vinnatur.shop/products.json?limit=250&page=N`, sidvis tills det tar slut.
- **Urval:** `product_type === "Vin"`, minst en variant tillgänglig, inte magnum, jeroboam eller 1,5 l, och pris över 0.
- **Pris:** ta varianten "1 flaska", annars "Default Title".
- **Region och producent:** de finns bara i produktsidans brödsmulor, där första och andra länken (före "›") är region och producent. Hämta `/products/{handle}` och läs brödsmulorna.
  - Undantag: om "region" är "Strohmeier" är det producenten, och regionen är Steiermark i Österrike.
- **Land från region:**
  - Frankrike: Alsace, Ardèche, Auvergne, Beaujolais, Bourgogne, Champagne, Jura, Languedoc, Loire, Lorraine, Rhône, Roussillon, Savoie
  - Italien: Emilia, Friuli, Lazio, Piemonte, Sicilien, Toscana, Umbrien, Veneto
  - Spanien: Granada
  - Sverige: Skåne
  - Grekland: Tinos

**Härledning ur beskrivningen**
- **Druvor:** matcha mot en druvlista med ordgränser. Låt inte "côte" bli druvan "Côt".
- **Färg, i den här prioriteten:**
  1. Bubbel om taggen "Bubbel" finns eller beskrivningen nämner pétillant, pet nat, mousserande, champagne, crémant eller ancestral.
  2. Rosé om rosato, rosado eller rosé.
  3. Om bara blå druvor: Rött, utom "blanc de noirs".
  4. Om bara gröna druvor: Orange vid skalkontakt eller maceration, annars Vitt.

**Kontroller**
- Varje produktsida anger "Moms och alkoholskatt inkluderad". **Verifiera texten vid varje synk.** Försvinner den ska vinet avpubliceras och admin larmas.
- Var snäll mot butiken: högst 5 samtidiga anrop, cache och en user-agent som "NaturvinstipsetBot/1.0 (+https://www.naturvinstipset.se/om-oss)".

### 6.2 Flaskvis (flaskvis.se, WooCommerce)

- **Produkter:** Store API `GET /wp-json/wc/store/v1/products?per_page=100&page=N`. WP REST är avstängt, men Store API fungerar.
- **Urval:** för varje produkt, hämta permalänken och behåll bara de vars flik "Importören" (`.items[data-section="supplier"]`) innehåller "Kellner".
- **Fält att läsa:**
  - Druvor och stil från `.meta-row`.
  - Smakvärden från `.flaskor-values .row` (klasserna `torr-NN` osv.).
  - Producent från fliken "Producenten".
  - Region som texten före produktnamnet.
  - Årgång.
  - Lagerstatus från `is_in_stock`.
- **Utfall vid importen 2026-11-09:**
  - 10 viner, varav 8 i lager.
  - Ciclo Pet Nat Rosado och BRQA var slut. BRQA finns ändå på Systembolaget.

### 6.3 Gemensamma regler

- **Skriv aldrig över fält i `lockedFields`.**
- **Slutsålt vin:** sätt `inStock: false` på erbjudandet. Om inget säljställe har vinet i lager döljs det i kompassen, men vinsidan står kvar med "Tillfälligt slut".
- **Nytt vin hos en butik:** skapa det som `published: true`, enligt beslut 2026-11-09.
- **Logg:** spara en synklogg med antal nya, ändrade, slut och fel. Visa den i admin.
- **Systembolaget:** API:et för produktdata är stängt för tredje part, och sajten ska inte skrapas. Lägg i stället till en adminfunktion "Lägg till från Systembolaget-länk". Admin klistrar in en URL, fyller i resten för hand (eller med Claude i fas 2) och sparar.

### 6.4 Butiker som är uteslutna (följ upp)

Regeln är att bara butiker som **riktar sig till svenska konsumenter och tar med svensk alkoholskatt i priset** listas.

- **Uteslutna:**
  - Drops (drops.wine) och Natural Wine Dealers, där kunden själv ska betala alkoholskatten.
  - Nordiska Vin, som inte är inriktad på naturvin.
- **Kandidater för senare import:** Philipson Wine (kategorin naturvin, skatt ingår) och Vino.com (skatt ingår). MORE Natural Wine är oklart när det gäller skatten.

---

## 7. Klickspårning och dashboard (egen, ingen extern plattform)

### 7.1 Utgående länkar

- **Alla köplänkar går via** `/go/[shop]/[slug]`, till exempel `/go/systembolaget/saroto-palhete`.
- **Routen gör tre saker:**
  1. Slår upp vinet och erbjudandet.
  2. Loggar klicket.
  3. Svarar med 302 till butiken.
- **Märkning:** till webbutiker läggs `utm_source=naturvinstipset&utm_medium=referral&utm_campaign=vinkompassen` (eller sidans namn) och `ref=naturvinstipset` på. Till Systembolaget läggs ingenting på.
- **Klicket loggar:**
  - tid, vin-id, butik och pris
  - källsida (kompassen, vinsidan, topplistan eller en kategori), sidans URL och referrer
  - kompass-sessionens val, om sådana finns
  - grov enhetstyp
  - **ingen IP-adress och ingen kaka**
- **Fusk och robotar:** dedupe på hash(UA + dag + vin), som inte går att koppla till en person, och filtrera bort kända bottar.
- **Länkattribut:** `rel="nofollow"` på alla köplänkar. Ingen ersättning finns i dag, så `sponsored` och ersättningstexter läggs **inte** in nu. Förbered en inställning i admin ("Ersättning från webbutiker: av/på") som slår på `rel="sponsored nofollow"` och ersättningsmeningen i 8 när första avtalet finns.

### 7.2 Lagring

Använd **Neon Postgres via Vercels integration på gratisnivån** (godkänt av Simon under förutsättning att det inte kostar något). **Inte Blob**, eftersom samtidiga skrivningar ger konflikter. Kontrollera gratisnivåns aktuella gränser innan du väljer. Håll datamängden liten, till exempel genom att aggregera händelser äldre än 90 dagar till dagssummor. Visa i admin hur nära gränsen vi är.

Tabellen `click_events` har kolumnerna id, ts, wine_id, shop, price, source_page, page_path, referrer_host, compass_state_json, device och bot_flag.

### 7.3 Dashboard

**Admin, `/admin/klick`**
- Klick per dag, per butik (inklusive Systembolaget), per vin och per källsida.
- Topplista över viner och andel klick från kompassen.
- Datumfilter och CSV-export.

**Partnervy, `/partner/[token]`**
- En hemlig länk per butik där butiken ser sina egna klick per vin och dag, och inget annat.
- Statistiken ska kunna användas som underlag för en kostnadsmodell (pris per klick eller provision).

**Konverteringar (fas 2)**
- Ett litet skript som butiken lägger på sin orderbekräftelse via Shopify Custom Pixel eller WooCommerce-hook.
- Det anropar `POST /api/conversion` med `ref`, ordervärde och ordernummer.
- Kopplas till klick via `ref` och tidsfönster, och visas i båda vyerna.
- Rabattkoder ska **inte** användas.

### 7.4 Integritet

Ingen kaka eller personuppgift behövs för klickloggningen. Om en analys-kaka läggs till senare måste den gå via befintliga `CookieBanner.tsx` med samtycke.

---

## 8. Ägarredovisning och oberoende

- **Sidfoten (`Footer.tsx`) och Om oss:** "Naturvinstipset drivs av grundaren av vinimportören Kellner & Kellner. Viner från egen import är märkta och får ingen fördel i rankningen." Ingen mening om ersättning förrän ett avtal finns (se 7.1).
- **Om oss** får ett eget avsnitt "Så rankar vi och så tjänar vi pengar". Det förklarar poängmotorn, att egen import inte prioriteras, att sajten i dag inte får någon ersättning från vare sig Systembolaget eller webbutikerna.
- **Etiketten "Egen import"** visas på vinkort, vinsidor och i topplistan. Den har en tooltip eller länk till förklaringen.
- **Systembolaget:** behåll texten "Köp och avhämtning sker hos Systembolaget. Systembolaget står inte bakom innehållet." där vi länkar dit. Den krävs enligt deras villkor för länkning. Komplettera med samma sak för webbutikerna.
- **Alkohollagen:**
  - Måttfullhet i alla texter.
  - Inget som riktar sig till personer under 25 år.
  - Befintliga `AgeGate` ska ligga kvar och gälla även kompassen.
  - Inga uppmaningar till ökat drickande. Formuleringar som "klunkigt" får finnas i beskrivningar, men inga "köp mer"-budskap.
- **`lib/kellnerLinks.ts`:** korslänkar till kellnerwines.se ska vara tydligt märkta.

---

## 9. SEO

- **JSON-LD (`lib/wineJsonLd.ts`):** `Product` får `offers` som array, med en `Offer` per säljställe (pris, `priceCurrency: SEK`, `availability`, `seller`).
- **Nya vinsidor:** alla publicerade webbutiksviner får vinsidor under `/viner/[slug]` och kommer med i `sitemap.ts`.
- **Kategorisidor** (`/rott`, `/vitt`, `/orange`, `/pet-nat` och guiderna) får filtret "Var köper du?" och texter som täcker både Systembolaget och webbutiker.
- **Möjliga nya landningssidor:**
  - `/naturvin-online` (köpa naturvin med hemleverans)
  - producentsidor `/producent/[slug]`
  - regionsidor `/region/[slug]`
  
  Producent- och regionsidorna fanns redan i `BRIEF.md` Del 6.
- **FAQ:** lägg till "Var kan man köpa naturvin online i Sverige?" och "Ingår alkoholskatten när man köper vin från en webbutik i EU?".

---

## 10. Faser och leveranser

**Fas 1 (bygg nu)**
1. Utöka datamodellen, migrera, seeda importfilerna och slå ihop dubbletter (avsnitt 5).
2. Flytta bilderna till Blob (5.1).
3. Bygg Vinkompassen som startsida, med fritext, poängmotor, paneler och delbar URL (avsnitt 4).
4. Flytta topplistan till `/topp-100` och uppdatera navigation, sitemap och interna länkar (3).
5. Bredda metadata och texter (0).
6. Bygg `/go`-routen, klicklogg och admin-dashboard (7.1–7.3, utan konverteringar).
7. Lägg in ägarredovisning, "Egen import" och Om oss-avsnittet (8).
8. Bygg import- och synkskripten med cron, synklogg och "Synka nu" (6).
9. Uppdatera JSON-LD med flera erbjudanden och sitemap (9).

**Fas 2**
- Claude-berikning av profiler och texter (Sonnet, batch).
- Fritext via Claude Haiku med regelverket som reserv.
- Konverteringar och partnervy.
- Philipson och Vino.com.
- Producent- och regionsidor.

### Acceptanskriterier för fas 1

- **Fyra tryck till förslag.** På mobil (375 px) ska fyra tryck utan att skriva ge ett förslag, och ingen "Klar"-knapp finns.
- **Ändrade svar.** Ändras ett tidigare svar uppdateras bubblan och förslagen utan omstart.
- **Fritexttest.** "Jag vill ha ett vitt som är lite kryddigt som man kan dricka i solnedgången på en balkong, gärna med lite maceration" ska ge följande:
  - Valen Vitt + Orange, Gott på egen hand och smaktaggen Kryddig.
  - Ett speglande svar.
  - Att kompassen därefter bara frågar budget och äventyr.
- **Egen import.** Ett test visar att egen import inte påverkar poängen.
- **Klick loggas.** Alla köplänkar går via `/go`, och klick syns i `/admin/klick` inom en minut.
- **Synken.** Den kan köras två gånger utan dubbletter och skriver inte över låsta fält.
- **Prestanda.** Lighthouse mobil på startsidan ger Performance ≥ 85 och Accessibility ≥ 95.
- **Utseende.** Sajten ser ut som naturvinstipset.se gör i dag (tokens, Outfit, redaktionell stil). Inga nya färgteman, gradienter eller AI-estetik.

---

## 11. Beslut (Simon, 2026-11-09)

1. **Tema:** sajtens nuvarande tema gäller (krämvitt, svart, Outfit). Prototypens färger och typsnitt används inte.
2. **Titel och beskrivning:** enligt avsnitt 0.
3. **Topplistan** heter fortsatt "Topp 100" och innehåller bara viner från Systembolaget.
4. **Egen import:** producentlistan i 5.2 stämmer.
5. **Klickdata:** Neon Postgres är godkänt så länge det håller sig på gratisnivån.
6. **Synk:** en gång per månad räcker, plus "Synka nu" i admin.
7. **Ersättning:** ingen ersättningstext eller `sponsored` nu. Det slås på via admin när första avtalet finns.
8. **Importerade viner** från Vin & Natur och Flaskvis publiceras direkt, utan att butikerna först har gett lov.
