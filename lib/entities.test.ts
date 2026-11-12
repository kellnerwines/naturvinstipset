import { describe, expect, it } from "vitest";
import type { Wine } from "./blob";
import { clip, entitySlug, grapesOf, grapeSlug, grapesIn, producerSlug, producersOf } from "./entities";

const wine = (o: Partial<Wine>): Wine => ({ id: o.slug ?? "x", slug: "x", name: "X", producer: "", country: "", wineType: "Rött", description: "", adminRating: 3, createdAt: "", published: true, ...o });

describe("entitySlug", () => {
  it("tar bort accenter och svenska tecken", () => {
    expect(entitySlug("Hervé Villemade")).toBe("herve-villemade");
    expect(entitySlug("Österrike")).toBe("osterrike");
    expect(entitySlug("Gewürztraminer")).toBe("gewurztraminer");
    expect(entitySlug("(l)Equinox Wines")).toBe("l-equinox-wines");
  });
});

describe("grapesOf", () => {
  it("delar upp blandningar och tar bort procent", () => {
    expect(grapesOf({ grape: "Pinot Noir 40%, Merlot 30%, Vermentino 30%" })).toEqual(["Pinot Noir", "Merlot", "Vermentino"]);
  });
  it("tar bort beskrivande text och okänd druva", () => {
    expect(grapesOf({ grape: "Xarel-lo från kalk- och fossilrika jordar" })).toEqual(["Xarel-lo"]);
    expect(grapesOf({ grape: "Okänd druva" })).toEqual([]);
    expect(grapesOf({})).toEqual([]);
  });
  it("slår ihop synonymer", () => {
    expect(grapesOf({ grape: "Pinot Grigio, Garnacha Tinta, Chenin" })).toEqual(["Pinot Gris", "Grenache", "Chenin Blanc"]);
    expect(grapeSlug("Blaufrankisch")).toBe("blaufrankisch");
    expect(grapeSlug("Weissburgunder")).toBe("pinot-blanc");
  });
});

describe("gruppering", () => {
  it("samlar samma producent med olika stavning", () => {
    const p = producersOf([wine({ slug: "a", producer: "Julien Meyer" }), wine({ slug: "b", producer: "Domaine Julien Meyer" }), wine({ slug: "c", producer: "Domaine Du Pelican" }), wine({ slug: "d", producer: "Domaine du Pelican" })]);
    expect(p.get("domaine-julien-meyer")?.wines.map((w) => w.slug)).toEqual(["a", "b"]);
    expect(p.get("domaine-du-pelican")?.wines).toHaveLength(2);
    expect(producerSlug("Julien Meyer")).toBe("domaine-julien-meyer");
  });
  it("räknar varje druva en gång per vin", () => {
    const g = grapesIn([wine({ slug: "a", grape: "Pinot Grigio, Pinot Gris" }), wine({ slug: "b", grape: "Pinot Gris" })]);
    expect(g.get("pinot-gris")?.wines).toHaveLength(2);
  });
});

describe("clip", () => {
  it("behåller hela meningar och kapar annars vid ett ord", () => {
    expect(clip("Kort.")).toBe("Kort.");
    expect(clip("Första meningen. Andra meningen som är lång.", 20)).toBe("Första meningen.");
    expect(clip("Ett väldigt långt ord efter ord", 15)).toBe("Ett väldigt…");
  });
});
