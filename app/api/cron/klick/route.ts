// Daglig städning (BRIEF-KOMPASSEN.md, 7.2): klick äldre än 90 dagar slås ihop
// till dagssummor och kompasshändelser äldre än 90 dagar tas bort, så att
// databasen håller sig liten på Neons gratisnivå. Körs av Vercel Cron
// (vercel.json), som skickar "Authorization: Bearer $CRON_SECRET".

import { NextRequest, NextResponse } from "next/server";
import { aggregateOld, hasDb } from "@/lib/clicks/db";
import { isAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const fromCron = !!secret && req.headers.get("authorization") === `Bearer ${secret}`;
  if (!fromCron && !(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasDb()) return NextResponse.json({ ok: true, skipped: "Ingen databas kopplad" });
  const result = await aggregateOld(90);
  return NextResponse.json({ ok: true, ...result });
}
