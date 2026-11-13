// "Klipp ut flaskbilder" i admin: tar bort enfärgad fotobakgrund från vinbilder som redan finns,
// så att alla flaskor står fritt på sajtens färgfält. Nya bilder klipps redan i synken
// (processBottleImage). Varje bild kontrolleras en gång; bilder utan sådan bakgrund lämnas orörda.

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { get as blobGet } from "@vercel/blob";
import { isAuthenticated } from "@/lib/auth";
import { backupWines, getWines, putWineImage, saveWines, type Wine } from "@/lib/blob";
import { cutOutBackground, downloadImage, mapLimit, processBottleImage } from "@/lib/wineImages";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Bildens bytes, oavsett om den ligger i Blob (via /api/image), under /uploads eller hos en butik. */
async function readImage(src: string, origin: string): Promise<Buffer> {
  const blobUrl = src.startsWith("/api/image") ? new URL(src, origin).searchParams.get("url") : null;
  if (blobUrl) {
    const r = await blobGet(blobUrl, { access: "private" });
    if (!r || r.statusCode !== 200) throw new Error("hittades inte i Blob");
    return Buffer.from(await new Response(r.stream).arrayBuffer());
  }
  return downloadImage(src.startsWith("/") ? new URL(src, origin).toString() : src);
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const started = Date.now();
  const deadline = started + 230_000;
  const origin = new URL(req.url).origin;
  const now = new Date().toISOString();

  const wines = await getWines();
  const todo = wines.filter((w) => w.primaryImageUrl && !w.imageCheckedAt && !/^https?:\/\//i.test(w.primaryImageUrl ?? "x"));
  let cut = 0, checked = 0;
  const errors: string[] = [];

  await mapLimit(todo, 3, async (w: Wine) => {
    if (Date.now() > deadline) return;
    try {
      const without = await cutOutBackground(await readImage(w.primaryImageUrl!, origin));
      if (without) {
        const img = await processBottleImage(without);
        const src = await putWineImage(`naturvin/wines/${w.slug}-fri.webp`, img.data);
        if (!src) throw new Error("Blob saknas");
        w.primaryImageUrl = src;
        cut++;
      }
      w.imageCheckedAt = now;
      checked++;
    } catch (e) {
      errors.push(`${w.name}: ${(e as Error).message}`);
    }
  });

  if (checked) {
    await backupWines("klipp-bilder");
    await saveWines(wines);
    revalidatePath("/", "layout");
  }
  const left = todo.length - checked - errors.length;
  return NextResponse.json({
    summary: `${checked} bilder kontrollerade, ${cut} utklippta${errors.length ? `, ${errors.length} fel` : ""}${left > 0 ? `. ${left} kvar: kör igen.` : "."}`,
    cut, checked, left, errors: errors.slice(0, 20),
  });
}
