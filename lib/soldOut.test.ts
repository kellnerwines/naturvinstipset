import { describe, expect, it } from "vitest";
import type { Wine } from "./blob";
import { STOCK_HIDDEN, TAX_HIDDEN } from "./sync/apply";
import { hasWinePage, isSoldOut, similarWines } from "./soldOut";

const wine = (id: string, o: Partial<Wine>): Wine => ({
  id, slug: id, name: id, producer: "P", country: "Portugal", wineType: "Vitt", description: "",
  adminRating: 0, createdAt: "", published: true, ...o,
});

describe("slutsålda vinsidor", () => {
  it("vinsidan finns kvar när vinet bara är slut, men inte när det dolts av andra skäl", () => {
    expect(hasWinePage(wine("a", {}))).toBe(true);
    expect(hasWinePage(wine("b", { published: false, syncHidden: STOCK_HIDDEN }))).toBe(true);
    expect(isSoldOut(wine("b", { published: false, syncHidden: STOCK_HIDDEN }))).toBe(true);
    expect(hasWinePage(wine("c", { published: false, syncHidden: TAX_HIDDEN }))).toBe(false);
    expect(hasWinePage(wine("d", { published: false }))).toBe(false);
  });

  it("liknande viner: samma druva först, sedan samma land, bara publicerade och samma typ", () => {
    const gone = wine("gone", { published: false, syncHidden: STOCK_HIDDEN, grape: "Arinto" });
    const list = similarWines(gone, [
      gone,
      wine("land", { grape: "Encruzado" }),
      wine("druva", { grape: "Arinto", country: "Frankrike" }),
      wine("rott", { grape: "Arinto", wineType: "Rött" }),
      wine("dold", { grape: "Arinto", published: false }),
    ]);
    expect(list.map((w) => w.id)).toEqual(["druva", "land"]);
  });
});
