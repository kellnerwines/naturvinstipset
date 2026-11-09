// Klicklogg och kompasshändelser i Neon Postgres (BRIEF-KOMPASSEN.md, 7.1–7.2).
// Utan DATABASE_URL är allt här no-op: /go-länkarna fungerar, men inget sparas.
// Inga IP-adresser och inga kakor sparas.

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { createHash } from "crypto";

let client: NeonQueryFunction<false, false> | null | undefined;
export function db(): NeonQueryFunction<false, false> | null {
  if (client === undefined) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    client = url ? neon(url) : null;
  }
  return client;
}

export const hasDb = () => db() !== null;

let schemaReady: Promise<void> | null = null;
/** Skapar tabellerna första gången (idempotent). */
export function ensureSchema(): Promise<void> {
  const sql = db();
  if (!sql) return Promise.resolve();
  schemaReady ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS click_events (
      id BIGSERIAL PRIMARY KEY,
      ts TIMESTAMPTZ NOT NULL DEFAULT now(),
      wine_id TEXT NOT NULL,
      shop TEXT NOT NULL,
      price NUMERIC,
      source_page TEXT NOT NULL,
      page_path TEXT,
      referrer_host TEXT,
      compass_state_json JSONB,
      device TEXT,
      bot_flag BOOLEAN NOT NULL DEFAULT false,
      dedupe_hash TEXT UNIQUE
    )`;
    await sql`CREATE INDEX IF NOT EXISTS click_events_ts ON click_events (ts)`;
    await sql`CREATE TABLE IF NOT EXISTS click_daily (
      day DATE NOT NULL,
      wine_id TEXT NOT NULL,
      shop TEXT NOT NULL,
      source_page TEXT NOT NULL,
      clicks INTEGER NOT NULL,
      PRIMARY KEY (day, wine_id, shop, source_page)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS compass_events (
      id BIGSERIAL PRIMARY KEY,
      ts TIMESTAMPTZ NOT NULL DEFAULT now(),
      type TEXT NOT NULL,
      data JSONB
    )`;
    await sql`CREATE INDEX IF NOT EXISTS compass_events_ts ON compass_events (ts)`;
  })().catch((e) => { schemaReady = null; throw e; });
  return schemaReady;
}

/** hash(UA + dag + vin): går inte att koppla till en person, stoppar dubbelklick. */
export function dedupeHash(ua: string, day: string, wineId: string): string {
  return createHash("sha256").update(`${ua}|${day}|${wineId}`).digest("hex").slice(0, 32);
}

export type ClickRow = {
  wineId: string;
  shop: string;
  price: number | null;
  sourcePage: string;
  pagePath: string | null;
  referrerHost: string | null;
  compassState: Record<string, string> | null;
  device: string;
  bot: boolean;
  dedupe: string;
};

/** Sparar ett klick. Dubbletter samma dag ignoreras. Kastar aldrig. */
export async function logClick(c: ClickRow): Promise<boolean> {
  const sql = db();
  if (!sql) return false;
  try {
    await ensureSchema();
    await sql`INSERT INTO click_events
      (wine_id, shop, price, source_page, page_path, referrer_host, compass_state_json, device, bot_flag, dedupe_hash)
      VALUES (${c.wineId}, ${c.shop}, ${c.price}, ${c.sourcePage}, ${c.pagePath}, ${c.referrerHost},
        ${c.compassState ? JSON.stringify(c.compassState) : null}, ${c.device}, ${c.bot}, ${c.dedupe})
      ON CONFLICT (dedupe_hash) DO NOTHING`;
    return true;
  } catch (e) {
    console.error("logClick failed", e instanceof Error ? e.message : e);
    return false;
  }
}

export async function logCompassEvent(type: string, data: unknown): Promise<void> {
  const sql = db();
  if (!sql) return;
  try {
    await ensureSchema();
    await sql`INSERT INTO compass_events (type, data) VALUES (${type}, ${JSON.stringify(data)})`;
  } catch (e) {
    console.error("logCompassEvent failed", e instanceof Error ? e.message : e);
  }
}

/**
 * Slår ihop klick äldre än `days` dagar till dagssummor och tar bort råraderna
 * (7.2). Kompasshändelser äldre än `days` tas bort.
 */
export async function aggregateOld(days = 90): Promise<{ aggregated: number; deletedEvents: number }> {
  const sql = db();
  if (!sql) return { aggregated: 0, deletedEvents: 0 };
  await ensureSchema();
  const cutoff = new Date(Date.now() - days * 86400_000).toISOString();
  const rows = await sql`
    WITH moved AS (
      DELETE FROM click_events WHERE ts < ${cutoff} RETURNING ts, wine_id, shop, source_page, bot_flag
    ), ins AS (
      INSERT INTO click_daily (day, wine_id, shop, source_page, clicks)
      SELECT (ts AT TIME ZONE 'Europe/Stockholm')::date, wine_id, shop, source_page, count(*)::int
      FROM moved WHERE NOT bot_flag GROUP BY 1, 2, 3, 4
      ON CONFLICT (day, wine_id, shop, source_page) DO UPDATE SET clicks = click_daily.clicks + EXCLUDED.clicks
      RETURNING 1
    )
    SELECT (SELECT count(*) FROM moved)::int AS n`;
  const ev = await sql`WITH d AS (DELETE FROM compass_events WHERE ts < ${cutoff} RETURNING 1) SELECT count(*)::int AS n FROM d`;
  return { aggregated: Number(rows[0]?.n ?? 0), deletedEvents: Number(ev[0]?.n ?? 0) };
}

export type Range = { from: string; to: string }; // YYYY-MM-DD, inklusive

/**
 * Alla klick (utan robotar) i intervallet, som dagssummor. Råa klick och
 * redan aggregerade dagar slås ihop, så att statistiken räcker bakåt.
 */
export async function dailyClicks(r: Range) {
  const sql = db();
  if (!sql) return [];
  await ensureSchema();
  return (await sql`
    SELECT day::text AS day, wine_id, shop, source_page, sum(clicks)::int AS clicks FROM (
      SELECT (ts AT TIME ZONE 'Europe/Stockholm')::date AS day, wine_id, shop, source_page, 1 AS clicks
        FROM click_events WHERE NOT bot_flag
          AND (ts AT TIME ZONE 'Europe/Stockholm')::date BETWEEN ${r.from}::date AND ${r.to}::date
      UNION ALL
      SELECT day, wine_id, shop, source_page, clicks FROM click_daily
        WHERE day BETWEEN ${r.from}::date AND ${r.to}::date
    ) t GROUP BY 1, 2, 3, 4 ORDER BY 1`) as { day: string; wine_id: string; shop: string; source_page: string; clicks: number }[];
}

/** Råa klick i intervallet för CSV-export. */
export async function rawClicks(r: Range) {
  const sql = db();
  if (!sql) return [];
  await ensureSchema();
  return (await sql`
    SELECT ts, wine_id, shop, price, source_page, page_path, referrer_host, compass_state_json, device, bot_flag
    FROM click_events
    WHERE (ts AT TIME ZONE 'Europe/Stockholm')::date BETWEEN ${r.from}::date AND ${r.to}::date
    ORDER BY ts`) as Record<string, unknown>[];
}

/** Databasens storlek i byte, för att visa hur nära gratisnivåns gräns vi är. */
export async function databaseSize(): Promise<number | null> {
  const sql = db();
  if (!sql) return null;
  try {
    const r = await sql`SELECT pg_database_size(current_database())::bigint AS b`;
    return Number(r[0]?.b ?? 0);
  } catch {
    return null;
  }
}
