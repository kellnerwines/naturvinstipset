// Kompassens svar för sökmotorer och AI-agenter: samma poängmotor som chatten,
// men körd på servern, så att svaret finns i HTML och JSON utan JavaScript.
// Används av svarssidorna (/svar/[slug]), /api/kompass och llms.txt.

import type { Wine } from "./blob";
import { pick, relaxMessage, toCompassWine, type CompassWine } from "./compass/engine";
import { paramsToState } from "./compass/url";
import { buyHref } from "./compass/links";

export const SITE = "https://www.naturvinstipset.se";

export type Answer = {
  /** Kompassens parametrar, samma som i den delbara länken. */
  query: Record<string, string>;
  count: number;
  note: string;
  results: {
    rank: number;
    name: string;
    producer: string;
    country: string;
    type: string;
    grape: string;
    vintage: string;
    match: number;
    price: number;
    shop: string;
    alsoAt?: { shop: string; price: number };
    flavour: { syra: number; fyllighet: number; stravhet: number; funk: number };
    tags: string[];
    foodPairing: string;
    ownImport: boolean;
    url: string;
    buyUrl: string;
  }[];
};

/** Kör kompassen på servern för en uppsättning parametrar. */
export function answer(wines: Wine[], params: URLSearchParams | Record<string, string>, limit = 10, source: "guide" | "okand" = "guide"): Answer {
  const p = params instanceof URLSearchParams ? params : new URLSearchParams(params);
  const W = wines.map(toCompassWine).filter((w): w is CompassWine => !!w);
  const { state } = paramsToState(p);
  const r = pick(state, W);
  return {
    query: Object.fromEntries(p.entries()),
    count: r.list.length,
    note: relaxMessage(r.relax, r.budget),
    results: r.list.slice(0, limit).map(({ w, sc }, i) => ({
      rank: i + 1,
      name: w.n,
      producer: w.p,
      country: w.c,
      type: w.t,
      grape: w.g,
      vintage: w.y,
      match: sc,
      price: w.pr,
      shop: w.shop,
      ...(w.alt ? { alsoAt: { shop: w.alt.shop, price: w.alt.pr } } : {}),
      flavour: { syra: w.s, fyllighet: w.f, stravhet: w.st, funk: w.fu },
      tags: w.tags,
      foodPairing: w.foodText,
      ownImport: w.own,
      url: `${SITE}/viner/${w.slug}`,
      buyUrl: SITE + buyHref(w.slug, w.shop, { source, path: "/svar" }),
    })),
  };
}

// ─── Svarssidor: vanliga frågor, var och en med kompassens parametrar ────────

export type AnswerPage = { slug: string; question: string; lead: string; params: Record<string, string> };

export const ANSWER_PAGES: AnswerPage[] = [
  { slug: "naturvin-till-ost", question: "Vilket naturvin passar till ost?", lead: "Till ost vill man ha ett vin med både syra och djup.", params: { mat: "ost" } },
  { slug: "naturvin-till-fisk-och-skaldjur", question: "Vilket naturvin passar till fisk och skaldjur?", lead: "Till fisk och skaldjur letar man efter syra och lite sälta, oftast i ett vitt eller orange vin.", params: { farg: "vitt,orange", mat: "fisk" } },
  { slug: "naturvin-till-kott", question: "Vilket naturvin passar till kött och vilt?", lead: "Till rött kött och vilt får vinet gärna ha lite grepp och kropp.", params: { farg: "rott", mat: "kott" } },
  { slug: "naturvin-till-kyckling", question: "Vilket naturvin passar till kyckling och fågel?", lead: "Fågel öppnar för både vitt, orange och lättare rött.", params: { mat: "fagel" } },
  { slug: "naturvin-till-kryddig-mat", question: "Vilket naturvin passar till kryddig mat?", lead: "Till kryddig mat behövs ett vin som tål hettan och inte är för strävt.", params: { mat: "kryddigt" } },
  { slug: "naturvin-till-vegetariskt", question: "Vilket naturvin passar till vegetarisk mat?", lead: "Till vegetariskt passar viner med jordiga och örtiga toner.", params: { mat: "vego" } },
  { slug: "naturvin-till-chark", question: "Vilket naturvin passar till chark och fläsk?", lead: "Till fläsk och chark vill man ha något saftigt som skär igenom fettet.", params: { mat: "flask" } },
  { slug: "lattdrucket-rott-naturvin", question: "Vilket är ett bra lättdrucket rött naturvin?", lead: "Ett lättdrucket rött är saftigt och svalt med mjuka tanniner, ofta på gamay eller pinot noir.", params: { farg: "rott", fyllighet: "2", smak: "lattsam" } },
  { slug: "billigt-naturvin-under-200-kr", question: "Vilket är ett bra naturvin under 200 kr?", lead: "Det finns fina naturviner under 200 kr, både på Systembolaget och med hemleverans.", params: { budget: "199" } },
  { slug: "naturvin-for-nyborjare", question: "Vilket naturvin passar en nybörjare?", lead: "För den som är ny på naturvin passar viner som smakar som man väntar sig, utan för mycket funk.", params: { aventyr: "1" } },
  { slug: "funkigt-naturvin", question: "Vilket naturvin är riktigt funkigt?", lead: "Vill man ha något vilt letar man bland viner med mycket funk, ofta ofiltrerade och med skalkontakt.", params: { aventyr: "3" } },
  { slug: "basta-orangevin", question: "Vilket orangevin ska man välja?", lead: "Orangevin är vita druvor som fått ligga på skalen, med textur och lite grepp.", params: { farg: "orange" } },
  { slug: "pet-nat-och-bubbel", question: "Vilken pét-nat eller mousserande naturvin ska man välja?", lead: "Pét-nat och andra mousserande naturviner passar som fördrink och till mingel.", params: { farg: "bubbel" } },
  { slug: "naturvin-rose", question: "Vilken rosé ska man välja bland naturvinerna?", lead: "En naturvinsrosé ska vara torr och frisk.", params: { farg: "rose" } },
  { slug: "naturvin-med-hemleverans", question: "Vilket naturvin kan man köpa online med hemleverans?", lead: "Webbutikerna här säljer till Sverige med svensk alkoholskatt inräknad i priset.", params: { butik: "webbutik" } },
  { slug: "naturvin-pa-systembolaget", question: "Vilket naturvin ska man köpa på Systembolaget?", lead: "Bland naturvinerna på Systembolaget finns allt från lättdrucket till riktigt funkigt.", params: { butik: "systembolaget" } },
];

export const answerPage = (slug: string) => ANSWER_PAGES.find((a) => a.slug === slug);

/** Länk till kompassen med samma parametrar, så att man kan finjustera där. */
export const compassLink = (params: Record<string, string>) => `/?${new URLSearchParams(params).toString()}`;
