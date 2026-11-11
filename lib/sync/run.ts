// Kör synken mot webbutikerna (BRIEF-KOMPASSEN.md, avsnitt 6). Anropas av
// Vercel Cron en gång per månad och av "Synka nu" i admin. Vanlig kod utan AI.

import { backupWines, getSyncLog, getWines, putWineImage, saveSyncLog, saveWines, type Wine } from "../blob";
import { downloadImage, imageKey, mapLimit, needsImageMigration, processBottleImage } from "../wineImages";
import { applySync, type ShopReport } from "./apply";
import { flaskvisFeed, philipsonFeed, vinNaturFeed, wineTradeFeed } from "./feeds";
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

export const SYNC_SHOPS = ["vinnatur", "flaskvis", "philipson", "winetrade"] as const;
export type SyncShop = (typeof SYNC_SHOPS)[number];

const knownIds = (wines: Wine[], source: string) =>
  new Set(wines.filter((w) => (w.source ?? "").startsWith(source) && w.sourceId).map((w) => w.sourceId!));

/** `only` begränsar körningen till en butik, t.ex. för en snabb torrkörning. */
export async function runSync(opts: { trigger: "cron" | "admin"; dryRun?: boolean; budgetMs?: number; only?: SyncShop }): Promise<SyncLogEntry> {
  const started = new Date();
  const now = started.toISOString();
  // Lämna tid åt bilder och sparning innan funktionen stängs (maxDuration 300 s).
  const deadline = started.getTime() + (opts.budgetMs ?? 230_000);

  const existing = await getWines();
  const feeds = await Promise.all([
    !opts.only || opts.only === "vinnatur" ? vinNaturFeed(knownIds(existing, "vinnatur.shop"), deadline, now) : null,
    !opts.only || opts.only === "flaskvis" ? flaskvisFeed(knownIds(existing, "flaskvis.se"), deadline, now) : null,
    !opts.only || opts.only === "philipson" ? philipsonFeed(knownIds(existing, "philipsonwine.se"), deadline, now) : null,
    !opts.only || opts.only === "winetrade" ? wineTradeFeed(knownIds(existing, "winetrade.se"), deadline, now) : null,
  ]);
  const { wines, reports, alerts } = applySync(existing, feeds.filter((f) => f !== null), now);
  // Viner utan matkategorier får dem ur vintyp, druva och land, så att kompassens matfilter hittar dem.
  const foodFilled = fillFoodCategories(wines);
  if (foodFilled.length) alerts.push(`${foodFilled.length} viner fick matkategorier automatiskt (vintyp, druva och land)`);

  // Flaskbilder som fortfarande ligger hos butiken flyttas till Blob (5.1), nya viner först.
  // Det som inte hinns med inom tidsgränsen tas vid nästa körning; tills dess visas butikens bild.
  const added = new Set(reports.flatMap((r) => r.added));
  let imagesMoved = 0;
  if (!opts.dryRun) {
    const todo = wines.filter(needsImageMigration).sort((a, b) => Number(added.has(b.slug)) - Number(added.has(a.slug)));
    const imageDeadline = deadline + 40_000;
    await mapLimit(todo, 4, async (w) => {
      if (Date.now() > imageDeadline) return;
      try {
        const img = await processBottleImage(await downloadImage(w.primaryImageUrl!));
        const src = await putWineImage(imageKey(w), img.data);
        if (src) { w.sourceImageUrl = w.primaryImageUrl; w.primaryImageUrl = src; imagesMoved++; }
      } catch (e) {
        alerts.push(`${w.name}: bilden kunde inte flyttas till Blob (${(e as Error).message})`);
      }
    });
    const left = wines.filter(needsImageMigration).length;
    if (imagesMoved || left) alerts.push(`${imagesMoved} flaskbilder flyttades till Blob${left ? `, ${left} kvar till nästa körning` : ""}`);
  }

  const changed = imagesMoved > 0 || foodFilled.length > 0 || reports.some((r) => r.added.length || r.changed.length || r.unpublished.length || r.republished.length);
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
