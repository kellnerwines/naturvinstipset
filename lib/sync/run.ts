// Kör synken mot webbutikerna (BRIEF-KOMPASSEN.md, avsnitt 6). Anropas av
// Vercel Cron en gång per månad och av "Synka nu" i admin. Vanlig kod utan AI.

import { backupWines, getSyncLog, getWines, putWineImage, saveSyncLog, saveWines, type Wine } from "../blob";
import { downloadImage, imageKey, processBottleImage } from "../wineImages";
import { applySync, type ShopReport } from "./apply";
import { flaskvisFeed, philipsonFeed, vinNaturFeed } from "./feeds";
import { fillFoodCategories } from "./food";

export type SyncLogEntry = {
  startedAt: string;
  finishedAt: string;
  trigger: "cron" | "admin";
  dryRun: boolean;
  reports: ShopReport[];
  alerts: string[];
  backup?: string | null;
  preview?: Pick<Wine, "slug" | "name" | "producer" | "country" | "region" | "wineType" | "grape" | "price" | "foodCategories">[];
};

const LOG_KEEP = 24;

const knownIds = (wines: Wine[], source: string) =>
  new Set(wines.filter((w) => (w.source ?? "").startsWith(source) && w.sourceId).map((w) => w.sourceId!));

/** `only` begränsar körningen till en butik, t.ex. för en snabb torrkörning. */
export async function runSync(opts: { trigger: "cron" | "admin"; dryRun?: boolean; budgetMs?: number; only?: "vinnatur" | "flaskvis" | "philipson" }): Promise<SyncLogEntry> {
  const started = new Date();
  const now = started.toISOString();
  // Lämna tid åt bilder och sparning innan funktionen stängs (maxDuration 300 s).
  const deadline = started.getTime() + (opts.budgetMs ?? 230_000);

  const existing = await getWines();
  const feeds = await Promise.all([
    !opts.only || opts.only === "vinnatur" ? vinNaturFeed(knownIds(existing, "vinnatur.shop"), deadline, now) : null,
    !opts.only || opts.only === "flaskvis" ? flaskvisFeed(knownIds(existing, "flaskvis.se"), deadline, now) : null,
    !opts.only || opts.only === "philipson" ? philipsonFeed(knownIds(existing, "philipsonwine.se"), deadline, now) : null,
  ]);
  const { wines, reports, alerts } = applySync(existing, feeds.filter((f) => f !== null), now);
  // Viner utan matkategorier får dem ur vintyp, druva och land, så att kompassens matfilter hittar dem.
  const foodFilled = fillFoodCategories(wines);
  if (foodFilled.length) alerts.push(`${foodFilled.length} viner fick matkategorier automatiskt (vintyp, druva och land)`);

  // Nya vins flaskbilder flyttas till Blob (5.1). Misslyckas det står butikens bild kvar tills vidare.
  const added = new Set(reports.flatMap((r) => r.added));
  if (!opts.dryRun) {
    for (const w of wines) {
      if (!added.has(w.slug) || !w.primaryImageUrl?.startsWith("http") || Date.now() > deadline + 40_000) continue;
      try {
        const img = await processBottleImage(await downloadImage(w.primaryImageUrl));
        const src = await putWineImage(imageKey(w), img.data);
        if (src) { w.sourceImageUrl = w.primaryImageUrl; w.primaryImageUrl = src; }
      } catch (e) {
        alerts.push(`${w.name}: bilden kunde inte flyttas till Blob (${(e as Error).message})`);
      }
    }
  }

  const changed = foodFilled.length > 0 || reports.some((r) => r.added.length || r.changed.length || r.unpublished.length || r.republished.length);
  let backup: string | null | undefined;
  if (!opts.dryRun && changed) {
    backup = await backupWines("synk");
    await saveWines(wines);
  }

  const entry: SyncLogEntry = {
    startedAt: now, finishedAt: new Date().toISOString(), trigger: opts.trigger, dryRun: !!opts.dryRun,
    reports, alerts, backup,
    // Torrkörningen visar vad som skulle skapas, så att det går att granska innan synken skriver.
    ...(opts.dryRun ? { preview: wines.filter((w) => added.has(w.slug)).map((w) => ({ slug: w.slug, name: w.name, producer: w.producer, country: w.country, region: w.region, wineType: w.wineType, grape: w.grape, price: w.price, foodCategories: w.foodCategories })) } : {}),
  };
  if (!opts.dryRun) {
    const log = await getSyncLog<SyncLogEntry>();
    await saveSyncLog([entry, ...log].slice(0, LOG_KEEP));
  }
  return entry;
}
