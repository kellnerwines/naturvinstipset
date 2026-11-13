import { describe, expect, it } from "vitest";
import sharp from "sharp";
import type { Wine } from "./blob";
import { blobImageSrc, cutOutBackground, imageKey, mapLimit, needsImageMigration, processBottleImage } from "./wineImages";

/** En "flaska" (rektangel) mitt på en bakgrund. */
async function bottle(opts: { w: number; h: number; bw: number; bh: number; bg: { r: number; g: number; b: number; alpha: number } }) {
  const { w, h, bw, bh, bg } = opts;
  const fg = await sharp({ create: { width: bw, height: bh, channels: 4, background: { r: 120, g: 20, b: 40, alpha: 1 } } }).png().toBuffer();
  return sharp({ create: { width: w, height: h, channels: 4, background: bg } })
    .composite([{ input: fg, left: Math.round((w - bw) / 2), top: Math.round((h - bh) / 2) }])
    .png()
    .toBuffer();
}

const wine = (p: Partial<Wine>): Wine => ({
  id: "x", slug: "x", name: "X", producer: "P", country: "", wineType: "Vitt",
  description: "", adminRating: 0, createdAt: "", published: true, ...p,
});

describe("processBottleImage", () => {
  it("beskär vit kant och sparar som WebP", async () => {
    const out = await processBottleImage(await bottle({ w: 400, h: 800, bw: 100, bh: 300, bg: { r: 255, g: 255, b: 255, alpha: 1 } }));
    const meta = await sharp(out.data).metadata();
    expect(meta.format).toBe("webp");
    expect(out.width).toBeGreaterThanOrEqual(99);
    expect(out.width).toBeLessThanOrEqual(102);
    expect(out.height).toBeGreaterThanOrEqual(299);
    expect(out.height).toBeLessThanOrEqual(302);
  });

  it("beskär transparent kant och behåller transparens", async () => {
    const out = await processBottleImage(await bottle({ w: 500, h: 900, bw: 120, bh: 400, bg: { r: 0, g: 0, b: 0, alpha: 0 } }));
    expect(out.height).toBeLessThanOrEqual(402);
    expect(out.width).toBeLessThanOrEqual(122);
  });

  it("behåller transparens runt flaskhalsen", async () => {
    // Bred kropp och smal hals: hörnen bredvid halsen är transparenta efter beskärning.
    const body = await sharp({ create: { width: 120, height: 300, channels: 4, background: { r: 120, g: 20, b: 40, alpha: 1 } } }).png().toBuffer();
    const neck = await sharp({ create: { width: 30, height: 100, channels: 4, background: { r: 120, g: 20, b: 40, alpha: 1 } } }).png().toBuffer();
    const input = await sharp({ create: { width: 400, height: 700, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: neck, left: 185, top: 100 }, { input: body, left: 140, top: 200 }])
      .png().toBuffer();
    const out = await processBottleImage(input);
    expect(out.height).toBeLessThanOrEqual(402);
    const { data, info } = await sharp(out.data).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    expect(data[3]).toBeLessThan(10);                                       // övre vänstra hörnet är transparent
    const mid = (Math.floor(info.height * 0.75) * info.width + Math.floor(info.width / 2)) * 4;
    expect(data[mid + 3]).toBeGreaterThan(245);                              // kroppen är ogenomskinlig
  });

  it("skalar ner till högst 600 px höjd men förstorar inte", async () => {
    const big = await processBottleImage(await bottle({ w: 1200, h: 2400, bw: 500, bh: 2000, bg: { r: 255, g: 255, b: 255, alpha: 1 } }));
    expect(big.height).toBe(600);
    expect(big.width).toBe(150);
    const small = await processBottleImage(await bottle({ w: 200, h: 400, bw: 60, bh: 200, bg: { r: 255, g: 255, b: 255, alpha: 1 } }));
    expect(small.height).toBeLessThanOrEqual(202);
  });

  it("klarar en helt enfärgad bild", async () => {
    const flat = await sharp({ create: { width: 50, height: 50, channels: 3, background: "#ffffff" } }).png().toBuffer();
    await expect(processBottleImage(flat)).resolves.toBeTruthy();
  });
});

describe("hjälpfunktioner", () => {
  it("vet vilka bilder som ska flyttas", () => {
    expect(needsImageMigration(wine({ primaryImageUrl: "https://cdn.shopify.com/a.png" }))).toBe(true);
    expect(needsImageMigration(wine({ primaryImageUrl: "/uploads/a.png" }))).toBe(false);
    expect(needsImageMigration(wine({ primaryImageUrl: "/api/image?url=x" }))).toBe(false);
    expect(needsImageMigration(wine({ primaryImageUrl: "https://abc.private.blob.vercel-storage.com/a.webp" }))).toBe(false);
    expect(needsImageMigration(wine({ primaryImageUrl: "https://cdn.shopify.com/a.png", lockedFields: ["primaryImageUrl"] }))).toBe(false);
    expect(needsImageMigration(wine({}))).toBe(false);
  });

  it("bygger nyckel och visningsadress", () => {
    expect(imageKey({ slug: "vn-abc" })).toBe("naturvin/wines/vn-abc.webp");
    expect(blobImageSrc("https://s.private.blob.vercel-storage.com/a b.webp")).toBe(
      "/api/image?url=https%3A%2F%2Fs.private.blob.vercel-storage.com%2Fa%20b.webp",
    );
  });

  it("mapLimit håller gränsen och ordningen", async () => {
    let active = 0, peak = 0;
    const res = await mapLimit([1, 2, 3, 4, 5, 6, 7, 8], 3, async (n) => {
      active++; peak = Math.max(peak, active);
      await new Promise((r) => setTimeout(r, 5));
      active--;
      return n * 2;
    });
    expect(res).toEqual([2, 4, 6, 8, 10, 12, 14, 16]);
    expect(peak).toBeLessThanOrEqual(3);
  });
});

describe("cutOutBackground", () => {
  const photo = (bottle: boolean) => sharp({ create: { width: 120, height: 200, channels: 3, background: { r: 190, g: 196, b: 200 } } })
    .composite(bottle ? [{ input: { create: { width: 30, height: 150, channels: 3, background: { r: 40, g: 30, b: 20 } } }, left: 45, top: 30 }] : [])
    .jpeg().toBuffer();
  it("gör den enfärgade bakgrunden genomskinlig men behåller flaskan", async () => {
    const out = await cutOutBackground(await photo(true));
    expect(out).not.toBeNull();
    const { data, info } = await sharp(out!).raw().toBuffer({ resolveWithObject: true });
    const alpha = (x: number, y: number) => data[(y * info.width + x) * 4 + 3];
    expect(alpha(2, 2)).toBe(0);
    expect(alpha(60, 100)).toBe(255);
  });
  it("lämnar bilder utan något motiv på bakgrunden orörda", async () => {
    expect(await cutOutBackground(await photo(false))).toBeNull();
  });
});
