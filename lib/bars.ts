export type BarType = "Vinbar" | "Restaurang" | "Delikatess" | "Bar";
export type PriceLevel = "$" | "$$" | "$$$";

export type Bar = {
  slug: string;
  name: string;
  city: string;
  country: string;
  address: string;
  neighborhood: string;
  lat: number;
  lng: number;
  website?: string;
  instagram?: string;
  type: BarType;
  wine_focus: string;
  food: boolean;
  price_level: PriceLevel;
  glass_pours: boolean;
  recommended_for: string;
  our_review: string;
  description: string;
  faq_is_good: string;
  faq_glass_pours: string;
  faq_booking: string;
};

// Coordinates are approximate and should be verified before use in production maps
export const bars: Bar[] = [
  {
    slug: "ambar-stockholm",
    name: "Ambar",
    city: "Stockholm",
    country: "SE",
    address: "Tomtebogatan 22",
    neighborhood: "Vasastan",
    lat: 59.3376,
    lng: 18.049,
    type: "Restaurang",
    wine_focus: "Orange vin, skalkontakt",
    food: true,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Orangevinsentusiaster, avkvällsmiddagar",
    our_review:
      "Ambar är ett måste för dig som vill utforska orangevin på allvar. Kombinationen japansk husmanskost och genomtänkta naturviner är unik i Stockholm — hit går man inte av misstag, man går dit med avsikt.",
    description:
      "Ambar är Stockholms hetaste destination för orangevin kombinerat med japansk husmanskost. I en intim lokal på Tomtebogatan i Vasastan serverar de naturviner med fokus på skalkontakt och oxidativa stilar. Vinklistan byts regelbundet och matchar kökets eklektiska karaktär.",
    faq_is_good:
      "Ja. Ambar är ett av Stockholms bästa ställen för orangevin och naturvin med ambitiös mat. Kombinationen japansk husmanskost och noga utvalda naturviner från småskaliga producenter gör det till en av stadens mest intressanta restauranger.",
    faq_glass_pours:
      "Ja, Ambar serverar naturvin på glas med ett urval som roterar löpande. Fokus ligger på orangeviner och oxidativa stilar.",
    faq_booking:
      "Bokning rekommenderas starkt, särskilt helger. Lokalen är liten och populär — boka i god tid via deras hemsida eller telefon.",
  },
  {
    slug: "alba-vinbar-stockholm",
    name: "Alba Vinbar",
    city: "Stockholm",
    country: "SE",
    address: "Skånegatan 88",
    neighborhood: "Södermalm",
    lat: 59.3162,
    lng: 18.0734,
    type: "Vinbar",
    wine_focus: "Naturviner, bred stil",
    food: true,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Nybörjare, after work, sällskap",
    our_review:
      "Alba är den typ av vinbar som får Stockholm att kännas som en riktig vistad. Nära Nytorget, varm service och en lista som blandar tillgänglighet med nyfikenhet. Passar lika bra för förstagångsnaturvinsdrinkaren som för den inbitne.",
    description:
      "Alba Vinbar på Skånegatan nära Nytorget är en av Södermalms mest omtyckta naturvinsbarer. Med en curatad lista på naturviner, avslappnad hip-hop i bakgrunden och varm service har de lyckats skapa en plats som passar både vinentusiaster och nyfikna nybörjare.",
    faq_is_good:
      "Ja, Alba Vinbar är en av Södermalms bästa naturvinsbarer. Atmosfären är välkomnande, servicen kunnig och vinklistan rymmer allt från tillgängliga friska naturviner till mer utmanande stilar.",
    faq_glass_pours:
      "Ja, Alba serverar ett väluttänkt urval av naturviner på glas. Personalen hjälper gärna till att navigera listan.",
    faq_booking:
      "Walk-in fungerar ofta, men på helgkvällar kan det vara kö. Bokning rekommenderas för större sällskap.",
  },
  {
    slug: "cafe-nizza-stockholm",
    name: "Café Nizza",
    city: "Stockholm",
    country: "SE",
    address: "Åsögatan 171",
    neighborhood: "Södermalm",
    lat: 59.3146,
    lng: 18.0793,
    type: "Restaurang",
    wine_focus: "Franska naturviner, Sydeuropa",
    food: true,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Middagar, frankofile, vinkvällar",
    our_review:
      "Café Nizza är det närmaste Stockholm kommer en riktig parisisk bistro — med det tillägget att vinklistan är mer naturvinsmedveten än de flesta restauranger i Paris. Köket och glaset hänger ihop på ett sätt som känns genomtänkt.",
    description:
      "Café Nizza är en modern bistro på östra Södermalm med ett av stadens starkaste naturfokus. Köket serverar franska bistrorätter med säsongsbetonade råvaror, och vinkistan är noga utvald med fokus på naturviner från Frankrike och Sydeuropa.",
    faq_is_good:
      "Ja. Café Nizza kombinerar bistromat av hög klass med en av Stockholms mest genomtänkta naturvinslistor. Det är ett utmärkt alternativ för en hel kväll med mat och vin.",
    faq_glass_pours:
      "Ja, Café Nizza har naturvin på glas med ett roterande urval som speglar kökets franska och sydeuropeiska inriktning.",
    faq_booking:
      "Bokning rekommenderas för middag, särskilt torsdag–lördag. Kom tidigt för en spontan drink i baren.",
  },
  {
    slug: "dryck-wine-bar-stockholm",
    name: "Dryck Wine Bar",
    city: "Stockholm",
    country: "SE",
    address: "Swedenborgsgatan 1",
    neighborhood: "Södermalm",
    lat: 59.3178,
    lng: 18.0631,
    type: "Vinbar",
    wine_focus: "Brett urval naturviner",
    food: false,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Vinälskare, provning, spontan kväll",
    our_review:
      "Dryck gör exakt vad namnet antyder — fokus på drycken. Breda listan, kunnig personal och ett läge vid Mariatorget som gör det lätt att stanna längre än planerat. En av stadens bästa adresser för den som vill utforska naturvin på allvar.",
    description:
      "Dryck är en dedikerad naturvinsbar vid Mariatorget på Södermalm med ett av Stockholms bredaste urval av naturviner på glas. Barens avskalade interiör låter vinerna stå i centrum, och personalen är kunnig och välkomnande för allt från nybörjare till erfarna drinkare.",
    faq_is_good:
      "Ja, Dryck Wine Bar är en av Södermalms bästa och mest dedikerade naturvinsbarer. Det breda urvalet på glas och den kunniga personalen gör det till ett utmärkt ställe att utforska naturvin.",
    faq_glass_pours:
      "Ja — det är Drycks styrka. Urvalet på glas är ett av de bredaste i Stockholm och roterar löpande.",
    faq_booking:
      "Ingen bokning behövs — det är en bar. Kom som du är, men förvänta dig kö på populära kvällar.",
  },
  {
    slug: "grus-grus-stockholm",
    name: "Grus Grus",
    city: "Stockholm",
    country: "SE",
    address: "Karlbergsvägen 14",
    neighborhood: "Vasastan",
    lat: 59.3418,
    lng: 18.034,
    type: "Vinbar",
    wine_focus: "Småskaliga producenter, hantverk",
    food: true,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Vinentusiaster, kvällsprovning",
    our_review:
      "Grus Grus är för den som vill gå ett steg djupare. Fokuset på småskaliga producenter och tydlig kunskapsförmedling gör det till en av Vasastans mest seriösa naturvinsadresser. Perfekt i kombination med middagen ovanpå på Tranan.",
    description:
      "Grus Grus är vinbaren som huserar i Tranans lokaler på Karlbergsvägen i Vasastan. Med fokus på småskaliga producenter och hantverk har de byggt upp ett rykte som en av stadens mest seriösa naturvinsdestinationers. Kunskapen bakom baren är genuin.",
    faq_is_good:
      "Ja. Grus Grus är en av Vasastans bästa vinbarer med ett tydligt fokus på naturvin från småskaliga producenter. Kunnig personal och ett roterande urval gör det till ett ställe att återkomma till.",
    faq_glass_pours:
      "Ja, Grus Grus erbjuder ett väluttänkt urval naturviner på glas med fokus på hantverk och småproducenter.",
    faq_booking:
      "Ingen bokning krävs för vinbaren. För middag på Tranan rekommenderas bokning.",
  },
  {
    slug: "nektar-mat-vin-stockholm",
    name: "Nektar mat & vin",
    city: "Stockholm",
    country: "SE",
    address: "Rörstrandsgatan 12",
    neighborhood: "Vasastan",
    lat: 59.3408,
    lng: 18.0367,
    type: "Restaurang",
    wine_focus: "Naturvin, säsongsmat",
    food: true,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Middagar i lugn miljö, naturvinsnybörjare",
    our_review:
      "Nektar är den restaurang som bevisar att naturvin inte behöver vara krångligt eller elitistiskt. Liten, personlig och med en vinkarta som matchar maten på ett naturligt sätt. En av Vasastans bästa kvarterskrogar.",
    description:
      "Nektar är en liten, intim restaurang på Rörstrandsgatan i Vasastan med ett tydligt fokus på naturvin och säsongsanpassad mat. Stämningen är avslappnad och personlig — en typisk kvarterskrog med ambition och en vinkarta som tas på allvar.",
    faq_is_good:
      "Ja. Nektar är en av Vasastans bästa restauranger för naturvin — personlig, välkomnande och med ett genomtänkt urval som passar både nybörjare och erfarna drickare.",
    faq_glass_pours:
      "Ja, Nektar serverar naturvin på glas med ett urval som matchar kökets säsongsbetonade karaktär.",
    faq_booking:
      "Bokning rekommenderas, särskilt helger. Lokalen är liten och populär.",
  },
  {
    slug: "agnes-stockholm",
    name: "Agnes",
    city: "Stockholm",
    country: "SE",
    address: "Norra Agnegatan 43",
    neighborhood: "Kungsholmen",
    lat: 59.3323,
    lng: 18.0505,
    type: "Restaurang",
    wine_focus: "Naturvin, sydeuropeiskt",
    food: true,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Middagar, Kungsholmsbor, sydeuropeisk mat",
    our_review:
      "Agnes fyller ett viktigt hål på Kungsholmen — en restaurang som kombinerar kärlek till sydeuropeisk matlagning med ett seriöst naturvinsfokus. Kvarterskrogsatmosfären är genuint välkomnande.",
    description:
      "Agnes är en omtyckt kvarterskrog på Kungsholmen med sydeuropeiska specialiteter och ett väluttänkt urval av naturviner. Den lilla lokalen på Norra Agnegatan kombinerar en avslappnad atmosfär med seriös mat och dryck — ett naturligt val för Kungsholmsborna.",
    faq_is_good:
      "Ja. Agnes är en av Kungsholmens bästa restauranger för naturvin och sydeuropeisk mat. Kombinationen är välmatchad och atmosfären genuin.",
    faq_glass_pours:
      "Ja, Agnes serverar naturvin på glas med ett urval som matchar den sydeuropeiska kökskaraktären.",
    faq_booking:
      "Bokning rekommenderas för middag. Walk-in kan fungera i baren för en spontan glass.",
  },
  {
    slug: "savant-bar-stockholm",
    name: "Savant Bar",
    city: "Stockholm",
    country: "SE",
    address: "Tegnérgatan 4",
    neighborhood: "Vasastan",
    lat: 59.3372,
    lng: 18.0532,
    type: "Vinbar",
    wine_focus: "Naturvin, roterande inköp",
    food: true,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Nyfikna, regelbundna besökare, vinsamlare",
    our_review:
      "Savant utmärker sig genom den ständigt levande vinklistan — nytt inköp varje vecka innebär att det alltid finns anledning att komma tillbaka. En av Vasastans mest dynamiska naturvinsadresser.",
    description:
      "Savant är en dedikerad naturvinsbar på Tegnérgatan i Vasastan som utmärker sig genom att ta in nytt inköp varje vecka. Det innebär att vinklistan alltid är levande och att stamgästerna ständigt har något nytt att utforska — aldrig samma bar besök efter besök.",
    faq_is_good:
      "Ja. Savant Bar är en av Vasastans mest dynamiska naturvinsbarer. Det roterande urvalet med nytt inköp varje vecka gör det till ett ständigt intressant besöksmål för naturvinsälskare.",
    faq_glass_pours:
      "Ja, och det är just det som gör Savant speciellt — urvalet på glas förändras löpande med veckans nya inköp.",
    faq_booking:
      "Ingen bokning behövs. Det är en bar — kom som du är.",
  },
  {
    slug: "tyge-sessil-stockholm",
    name: "Tyge & Sessil",
    city: "Stockholm",
    country: "SE",
    address: "Brahegatan 4",
    neighborhood: "Östermalm",
    lat: 59.3357,
    lng: 18.0799,
    type: "Vinbar",
    wine_focus: "Naturvin, hantverksviner",
    food: true,
    price_level: "$$$",
    glass_pours: true,
    recommended_for: "Östermalmsbesök, datum, avslappnad lyx",
    our_review:
      "Tyge & Sessil bevisar att naturvin hör hemma på Östermalm lika väl som i Vasastan. Avspänd atmosfär, kunnig personal och ett urval som inte kompromissar — ett ovanligt och välkommet alternativ nära Stureplan.",
    description:
      "Tyge & Sessil är en avspänd vinbar på Brahegatan nära Stureplan i Östermalm — ett ovanligt naturvinsvänligt alternativ i en stadsdel mer känd för klassiska viner. Den lilla lokalen rymmer en genomtänkt vinkarta med fokus på hantverksviner och småskaliga producenter.",
    faq_is_good:
      "Ja. Tyge & Sessil är ett av de bästa ställena för naturvin på Östermalm — avspänt, kunnigt och med ett urval som faktiskt intresserar vinentusiaster.",
    faq_glass_pours:
      "Ja, Tyge & Sessil har ett roterande urval naturviner på glas med fokus på hantverksviner.",
    faq_booking:
      "Walk-in fungerar ofta, men bokning rekommenderas på helgkvällar för att säkra bord.",
  },
  {
    slug: "matbaren-mathias-dahlgren-stockholm",
    name: "Matbaren Mathias Dahlgren",
    city: "Stockholm",
    country: "SE",
    address: "Södra Blasieholmshamnen 6",
    neighborhood: "Blasieholmen",
    lat: 59.3297,
    lng: 18.0744,
    type: "Restaurang",
    wine_focus: "Skandinaviska och europeiska hantverksviner",
    food: true,
    price_level: "$$$",
    glass_pours: true,
    recommended_for: "Speciella tillfällen, besökare i Stockholm, lyx",
    our_review:
      "Matbaren är en lektion i hur naturvin kan integreras i ett Michelin-kök utan att tappa sin karaktär. Platsen är legendarisk, maten exceptionell och vinklistan matchar ambitionen. För speciella tillfällen.",
    description:
      "Matbaren på Grand Hotel är en av Stockholms mest legendariska bistromiljöer, belägen vid Blasieholmshamnen med utsikt mot Gamla Stan och Kungliga slottet. Naturviner har funnit sin plats på den välkurerade vinklistan som sätter skandinaviska och europeiska hantverksviner i centrum.",
    faq_is_good:
      "Ja — om budget tillåter. Matbaren kombinerar Michelin-klass med en vinkarta som tar naturvin på allvar. Det är en av Stockholms mest kompletta matupplevelser.",
    faq_glass_pours:
      "Ja, Matbaren serverar ett genomtänkt urval hantverksviner och naturviner på glas.",
    faq_booking:
      "Bokning är nästan nödvändig, särskilt för middag. Boka i god tid — detta är ett av Stockholms mest eftertraktade bord.",
  },
  {
    slug: "tranan-stockholm",
    name: "Tranan",
    city: "Stockholm",
    country: "SE",
    address: "Karlbergsvägen 14",
    neighborhood: "Vasastan",
    lat: 59.3418,
    lng: 18.034,
    type: "Restaurang",
    wine_focus: "Naturvin, klassisk svensk krog",
    food: true,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Klassisk Stockholmsupplevelse, middagar, grupper",
    our_review:
      "Tranan är en institution — och det faktum att naturviner hittat sin naturliga plats på vinklistan sedan 1929 är ett tecken på en krog som aldrig slutar utvecklas. Kom hit för hela paketet: mat, dryck, atmosfär och historia.",
    description:
      "Tranan är en av Stockholms älskade klassiker — en krog som funnits sedan 1929 på Karlbergsvägen i Vasastan. Naturviner har kommit att bli en allt större del av vinklistan, och stammisarna blandar sig med vinentusiaster som söker sig hit för den unika kombinationen av tradition och modernitet.",
    faq_is_good:
      "Ja. Tranan är en Stockholmsklassiker som framgångsrikt anammat naturvinstrenden. Kombinationen klassisk krogkänsla och en uppdaterad vinkarta gör det till ett tryggt val.",
    faq_glass_pours:
      "Ja, Tranan serverar ett väluttänkt urval viner på glas, inklusive naturviner.",
    faq_booking:
      "Bokning rekommenderas för middag, men baren är ofta mer flexibel för spontana besök.",
  },
  {
    slug: "vina-stockholm",
    name: "VINA",
    city: "Stockholm",
    country: "SE",
    address: "Sofiagatan 1",
    neighborhood: "Södermalm",
    lat: 59.3148,
    lng: 18.0679,
    type: "Vinbar",
    wine_focus: "Småproducenter, personlig curation",
    food: true,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Lokalbor, avslappnat, spontan kväll",
    our_review:
      "VINA är Södermalms hemliga pärla vid Garbos torg — liten, personlig och med en lista som visar att det finns ett genuint intresse bakom urvalet. Hit går man för att koppla av med ett glas och kanske hitta ett nytt favoritvin.",
    description:
      "VINA är en mysig vinbar vid Garbos torg på Södermalm med fokus på småproducenter och personlig service. Den lilla lokalen på Sofiagatan har snabbt blivit ett stamhål för Södermalms naturvinsälskare tack vare en curatad lista och en atmosfär som känns som en förlängning av vardagsrummet.",
    faq_is_good:
      "Ja. VINA är en av de mest personliga naturvinsbarerna på Södermalm. Urvalet är genomtänkt och känslan genuint välkomnande.",
    faq_glass_pours:
      "Ja, VINA serverar naturvin på glas med ett urval som fokuserar på småskaliga och personliga producenter.",
    faq_booking:
      "Walk-in fungerar som regel. Det är en liten bar, så kom tidigt om du vill ha sittplats.",
  },
  {
    slug: "bar-oas-stockholm",
    name: "Bar Oas",
    city: "Stockholm",
    country: "SE",
    address: "Drottninggatan 73c",
    neighborhood: "City",
    lat: 59.3376,
    lng: 18.0644,
    type: "Bar",
    wine_focus: "Naturvin, brett urval",
    food: false,
    price_level: "$",
    glass_pours: true,
    recommended_for: "Spontant, nybörjare, city-besök",
    our_review:
      "Bar Oas är beviset på att bra naturvin inte kräver hippa stadsdelen eller hög prislapp. Mitt i city på Drottninggatan, liten, mysig och med ett vinsurval som överraskar positivt. En underskattad adress.",
    description:
      "Bar Oas är en liten och mysig bar mitt i city på Drottninggatan med ett överraskande bra naturvinsurval. Perfekt för en spontan glass mitt i shoppingtrakten eller direkt efter jobbet — utan att behöva planera eller boka.",
    faq_is_good:
      "Ja, och framförallt ovanligt prisvärdt för en city-bar. Bar Oas är ett bra alternativ för spontana besök med ett naturvinsurval som är bättre än man förväntar sig.",
    faq_glass_pours:
      "Ja, Bar Oas har naturvin på glas till ett av stadens mer tillgängliga priser.",
    faq_booking:
      "Ingen bokning krävs. Det är en bar — kom som du är.",
  },
  {
    slug: "fabelbar-stockholm",
    name: "Fabelbar",
    city: "Stockholm",
    country: "SE",
    address: "Hägerstensvägen 132",
    neighborhood: "Hägersten",
    lat: 59.3028,
    lng: 17.999,
    type: "Vinbar",
    wine_focus: "Naturvin, lokal favorit",
    food: true,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Hägersten/Liljeholmen-bor, lugn kväll",
    our_review:
      "Fabelbar är det bästa argumentet för att naturvinsintresset har spridit sig bortom de hypade stadsdelarna. En gemytlig och välkomnande vinbar i Hägersten som förtjänar mer uppmärksamhet än den får.",
    description:
      "Fabelbar är ett gemytligt alternativ för sydvästra Stockholm, belägen på Hägerstensvägen i Hägersten. Barens avslappnade atmosfär och välvalda naturvinsurval har gjort det till ett lokalt favorithängställe — en påminnelse om att de bästa naturvinsbarerna inte alltid finns på kartan.",
    faq_is_good:
      "Ja. Fabelbar är en av de bättre naturvinsbarerna utanför innerstaden och en viktig lokal samlingsplats i Hägersten.",
    faq_glass_pours:
      "Ja, Fabelbar serverar ett väluttänkt urval naturviner på glas.",
    faq_booking:
      "Walk-in fungerar i de flesta fall. Bokning kan vara klokt för helgkvällar.",
  },
  {
    slug: "stockholm-ost-chark",
    name: "Stockholm Ost & Chark",
    city: "Stockholm",
    country: "SE",
    address: "Renstiernas gata 27",
    neighborhood: "Södermalm",
    lat: 59.3138,
    lng: 18.0771,
    type: "Delikatess",
    wine_focus: "Naturvin till ost och chark",
    food: true,
    price_level: "$$",
    glass_pours: true,
    recommended_for: "Ostvänner, inköp och glass, spontant på Söder",
    our_review:
      "Stockholm Ost & Chark är Södermalms bästa argument för att kombinera inköp med en spontan glass. Naturvinerna är utvalda för att matcha ostarna och charkutererna — och det märks. Kom för att handla, stanna för ett glas.",
    description:
      "Stockholm Ost & Chark på Renstiernas gata är Södermalms favoritdelikatessbutik som även fungerar som bar. Kombinationen exceptionella ostar, charkuterier och naturviner på glas gör det till ett perfekt stopp — för inköp, för en spontan glass eller för båda på en gång.",
    faq_is_good:
      "Ja, och det är ett unikt koncept i Stockholm. Stockholm Ost & Chark kombinerar delikatessbutik och naturvinsbar på ett sätt som matchar utmärkt — ostar och naturvin hör ihop.",
    faq_glass_pours:
      "Ja, Stockholm Ost & Chark serverar naturvin på glas, noggrant utvalt för att matcha ostar och charkuterier.",
    faq_booking:
      "Ingen bokning krävs — det är en butik och bar. Walk-in välkomnas.",
  },
];

export function getBarsByCity(city: string): Bar[] {
  return bars.filter((b) => b.city.toLowerCase() === city.toLowerCase());
}

export function getBarBySlug(slug: string): Bar | undefined {
  return bars.find((b) => b.slug === slug);
}

export function getCities(): string[] {
  return [...new Set(bars.map((b) => b.city))];
}
