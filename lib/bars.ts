// Naturvinsbarer i hela Sverige (genomgång 2026-11-11). Varje ställe är kontrollerat mot
// egen webbplats eller flera guider (Star Wine List, World of Mouth, Visit Stockholm,
// Göteborg & Co). Koordinater från OpenStreetMap (Nominatim) utifrån adressen.

export type BarType = "Vinbar" | "Restaurang" | "Delikatess" | "Bar";

export type Bar = {
  slug: string;
  name: string;
  city: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  website?: string;
  /** Instagramnamn utan @. */
  instagram?: string;
  type: BarType;
  wine_focus: string;
  food: boolean;
  description: string;
  /** Ställen som inte har öppnat än, t.ex. "Öppnar snart" eller "Öppnar i december". Tas bort när de öppnat. */
  opening?: string;
  /** Foto från ställets egen webbplats, i public/barer/. Fotografen/stället står som källa under bilden. */
  image?: string;
  /** Har stället godkänt att bilden används? Simon frågar alla (november 2026); byts till true vid ja, och bilden tas bort vid nej. */
  imageApproved?: boolean;
};

/** Städer i den ordning de visas. */
export const CITIES = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Örebro"];

export const bars: Bar[] = [
  {
    slug: "ambar-stockholm", name: "Ambar", city: "Stockholm", address: "Tomtebogatan 22", neighborhood: "Vasastan",
    lat: 59.34148, lng: 18.03211, website: "https://ambarvinbar.se", instagram: "ambarwinebar",
    type: "Vinbar", wine_focus: "Naturvin utan tillsatser, orangevin", food: true,
    description: "Liten vinbar vid S:t Eriksplan som bara serverar naturligt vin utan tillsatser, till japansk husmanskost. Listan har gott om orangevin och viner med skalkontakt.",
    image: "/barer/ambar-stockholm.jpg", imageApproved: false,
  },
  {
    slug: "alba-vinbar-stockholm", name: "Alba Nytorget", city: "Stockholm", address: "Skånegatan 88", neighborhood: "Södermalm",
    lat: 59.31244, lng: 18.08148, website: "https://albavinbar.se", instagram: "alba_nytorget",
    type: "Vinbar", wine_focus: "Naturvin från småskaliga producenter", food: true,
    description: "Vinbar och restaurang vid Nytorget där naturvin från småskaliga producenter står i centrum. Ett avslappnat kvartersställe som passar lika bra för ett glas efter jobbet som för en hel middag.",
  },
  {
    slug: "hosoi-stockholm", name: "Hosoi", city: "Stockholm", address: "Styckmästargatan 5", neighborhood: "Slakthusområdet",
    lat: 59.29208, lng: 18.07862, website: "https://www.hosoistockholm.com", instagram: "hosoisthlm",
    type: "Restaurang", wine_focus: "Naturvin", food: true,
    description: "Restaurang och bar i Slakthusområdet där musiken står i centrum. Lokal och säsongsbetonad mat, naturvin i glaset och dj:s och dans framåt kvällen.",
    image: "/barer/hosoi-stockholm.jpg", imageApproved: false,
  },
  {
    slug: "matateljen-stockholm", name: "Matateljén", city: "Stockholm", address: "Hallvägen 9", neighborhood: "Slakthusområdet",
    lat: 59.29291, lng: 18.07536, website: "https://matateljen.se", instagram: "matateljen",
    type: "Restaurang", wine_focus: "Naturvin från Jura, Loire och Beaujolais bredvid klassisk Bourgogne", food: true,
    description: "Restaurang i Kylhuset i Slakthusområdet med säsongsmenyer från ett öppet kök. Den långa vinlistan har gott om naturvin från bland andra Jura, Loire, Beaujolais och Auvergne, bredvid klassisk Bourgogne och Piemonte. Det finns också en deli.",
  },
  {
    slug: "ring-katarina-stockholm", name: "Ring Katarina", city: "Stockholm", address: "Katarina Bangata 66", neighborhood: "Södermalm",
    lat: 59.30996, lng: 18.08487, website: "https://ringkatarina.se", instagram: "ring_katarina",
    type: "Vinbar", wine_focus: "Naturvin", food: true,
    description: "Liten vin- och matbar i hörnet mot Ringvägen, med ett tjugotal platser inne och uteservering på sommaren. Naturvin och små rätter med europeiska influenser, och menyn byts ofta. Samma gäng står bakom Racamaca.",
    image: "/barer/ring-katarina-stockholm.jpg", imageApproved: false,
  },
  {
    slug: "folii-stockholm", name: "Folii", city: "Stockholm", address: "Erstagatan 21", neighborhood: "Södermalm",
    lat: 59.31402, lng: 18.09038, website: "https://folii.se", instagram: "folii_sthlm",
    type: "Vinbar", wine_focus: "Naturvin och hållbart odlat, över hundra viner på glas", food: true,
    description: "Sommelierdriven vinbar på SoFo med över hundra viner på glas och fokus på naturvin och hållbart odlat. Säsongsbetonade småplock, och musiken spelas som hela album på vinyl.",
  },
  {
    slug: "hornstulls-bodega-stockholm", name: "Hornstulls Bodega", city: "Stockholm", address: "Hornsbruksgatan 24", neighborhood: "Hornstull",
    lat: 59.31614, lng: 18.03479,
    type: "Vinbar", wine_focus: "Naturvin", food: true,
    description: "Hornstulls första vinbar, öppnad 2014, med naturvin och medelhavsinspirerade rätter att dela. Öppet sent i helgerna. Ingår i Tjoget-gruppen.",
  },
  {
    slug: "frammat-stockholm", name: "Främmat", city: "Stockholm", address: "Dalagatan 54", neighborhood: "Vasastan",
    lat: 59.34225, lng: 18.04524,
    type: "Restaurang", wine_focus: "Naturvin", food: true,
    description: "Liten fransk bistro i Vasastan som öppnade 2020 och snabbt blev svår att få bord på. Små rätter, gärna med skaldjur, och naturvin till.",
  },
  {
    slug: "bar-montan-stockholm", name: "Bar Montan", city: "Stockholm", address: "Förbindelsehallen", neighborhood: "Slakthusområdet",
    lat: 59.29235, lng: 18.07872, instagram: "barmontan",
    type: "Restaurang", wine_focus: "Naturvin", food: true,
    description: "Bistro i Förbindelsehallen i Slakthusområdet, öppnad 2023, med säsongsmat i små och stora portioner och naturvin. Industriell lokal med loppisinredning.",
  },
  {
    slug: "woodstockholm-stockholm", name: "Woodstockholm", city: "Stockholm", address: "Mosebacke torg 9", neighborhood: "Södermalm",
    lat: 59.31781, lng: 18.075, website: "https://woodstockholm.com",
    type: "Restaurang", wine_focus: "Naturvin, mest Frankrike och Spanien", food: true,
    description: "Bistro vid Mosebacke torg som också tillverkar möbler, därav namnet. Vinlistan lutar åt Frankrike och Spanien och har gott om naturvin.",
    image: "/barer/woodstockholm-stockholm.jpg", imageApproved: false,
  },
  {
    slug: "gaia-matbar-stockholm", name: "Gaia Matbar", city: "Stockholm", address: "Vattenledningsvägen 44", neighborhood: "Midsommarkransen",
    lat: 59.30247, lng: 18.00881, website: "https://www.gaiamatbar.se", instagram: "gaia_matbar",
    type: "Restaurang", wine_focus: "Naturvin", food: true,
    description: "Nordisk bistro med säsongsmat och globala influenser i Midsommarkransen. Naturvin, noga utvalt, med några mer klassiska flaskor bredvid.",
    image: "/barer/gaia-matbar-stockholm.jpg", imageApproved: false,
  },
  {
    slug: "chewies-bar-stockholm", name: "Chewie's Bar", city: "Stockholm", address: "Norr Mälarstrand 32", neighborhood: "Kungsholmen",
    lat: 59.32687, lng: 18.04304,
    type: "Bar", wine_focus: "Naturvin, hantverksöl och cider", food: true,
    description: "Bar vid vattnet på Norr Mälarstrand med naturvin, hantverksöl och cider och vegansk mat. Hundar är välkomna. Hette tidigare Folk & Friends.",
  },
  {
    slug: "post-bar-stockholm", name: "Post Bar", city: "Stockholm", address: "Nytorget 4", neighborhood: "Södermalm",
    lat: 59.31175, lng: 18.08309,
    type: "Vinbar", wine_focus: "Vin från småskaliga producenter på fat", food: false,
    description: "Vinbaren i Urban Delis lokal vid Nytorget, som serverar vin från småskaliga producenter på fat. Det går att boka provning.",
  },
  {
    slug: "cafe-nizza-stockholm", name: "Café Nizza", city: "Stockholm", address: "Åsögatan 171", neighborhood: "Södermalm",
    lat: 59.31417, lng: 18.08354, website: "https://cafenizza.se",
    type: "Restaurang", wine_focus: "Mest naturvin, några klassiker", food: true,
    description: "Bistro på östra Söder med sydeuropeisk mat. Vinkällaren består till största delen av naturviner, med några klassiska flaskor vid sidan av.",
  },
  {
    slug: "dryck-wine-bar-stockholm", name: "Dryck Vinbar", city: "Stockholm", address: "Swedenborgsgatan 1", neighborhood: "Södermalm",
    lat: 59.31743, lng: 18.0634, website: "https://www.dryckvinbar.se", instagram: "dryckvinbar",
    type: "Vinbar", wine_focus: "Naturvin från mindre producenter", food: true,
    description: "Vinbar vid Mariatorget som började som ekologisk matbutik. Här dricker man naturviner från mindre producenter och äter enkel mat att dela.",
    image: "/barer/dryck-wine-bar-stockholm.jpg", imageApproved: false,
  },
  {
    slug: "grus-grus-stockholm", name: "Grus Grus", city: "Stockholm", address: "Karlbergsvägen 14", neighborhood: "Vasastan",
    lat: 59.34291, lng: 18.04886, website: "https://grusgrusvinbaren.se", instagram: "grus_grus_",
    type: "Vinbar", wine_focus: "Hantverksvin, ekologiskt och naturligt", food: true,
    description: "Vinbaren bredvid restaurang Tranan vid Odenplan. Hantverksviner från småskaliga, ofta ekologiska och naturliga odlare, och mat som följer säsongen.",
    image: "/barer/grus-grus-stockholm.jpg", imageApproved: false,
  },
  {
    slug: "nektar-mat-vin-stockholm", name: "Nektar mat & vin", city: "Stockholm", address: "Rörstrandsgatan 12", neighborhood: "Vasastan",
    lat: 59.34008, lng: 18.03391, website: "https://www.nektarstockholm.com", instagram: "nektar.sthlm",
    type: "Restaurang", wine_focus: "Naturvin till mat från södra Europa", food: true,
    description: "Kvarterskrog vid S:t Eriksplan i Vasastan med ett seriöst vinfokus och mat från Europas södra delar. Råvarorna kommer från småskaliga producenter i närheten, och både mat och vinlista byts ofta. Boka bord eller ta en plats i baren.",
    image: "/barer/nektar-mat-vin-stockholm.jpg", imageApproved: true,
  },
  {
    slug: "agnes-stockholm", name: "Agnes", city: "Stockholm", address: "Norra Agnegatan 43", neighborhood: "Kungsholmen",
    lat: 59.3326, lng: 18.04299, website: "https://restaurangagnes.com", instagram: "restaurang_agnes",
    type: "Restaurang", wine_focus: "Prisbelönt vinlista med naturvin", food: true,
    description: "Bistro på Kungsholmen med smårätter som ostron och chark. Vinlistan har prisats av Star Wine List och har gott om naturvin.",
  },
  {
    slug: "savant-bar-stockholm", name: "Savant", city: "Stockholm", address: "Tegnérgatan 4", neighborhood: "Vasastan",
    lat: 59.34057, lng: 18.06346, website: "https://www.savantbar.se", instagram: "savantbar",
    type: "Vinbar", wine_focus: "Naturvin och säsongsmat", food: true,
    description: "Liten naturvinsbar med ett trettiotal platser och fler än tio viner på glas. Köket lagar säsongsrätter på mest svenska grönsaker, och inredningen är byggd av återbrukat material. Savant importerar också eget naturvin och ordnar varje år en naturvinsfestival i Stockholm. Det går inte att boka bord.",
    image: "/barer/savant-bar-stockholm.jpg", imageApproved: false,
  },
  {
    slug: "tyge-sessil-stockholm", name: "Tyge & Sessil", city: "Stockholm", address: "Brahegatan 4", neighborhood: "Östermalm",
    lat: 59.33707, lng: 18.07555, website: "https://tygesessil.se", instagram: "tygesessil",
    type: "Vinbar", wine_focus: "Naturvin med lite eller inget svavel", food: true,
    description: "Vincafé på Östermalm som kallar sig Stockholms äldsta (nästan) sulfitfria vinbar. Naturliga viner på glas och flaska och enkel mat.",
    image: "/barer/tyge-sessil-stockholm.jpg", imageApproved: false,
  },
  {
    slug: "vina-stockholm", name: "Vina", city: "Stockholm", address: "Sofiagatan 1", neighborhood: "Södermalm",
    lat: 59.31154, lng: 18.08202, website: "https://vinaaa.squarespace.com", instagram: "vinavidgarbostorg",
    type: "Vinbar", wine_focus: "Levande vin från små producenter", food: true,
    description: "Kvarterskrog vid Greta Garbos torg med en vinlista från små producenter och europeiska smårätter. På sommaren tar man glaset ut på torget.",
    image: "/barer/vina-stockholm.jpg", imageApproved: true,
  },
  {
    slug: "bar-ninja-stockholm", name: "Bar Ninja", city: "Stockholm", address: "Katarina Bangata 29", neighborhood: "Södermalm",
    lat: 59.31163, lng: 18.07979, website: "https://barninja.se", instagram: "ninja_bar_",
    type: "Vinbar", wine_focus: "Gott om naturvin", food: true,
    description: "Avslappnad vinbar på Söder med ett stort urval naturviner och en terrass på sommaren.",
  },
  {
    slug: "babette-stockholm", name: "Babette", city: "Stockholm", address: "Roslagsgatan 6", neighborhood: "Vasastan",
    lat: 59.34496, lng: 18.06148, website: "https://babette.se", instagram: "restobabette",
    type: "Restaurang", wine_focus: "Naturvin till bistromat", food: true,
    description: "Liten bistro i Vasastan med enkel matlagning, dagens specialare och en vinlista med många naturviner.",
  },
  {
    slug: "vaxthuset-stockholm", name: "Växthuset", city: "Stockholm", address: "Hammarby Slussväg 2", neighborhood: "Södermalm",
    lat: 59.30444, lng: 18.07379, website: "https://www.restaurangvaxthuset.se", instagram: "restaurangvaxthuset",
    type: "Restaurang", wine_focus: "Biodynamiskt, naturvin och egna fermenteringar", food: true,
    description: "Växtbaserad restaurang vid Skanstull med säsongsmeny. Till maten serveras biodynamiska och naturliga viner och egna fermenterade drycker.",
    image: "/barer/vaxthuset-stockholm.jpg", imageApproved: false,
  },
  {
    slug: "triton-stockholm", name: "Restaurang Triton", city: "Stockholm", address: "Ringvägen 87", neighborhood: "Södermalm",
    lat: 59.3084, lng: 18.06621, website: "https://www.triton.restaurant", instagram: "restaurangtriton",
    type: "Restaurang", wine_focus: "Naturvin till avsmakningsmeny", food: true,
    description: "Bib Gourmand-restaurang på Södermalm med en treråtters meny som byts ofta och bara står på svarta tavlan i restaurangen. Vinlistan har mycket naturvin. Boka gärna i god tid, helgerna kan vara fullbokade en månad framåt.",
  },
  {
    slug: "schmaltz-stockholm", name: "Schmaltz", city: "Stockholm", address: "Nybrogatan 19", neighborhood: "Östermalm",
    lat: 59.33524, lng: 18.07671, website: "https://schmaltz.se", instagram: "schmaltzdelicatessen",
    type: "Delikatess", wine_focus: "Naturvin till deli och bistro", food: true,
    description: "Deli, bar och restaurang ett stenkast från Östermalmstorg, i ett hus från början av 1900-talet. Man kan ta en kaffe i steget, äta lunch eller stanna för några glas vin på kvällen, och naturvin finns på listan.",
  },
  {
    slug: "matbaren-mathias-dahlgren-stockholm", name: "Matbaren Mathias Dahlgren", city: "Stockholm", address: "Södra Blasieholmshamnen 6", neighborhood: "Blasieholmen",
    lat: 59.32932, lng: 18.07622, website: "https://mathiasdahlgren.se/matbaren/", instagram: "bymathiasdahlgren",
    type: "Restaurang", wine_focus: "Naturvin till smårätter", food: true,
    description: "Mathias Dahlgrens matbar på Grand Hôtel, med Bib Gourmand i Michelinguiden. Små rätter från ett kök med mycket grönsaker, och naturvin på glas vid baren.",
    image: "/barer/matbaren-mathias-dahlgren-stockholm.jpg", imageApproved: false,
  },
  {
    slug: "bar-oas-stockholm", name: "Bar Oas", city: "Stockholm", address: "Drottninggatan 73C", neighborhood: "City",
    lat: 59.33265, lng: 18.06263,
    type: "Vinbar", wine_focus: "Naturvin och cava", food: true,
    description: "Liten, hemtrevlig vinbar mitt på Drottninggatan. Naturviner, cava och smårätter i tapasstil, en lugn oas mitt i city.",
  },
  {
    slug: "fabelbar-stockholm", name: "Fabelbar", city: "Stockholm", address: "Hägerstensvägen 132", neighborhood: "Aspudden",
    lat: 59.30567, lng: 18.00058, website: "https://fabelbar.se", instagram: "_fabelbar_",
    type: "Bar", wine_focus: "Naturvin och smårätter", food: true,
    description: "Kvartersbar i Aspudden sedan 2018 med naturvin, drinkar och smårätter. Ett mysigt häng för par och kompisar söder om Liljeholmen.",
  },
  {
    slug: "kakes-kompis-stockholm", name: "Kåkes Kompis", city: "Stockholm", address: "Sjöbjörnsvägen 36", neighborhood: "Gröndal",
    lat: 59.31631, lng: 18.00974, website: "https://www.kakeskompis.se", instagram: "kakeskompis",
    type: "Restaurang", wine_focus: "Naturvin", food: true, opening: "Öppnar snart",
    description: "Ny bistro och café i Gröndal som vill bli ett stammisställe söder om söder, både för en vanlig fredag och för att fira något större. Mat, kaffe och naturvin.",
  },
  {
    slug: "klover-stockholm", name: "Klöver", city: "Stockholm", address: "Rålambsvägen 54", neighborhood: "Fredhäll",
    lat: 59.3303, lng: 18.00316, website: "https://www.klovervinbar.se", instagram: "klovervinbar",
    type: "Vinbar", wine_focus: "Naturvin från mindre franska producenter", food: true,
    description: "Vinbar i hörnet mot Frödingsvägen i Fredhäll, öppnad i slutet av 2025 av paret Suzanna El Khoury och Måns Magnusson. Naturvinerna kommer mest från mindre franska producenter och lutar åt det eleganta snarare än det funkiga. Till det medelhavsinspirerade smårätter. Det går inte att boka bord.",
  },
  {
    slug: "bar-la-lune-goteborg", name: "Bar La Lune", city: "Göteborg", address: "Vasa Kyrkogata 1", neighborhood: "Vasastaden",
    lat: 57.69651, lng: 11.97168, website: "https://barlalune.se", instagram: "barlalune",
    type: "Vinbar", wine_focus: "Handplockat naturvin", food: true,
    description: "Vinbar och restaurang i ett källarvalv i Vasastaden. Handplockad naturvinslista som byts ofta och mat gjord för att passa vinet.",
  },
  {
    slug: "folk-goteborg", name: "Folk", city: "Göteborg", address: "Olof Palmes plats 1", neighborhood: "Järntorget",
    lat: 57.70091, lng: 11.95203, website: "https://folkgbg.se", instagram: "folkgbg",
    type: "Bar", wine_focus: "Naturvin, ostron och livemusik", food: true,
    description: "Bar och restaurang i Folkteaterns foajé vid Järntorget, och en av de första i Göteborg att satsa på naturvin. Ostron, vegetariskt kök och livemusik sent på helgerna.",
    image: "/barer/folk-goteborg.jpg", imageApproved: false,
  },
  {
    slug: "bar-minimal-goteborg", name: "Bar Minimal", city: "Göteborg", address: "Skanstorget 9", neighborhood: "Haga",
    lat: 57.69528, lng: 11.95757, website: "https://www.barminimal.com", instagram: "barminimal",
    type: "Restaurang", wine_focus: "Naturvin till pizza", food: true,
    description: "Neapolitansk pizzeria och naturvinsbar på Skanstorget, i kanten av Haga. Degen jäser långsamt, det som hamnar på pizzan följer säsongen och vinet är naturvin. Det går också att beställa hem.",
  },
  {
    slug: "julie-malmo", name: "Julie", city: "Malmö", address: "Tegelgårdsgatan 9", neighborhood: "Gamla Väster",
    lat: 55.60456, lng: 12.99637, website: "https://juliemalmo.se", instagram: "juliemalmo",
    type: "Vinbar", wine_focus: "Mest naturvin, vin på tapp", food: true,
    description: "Vinbar i ett gammalt hus i kvarteret Druvan i Gamla Väster, öppen sedan 2018. Ett sextontal viner på glas som byts hela tiden, mycket naturvin, pét nat och champagne från odlare, och till det ost, chark utan tillsatser och små säsongsrätter. Det går inte att boka bord.",
    image: "/barer/julie-malmo.jpg", imageApproved: false,
  },
  {
    slug: "ava-vinbar-malmo", name: "Ava Vinbar", city: "Malmö", address: "Karlskronaplan 7", neighborhood: "Sorgenfri",
    lat: 55.59344, lng: 13.01876, website: "https://avavinbar.se", instagram: "avavinbar",
    type: "Vinbar", wine_focus: "Naturvin, ofta nya flaskor", food: true,
    description: "Liten vinbar vid Karlskronaplan på Sorgenfri med naturvin och mellanrätter som burrata, pasta, pinsa och dippar med grillat bröd. Vinlistan byts ofta, så fråga vad de har just nu. Uteservering när vädret tillåter.",
    image: "/barer/ava-vinbar-malmo.jpg", imageApproved: false,
  },
  {
    slug: "far-i-hatten-malmo", name: "Far i Hatten", city: "Malmö", address: "Amiralsgatan 35", neighborhood: "Folkets Park",
    lat: 55.59458, lng: 13.01488, website: "https://www.farihatten.se", instagram: "farihatten",
    type: "Restaurang", wine_focus: "Naturvin till vedugnspizza", food: true,
    description: "Restaurang och bar i en stuga mitt i Folkets Park, öppen året runt och med en stor uteservering. Köket bakar pizza i vedugn och lagar säsongsrätter på råvaror från lokala producenter. Vinerna är främst naturviner, och det finns alltid några på glas.",
    image: "/barer/far-i-hatten-malmo.jpg", imageApproved: false,
  },
  {
    slug: "riket-malmo", name: "Riket", city: "Malmö", address: "Erik Dahlbergsgatan 5", neighborhood: "Davidshall",
    lat: 55.5987, lng: 12.99754, website: "https://riket.net", instagram: "restaurangriket",
    type: "Restaurang", wine_focus: "Merparten naturvin", food: true,
    description: "Restaurang och bar vid Davidshallstorg där merparten av vinerna är naturviner. Maten följer säsongen, från rå fisk till grönsaker från lokala odlare, och stämningen är avslappnad: kom för ett glas eller stanna för middag.",
    image: "/barer/riket-malmo.jpg", imageApproved: false,
  },
  {
    slug: "vinkiosken-orebro", name: "Vinkiosken", city: "Örebro", address: "Järntorgsgatan 4", neighborhood: "Centrum",
    lat: 59.27503, lng: 15.2121, website: "https://vinkiosken.se", instagram: "vinkioskenorebro",
    type: "Vinbar", wine_focus: "Naturvin och sake", food: false,
    description: "Vinbar i centrala Örebro, bakom sushirestaurangen Hachi, med nästan 200 naturviner och sake. Glaslistan byts varje dag, och till vinet finns ostron och snacks.",
    image: "/barer/vinkiosken-orebro.jpg", imageApproved: false,
  },
  {
    slug: "lokal-uppsala", name: "Lokal", city: "Uppsala", address: "Geijersgatan 23A", neighborhood: "Luthagen",
    lat: 59.86147, lng: 17.61776, website: "https://lokalluthagen.se", instagram: "lokalvinbar",
    type: "Vinbar", wine_focus: "Naturvin", food: true,
    description: "Vinbar i hörnet Geijersgatan–Kyrkogårdsgatan i Luthagen, en samlingspunkt för vinälskare i Uppsala. Här ordnas också vinprovningar, och bord går att boka.",
    image: "/barer/lokal-uppsala.jpg", imageApproved: false,
  },
  {
    slug: "la-ruelle-uppsala", name: "La Ruelle", city: "Uppsala", address: "Bredgränd 4", neighborhood: "Centrum",
    lat: 59.85733, lng: 17.64035, website: "https://www.laruelle.se",
    type: "Restaurang", wine_focus: "Naturvin och bra råvaror", food: true,
    description: "Restaurang och vinbar i en gränd i centrala Uppsala, stadens självklara adress för den som gillar naturvin och bra råvaror.",
  },
];

export const citySlug = (city: string) =>
  city.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");

export function getBarsByCity(city: string): Bar[] {
  return bars.filter((b) => b.city.toLowerCase() === city.toLowerCase());
}

export function getBarBySlug(slug: string): Bar | undefined {
  return bars.find((b) => b.slug === slug);
}

export const instagramUrl = (handle: string) => `https://www.instagram.com/${handle}/`;
export const mapsUrl = (b: Pick<Bar, "name" | "address" | "city">) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name}, ${b.address}, ${b.city}`)}`;

/** Webbplatsens namn utan www, som källa under bilden, t.ex. "ambarvinbar.se". */
export const imageSource = (b: Bar) => (b.website ? new URL(b.website).hostname.replace(/^www\./, "") : b.name);
