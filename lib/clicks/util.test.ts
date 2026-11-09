import { describe, expect, it } from "vitest";
import {
  asSourcePage, buyRel, compassState, deviceType, goHref, isBot, outboundUrl, referrerHost, safePath, shopSlug,
} from "./util";
import { dedupeHash } from "./db";

describe("klickloggens hjälpfunktioner", () => {
  it("butiksslugs", () => {
    expect(shopSlug("Systembolaget")).toBe("systembolaget");
    expect(shopSlug("Vin & Natur")).toBe("vin-natur");
    expect(shopSlug("Flaskvis")).toBe("flaskvis");
  });

  it("utm och ref till webbutiker, inget till Systembolaget", () => {
    expect(outboundUrl("https://www.systembolaget.se/produkt/vin/x-123/", "Systembolaget", "vinkompassen"))
      .toBe("https://www.systembolaget.se/produkt/vin/x-123/");
    const u = new URL(outboundUrl("https://vinnatur.shop/products/x?variant=1", "Vin & Natur", "vinkompassen"));
    expect(u.searchParams.get("variant")).toBe("1");
    expect(u.searchParams.get("utm_source")).toBe("naturvinstipset");
    expect(u.searchParams.get("utm_medium")).toBe("referral");
    expect(u.searchParams.get("utm_campaign")).toBe("vinkompassen");
    expect(u.searchParams.get("ref")).toBe("naturvinstipset");
  });

  it("/go-länkar", () => {
    expect(goHref("fv-arinto", "Flaskvis", { source: "kompassen", path: "/", state: "farg=vitt&budget=250" }))
      .toBe("/go/flaskvis/fv-arinto?src=kompassen&p=%2F&k=farg%3Dvitt%26budget%3D250");
  });

  it("robotar och enheter", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isBot("facebookexternalhit/1.1")).toBe(true);
    expect(isBot("")).toBe(true);
    const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
    expect(isBot(iphone)).toBe(false);
    expect(deviceType(iphone)).toBe("mobil");
    expect(deviceType("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("surfplatta");
    expect(deviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15")).toBe("dator");
  });

  it("sparar ingen persondata", () => {
    expect(referrerHost("https://www.google.com/search?q=naturvin&uid=123")).toBe("www.google.com");
    expect(safePath("/viner/x?email=a@b.se")).toBe("/viner/x");
    expect(safePath("https://evil.example/")).toBeNull();
    expect(safePath("//evil.example/")).toBeNull();
    expect(compassState("farg=vitt&budget=250&email=a@b.se")).toEqual({ farg: "vitt", budget: "250" });
    expect(asSourcePage("hack")).toBe("okand");
    const h = dedupeHash("UA", "2026-11-09", "w1");
    expect(h).toHaveLength(32);
    expect(h).toBe(dedupeHash("UA", "2026-11-09", "w1"));
    expect(h).not.toBe(dedupeHash("UA", "2026-11-10", "w1"));
  });

  it("sponsored bara när ersättning är på och aldrig för Systembolaget", () => {
    expect(buyRel("Flaskvis", false)).toBe("noopener nofollow");
    expect(buyRel("Flaskvis", true)).toBe("noopener sponsored nofollow");
    expect(buyRel("Systembolaget", true)).toBe("noopener nofollow");
  });
});
