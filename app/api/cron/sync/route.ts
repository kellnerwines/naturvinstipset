// Månadssynk mot webbutikerna (BRIEF-KOMPASSEN.md, avsnitt 6). Vercel Cron
// anropar GET den 1:a varje månad med "Authorization: Bearer $CRON_SECRET".
// "Synka nu" i admin skickar POST. ?dry=1 hämtar och räknar men skriver inget,
// ?shop=vinnatur|flaskvis|philipson|winetrade|justwine kör bara en butik.

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { runSync, SYNC_SHOPS, type SyncShop } from "@/lib/sync/run";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function allowed(req: NextRequest): Promise<"cron" | "admin" | null> {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return "cron";
  return (await isAuthenticated()) ? "admin" : null;
}

export async function GET(req: NextRequest) {
  const trigger = await allowed(req);
  if (!trigger) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const dryRun = req.nextUrl.searchParams.get("dry") === "1";
  const shop = req.nextUrl.searchParams.get("shop");
  const entry = await runSync({ trigger, dryRun, only: SYNC_SHOPS.includes(shop as SyncShop) ? (shop as SyncShop) : undefined });
  if (!dryRun) revalidatePath("/", "layout");
  return NextResponse.json(entry);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const entry = await runSync({ trigger: "admin" });
  revalidatePath("/", "layout");
  // Knappen i admin vill ha resultatet som JSON; ett vanligt formulär skickas tillbaka till sidan.
  if (req.headers.get("accept")?.includes("application/json")) return NextResponse.json(entry);
  return NextResponse.redirect(new URL("/admin/synk", req.url), 303);
}
