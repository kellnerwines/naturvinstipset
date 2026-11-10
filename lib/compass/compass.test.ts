import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import type { Wine } from "../blob";
import { buildCatalog, type FoodEntry } from "../wineData";
import {
  emptyState, pick, relaxMessage, score, toCompassWine, QUESTIONS,
  type CompassState, type CompassWine, type QuestionKey,
} from "./engine";
import { applyParsed, missingTail, parse, reflect, understood } from "./parse";
import { paramsToState, stateToParams } from "./url";

const load = <T,>(f: string): T => JSON.parse(readFileSync(path.join(__dirname, "..", "..", "data", f), "utf-8"));
const { wines } = buildCatalog({
  existing: [],
  systembolaget: load<Wine[]>("wines.json"),
  food: load<Record<string, FoodEntry>>("food-systembolaget.json"),
  imports: [
    { wines: load<Wine[]>("wines-vinnatur.json"), source: { source: "vinnatur.shop", autoProfile: true } },
    { wines: load<Wine[]>("wines-flaskvis.json"), source: { source: "flaskvis.se", autoProfile: false } },
  ],
  now: "2026-11-09T00:00:00.000Z",
});
const W = wines.map(toCompassWine).filter((w): w is CompassWine => !!w);

const cw = (p: Partial<CompassWine>): CompassWine => ({
  id: "x", slug: "x", n: "X", p: "P", c: "Portugal", g: "Baga", t: "Rött", y: "2023", pr: 200,
  s: 3, f: 3, st: 3, fu: 2, tags: [], food: [], foodText: "", rt: 4, own: false, auto: false,
  shop: "Systembolaget", url: "https://example.com", ...p,
});
const state = (p: Partial<CompassState>): CompassState => ({ ...emptyState(), ...p });

describe("toCompassWine", () => {
  it("tar med alla publicerade viner med säljställe", () => {
    expect(W).toHaveLength(wines.filter((w) => w.published).length);
  });
  it("döljer viner utan något säljställe i lager", () => {
    const w = wines[0];
    expect(toCompassWine({ ...w, offers: w.offers!.map((o) => ({ ...o, inStock: false })), systembolagetUrl: undefined })).toBeNull();
    expect(toCompassWine({ ...w, published: false })).toBeNull();
  });
  it("visar andra säljstället som alt", () => {
    const w = wines.find((x) => x.slug === "saroto-palhete-2024")!;
    const c = toCompassWine({ ...w, offers: [...w.offers!, { shop: "Flaskvis", url: "https://f/s", price: 229, inStock: true, lastSyncedAt: "" }] })!;
    expect(c.shop).toBe("Systembolaget");
    expect(c.alt).toEqual({ shop: "Flaskvis", url: "https://f/s", pr: 229 });
  });
  it("ger viner utan admin-betyg neutralt betyg 4", () => {
    expect(W.find((w) => w.slug.startsWith("vn-"))!.rt).toBe(4);
  });
});

describe("poängmotorn", () => {
  it("egen import ger ingen poängfördel", () => {
    const S = state({ adv: "2", tags: ["Fruktig", "Mineralisk"], food: ["fisk"], ax: { s: 4, f: 2, st: 0, fu: 0 } });
    for (const w of W.slice(0, 80)) {
      expect(score({ ...w, own: true }, S, W).sc, w.slug).toBe(score({ ...w, own: false }, S, W).sc);
    }
  });

  it("räknar enligt tabellen", () => {
    const w = cw({ fu: 4, s: 3, tags: ["Mineralisk", "Fruktig"], food: ["fisk", "aperitif"], rt: 5 });
    // äventyr 1 → mål 1,5: −12·2,5 = −30; syra mål 5: −20; smak: +6 (Miner) −6 (Blommig); rt 5: +3
    expect(score(w, state({ adv: "1", ax: { s: 5, f: 0, st: 0, fu: 0 }, tags: ["Mineralisk", "Blommig"] }), [w]).sc).toBe(53);
    // mat: +5 per träff, "bara dricka" + aperitif: +4
    expect(score(w, state({ food: ["none"], dfood: ["fisk"] }), [w]).sc).toBe(99);
    expect(score(cw({ rt: 1 }), state({}), []).sc).toBe(91);
  });

  it("smaktaggar matchar på prefix", () => {
    const w = cw({ tags: ["Friskt"] });
    expect(score(w, state({ tags: ["Frisk"] }), [w]).hits).toContain("Frisk");
  });

  it("likt vin drar av för profilavstånd och ger plus för delade taggar", () => {
    const L = cw({ id: "L", n: "Ref", s: 4, f: 2, st: 1, fu: 1, tags: ["Frisk"] });
    const a = cw({ id: "a", s: 4, f: 2, st: 1, fu: 2, tags: ["Frisk"] });
    const r = score(a, state({ like: "L" }), [L, a]);
    expect(r.sc).toBe(97); // −7 + 4
    expect(r.hits).toContain("Likt Ref");
  });

  it("filtrerar på färg, budget och mat", () => {
    const { list, relax } = pick(state({ color: ["Vitt"], budget: "299", food: ["fisk"] }), W);
    expect(relax).toEqual([]);
    expect(list.length).toBeGreaterThanOrEqual(3);
    for (const { w } of list) {
      expect(w.t).toBe("Vitt");
      expect(w.pr).toBeLessThanOrEqual(299);
      expect(w.food).toContain("fisk");
    }
  });

  it("släpper filter i ordningen druva, land, butik … och färg bara vid 0 träffar", () => {
    const X = [
      cw({ id: "1", t: "Rött", c: "Portugal", g: "Baga" }),
      cw({ id: "2", t: "Rött", c: "Frankrike", g: "Gamay" }),
      cw({ id: "3", t: "Rött", c: "Frankrike", g: "Gamay" }),
      cw({ id: "4", t: "Vitt", c: "Frankrike", g: "Chenin" }),
    ];
    // 0 träffar → druva släpps (1 träff) → land släpps (3 träffar)
    const a = pick(state({ color: ["Rött"], country: "Portugal", grape: "Gamay" }), X);
    expect(a.relax).toEqual(["grape", "country"]);
    expect(a.list).toHaveLength(3);
    // två röda finns, så färgen släpps inte trots < 3 träffar
    const b = pick(state({ color: ["Rött"], country: "Frankrike" }), X);
    expect(b.relax).toEqual(["country"]);
    const c = pick(state({ color: ["Rosé"] }), X);
    expect(c.relax).toEqual(["color"]);
  });

  it("budgeten höjs stegvis och vinerna inom budget visas först", () => {
    const X = [
      cw({ id: "a", pr: 129, rt: 1 }),
      cw({ id: "b", pr: 149, rt: 1 }),
      cw({ id: "c", pr: 229, rt: 5 }),
      cw({ id: "d", pr: 239, rt: 5 }),
      cw({ id: "e", pr: 599, rt: 5 }),
    ];
    const r = pick(state({ budget: "199" }), X);
    expect(r.relax).toEqual([]);
    expect(r.budget).toBe("299");
    expect(r.list.map(({ w }) => w.id)).toEqual(["a", "b", "c", "d"]);
    expect(relaxMessage(r.relax, r.budget)).toBe("För få viner matchade alla dina val, så jag tog med viner upp till 299 kr.");
    // räcker inget steg släpps budgeten helt
    const only = pick(state({ budget: "199" }), [cw({ id: "x", pr: 900 })]);
    expect(only.relax).toEqual(["budget"]);
    expect(only.budget).toBeUndefined();
  });

  it("äldre delade länkar med budget=150/250 får de nya stegen", () => {
    expect(paramsToState(new URLSearchParams("budget=150")).state.budget).toBe("199");
    expect(paramsToState(new URLSearchParams("budget=250")).state.budget).toBe("299");
  });

  it("butiksfiltret", () => {
    const sb = pick(state({ shop: "sb" }), W).list;
    expect(sb.every(({ w }) => w.shop === "Systembolaget" || w.alt?.shop === "Systembolaget")).toBe(true);
    const web = pick(state({ shop: "web" }), W).list;
    expect(web.every(({ w }) => w.shop !== "Systembolaget" || !!w.alt)).toBe(true);
    expect(web.length).toBe(237);
  });
});

describe("fritext", () => {
  it("acceptanstestet från briefen", () => {
    const text = "Jag vill ha ett vitt som är lite kryddigt som man kan dricka i solnedgången på en balkong, gärna med lite maceration";
    const o = parse(text, W);
    expect(o.color).toEqual(["Vitt", "Orange"]);
    expect(o.food).toEqual(["none"]);
    expect(o.tags).toContain("Kryddig");
    const { state: s, answered, picked } = applyParsed(emptyState(), o, W);
    expect(picked).toEqual(expect.arrayContaining(["Vitt", "Orange", "Gott på egen hand", "Kryddig ton"]));
    expect(s.tags).toContain("Kryddig");
    const missing = QUESTIONS.map((q) => q.k).filter((k) => !answered.includes(k));
    expect(missing).toEqual(["budget", "adv"]);
    const reply = reflect(o, text, W) + missingTail(missing, false);
    expect(reply).toBe(
      "Solnedgång på balkongen, det låter som en fin kväll. Ett lättdrucket och friskt vitt med lite kryddighet i doften. "
      + "Eftersom du nämner skalkontakt tar jag med orangeviner också, det är vita druvor som fått ligga på skalen. "
      + "Några snabba frågor till, så hittar jag rätt flaska.",
    );
  });

  it("förstår budget, funk, mat och land", () => {
    expect(parse("ett vitt till skaldjur under 300 kr", W)).toMatchObject({ color: ["Vitt"], budget: "299", food: ["fisk"] });
    expect(parse("inte för funkigt", W).adv).toBe("1");
    expect(parse("ge mig något funkigt", W).adv).toBe("3");
    expect(parse("något fint", W).budget).toBe("9999");
    expect(parse("ett rött till lammgryta", W)).toMatchObject({ color: ["Rött"], food: ["kott"] });
    expect(parse("till thaimat", W).food).toEqual(["kryddigt"]);
    expect(parse("något franskt", W).country).toBe("Frankrike");
    expect(parse("på skalen", W).color).toEqual(["Orange"]);
    expect(parse("hemleverans", W).shop).toBe("web");
  });

  it("skiljer kryddig mat från kryddig smak", () => {
    expect(parse("kryddig mat", W)).toMatchObject({ food: ["kryddigt"] });
    expect(parse("kryddig mat", W).tags).not.toContain("Kryddig");
    expect(parse("ett kryddigt rött", W).tags).toContain("Kryddig");
  });

  it("bekräftar med användarens ord och bygger vidare", () => {
    const say = (t: string) => reflect(parse(t, W), t, W);
    expect(say("Ge mig ett lättdrucket rött")).toBe("Ett lättdrucket rött, då letar jag bland saftiga och svala röda med mjuka tanniner, som gamay och pinot noir.");
    expect(say("till kryddig mat")).toBe("Något till kryddig mat, då behövs ett vin som tål hettan och inte är för strävt.");
    expect(say("ett vitt till skaldjur under 300 kr")).toBe("Ett vitt till fisk och skaldjur för upp till 299 kr, då letar jag efter syra och lite sälta.");
    expect(say("en frisk rosé")).toBe("En frisk rosé, då letar jag efter något torrt och friskt.");
    expect(say("något billigt")).toBe("Något under 199 kr, det finns fina fynd i den prisklassen.");
    expect(missingTail(["budget"], false)).toBe(" En fråga till, så har du ditt förslag.");
  });

  it("likt ett vin kräver hela namnet", () => {
    const sol = W.find((w) => w.n === "Sol");
    expect(parse("ett vitt som man dricker i solnedgången", W).like).toBeUndefined();
    if (sol) expect(parse("något likt sol", W).like).toBe(sol.id);
    const fred = W.find((w) => w.n === "Fred 12")!;
    expect(parse("ett rött likt fred 12", W).like).toBe(fred.id);
  });

  it("känner igen när inget förstås", () => {
    expect(understood(parse("hej hej", W))).toBe(false);
  });
});

describe("delbar URL", () => {
  it("speglar valen och läser tillbaka dem", () => {
    const S = state({ color: ["Vitt", "Orange"], budget: "299", adv: "2", food: ["fisk"], tags: ["Mineralisk"], ax: { s: 4, f: 0, st: 0, fu: 0 }, country: "Frankrike", shop: "web" });
    const answered: QuestionKey[] = ["color", "budget", "adv", "food"];
    const p = stateToParams(S, answered);
    expect(p.toString()).toContain("farg=vitt%2Corange&budget=299&aventyr=2&mat=fisk");
    expect(paramsToState(p)).toEqual({ state: S, answered });
  });

  it("läser exemplet från briefen och 'Spelar ingen roll'", () => {
    const r = paramsToState(new URLSearchParams("farg=vitt,orange&budget=299&aventyr=2&mat=fisk"));
    expect(r.state).toMatchObject({ color: ["Vitt", "Orange"], budget: "299", adv: "2", food: ["fisk"] });
    expect(r.answered).toEqual(["color", "budget", "adv", "food"]);
    const any = paramsToState(new URLSearchParams("farg=alla&budget=alla&aventyr=alla&mat=alla"));
    expect(any.answered).toHaveLength(4);
    expect(any.state).toEqual(emptyState());
  });

  it("ignorerar skräp", () => {
    expect(paramsToState(new URLSearchParams("budget=7&aventyr=x&farg=lila&syra=9")).answered).toEqual([]);
  });
});
