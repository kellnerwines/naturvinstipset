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
};

/** Städer i den ordning de visas. */
export const CITIES = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Örebro"];

export const bars: Bar[] = [
  {
    slug: "ambar-stockholm", name: "Ambar", city: "Stockholm", address: "Tomtebogatan 22", neighborhood: "Vasastan",
    lat: 59.34148, lng: 18.03211, website: "https://ambarvinbar.se", instagram: "ambarwinebar",
    type: "Vinbar", wine_focus: "Naturvin utan tillsatser, orangevin", food: true,
    description: "Liten vinbar vid S:t Eriksplan som bara serverar naturligt vin utan tillsatser, till japansk husmanskost. Listan har gott om orangevin och viner med skalkontakt.",
  },
  {
    slug: "alba-vinbar-stockholm", name: "Alba Nytorget", city: "Stockholm", address: "Skånegatan 88", neighborhood: "Södermalm",
    lat: 59.31244, lng: 18.08148, website: "https://albavinbar.se", instagram: "alba_nytorget",
    type: "Vinbar", wine_focus: "Naturvin från småskaliga producenter", food: true,
    description: "Vinbar och restaurang vid Nytorget där naturvin från småskaliga producenter står i centrum. Ett avslappnat kvartersställe som passar lika bra för ett glas efter jobbet som för en hel middag.",
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
  },
  {
    slug: "grus-grus-stockholm", name: "Grus Grus", city: "Stockholm", address: "Karlbergsvägen 14", neighborhood: "Vasastan",
    lat: 59.34291, lng: 18.04886, website: "https://grusgrusvinbaren.se", instagram: "grus_grus_",
    type: "Vinbar", wine_focus: "Hantverksvin, ekologiskt och naturligt", food: true,
    description: "Vinbaren bredvid restaurang Tranan vid Odenplan. Hantverksviner från småskaliga, ofta ekologiska och naturliga odlare, och mat som följer säsongen.",
  },
  {
    slug: "nektar-mat-vin-stockholm", name: "Nektar mat & vin", city: "Stockholm", address: "Rörstrandsgatan 12", neighborhood: "Vasastan",
    lat: 59.34008, lng: 18.03391, website: "https://www.nektarstockholm.com", instagram: "nektar.sthlm",
    type: "Restaurang", wine_focus: "Naturvin till vegetarisk mat", food: true,
    description: "Liten restaurang och vinbar vid S:t Eriksplan. Medelhavsinspirerad, mest vegetarisk mat och ett brett urval naturviner.",
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
    description: "Liten naturvinsbar med ett trettiotal platser. Kaffe på dagen och naturvin med säsongsbetonade smårätter på kvällen.",
  },
  {
    slug: "tyge-sessil-stockholm", name: "Tyge & Sessil", city: "Stockholm", address: "Brahegatan 4", neighborhood: "Östermalm",
    lat: 59.33707, lng: 18.07555, website: "https://tygesessil.se", instagram: "tygesessil",
    type: "Vinbar", wine_focus: "Naturvin med lite eller inget svavel", food: true,
    description: "Vincafé på Östermalm som kallar sig Stockholms äldsta (nästan) sulfitfria vinbar. Naturliga viner på glas och flaska och enkel mat.",
  },
  {
    slug: "vina-stockholm", name: "Vina", city: "Stockholm", address: "Sofiagatan 1", neighborhood: "Södermalm",
    lat: 59.31154, lng: 18.08202, website: "https://vinaaa.squarespace.com", instagram: "vinavidgarbostorg",
    type: "Vinbar", wine_focus: "Levande vin från små producenter", food: true,
    description: "Kvarterskrog vid Greta Garbos torg med en vinlista från små producenter och europeiska smårätter. På sommaren tar man glaset ut på torget.",
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
  },
  {
    slug: "triton-stockholm", name: "Restaurang Triton", city: "Stockholm", address: "Ringvägen 87", neighborhood: "Södermalm",
    lat: 59.3084, lng: 18.06621, website: "https://www.triton.restaurant", instagram: "restaurangtriton",
    type: "Restaurang", wine_focus: "Naturvin till avsmakningsmeny", food: true,
    description: "Bib Gourmand-restaurang på Södermalm med en treråtters meny som byts ofta och en vinlista med mycket naturvin.",
  },
  {
    slug: "schmaltz-stockholm", name: "Schmaltz", city: "Stockholm", address: "Nybrogatan 19", neighborhood: "Östermalm",
    lat: 59.33524, lng: 18.07671, website: "https://schmaltz.se", instagram: "schmaltzdelicatessen",
    type: "Delikatess", wine_focus: "Naturvin till deli och bistro", food: true,
    description: "Bar, restaurang och delikatessbutik på Östermalm, med naturvin på listan.",
  },
  {
    slug: "matbaren-mathias-dahlgren-stockholm", name: "Matbaren Mathias Dahlgren", city: "Stockholm", address: "Södra Blasieholmshamnen 6", neighborhood: "Blasieholmen",
    lat: 59.32932, lng: 18.07622, website: "https://mathiasdahlgren.se/matbaren/", instagram: "bymathiasdahlgren",
    type: "Restaurang", wine_focus: "Naturvin till smårätter", food: true,
    description: "Mathias Dahlgrens matbar på Grand Hôtel, med Bib Gourmand i Michelinguiden. Små rätter från ett kök med mycket grönsaker, och naturvin på glas vid baren.",
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
  },
  {
    slug: "bar-minimal-goteborg", name: "Bar Minimal", city: "Göteborg", address: "Skanstorget 9", neighborhood: "Haga",
    lat: 57.69528, lng: 11.95757, website: "https://www.barminimal.com", instagram: "barminimal",
    type: "Restaurang", wine_focus: "Naturvin till pizza", food: true,
    description: "Neapolitansk pizza och naturvin på Skanstorget, i kanten av Haga.",
  },
  {
    slug: "julie-malmo", name: "Julie", city: "Malmö", address: "Tegelgårdsgatan 9", neighborhood: "Gamla Väster",
    lat: 55.60456, lng: 12.99637, website: "https://juliemalmo.se", instagram: "juliemalmo",
    type: "Vinbar", wine_focus: "Mest naturvin, vin på tapp", food: true,
    description: "Vinbar i Gamla Väster där det mesta på listan är naturvin. Många glas på tapp och en vitrin med ost och chark.",
  },
  {
    slug: "ava-vinbar-malmo", name: "Ava Vinbar", city: "Malmö", address: "Karlskronaplan 7", neighborhood: "Sorgenfri",
    lat: 55.59344, lng: 13.01876, website: "https://avavinbar.se", instagram: "avavinbar",
    type: "Vinbar", wine_focus: "Naturvin, ofta nya flaskor", food: true,
    description: "Liten naturvinsbar vid Karlskronaplan med en vinlista som byts ofta.",
  },
  {
    slug: "far-i-hatten-malmo", name: "Far i Hatten", city: "Malmö", address: "Amiralsgatan 35", neighborhood: "Folkets Park",
    lat: 55.59458, lng: 13.01488, website: "https://www.farihatten.se", instagram: "farihatten",
    type: "Restaurang", wine_focus: "Naturvin till vedugnspizza", food: true,
    description: "Restaurang i Folkets Park med vedugnspizza. Vinerna är främst naturviner, och det finns alltid några på glas.",
  },
  {
    slug: "riket-malmo", name: "Riket", city: "Malmö", address: "Erik Dahlbergsgatan 5", neighborhood: "Davidshall",
    lat: 55.5987, lng: 12.99754, website: "https://riket.net", instagram: "restaurangriket",
    type: "Restaurang", wine_focus: "Merparten naturvin", food: true,
    description: "Restaurang och bar vid Davidshallstorg där merparten av vinerna är naturviner och maten följer säsongen.",
  },
  {
    slug: "vinkiosken-orebro", name: "Vinkiosken", city: "Örebro", address: "Järntorgsgatan 4", neighborhood: "Centrum",
    lat: 59.27503, lng: 15.2121, website: "https://vinkiosken.se", instagram: "vinkioskenorebro",
    type: "Vinbar", wine_focus: "Naturvin och sake", food: false,
    description: "Vinbar bakom sushirestaurangen Hachi med fokus på naturvin och sake av hög kvalitet.",
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
