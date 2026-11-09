// CSV-export av klick för admin (BRIEF-KOMPASSEN.md, 7.3).

import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getWines } from "@/lib/blob";
import { dailyClicks, rawClicks } from "@/lib/clicks/db";
import { swedishDay } from "@/lib/clicks/util";

export const dynamic = "force-dynamic";

const isDate = (s: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = v instanceof Date ? v.toISOString() : typeof v === "object" ? JSON.stringify(v) : String(v);
  // Skydda mot formelinjektion i Excel.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",;\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const to = isDate(sp.get("to")) ? sp.get("to")! : swedishDay();
  const from = isDate(sp.get("from")) ? sp.get("from")! : swedishDay(new Date(Date.now() - 29 * 86400_000));
  const kind = sp.get("typ") === "dag" ? "dag" : "klick";

  const wines = await getWines();
  const name = new Map(wines.map((w) => [w.id, `${w.producer} – ${w.name}${w.year ? ` ${w.year}` : ""}`]));

  let lines: string[];
  if (kind === "dag") {
    const rows = await dailyClicks({ from, to });
    lines = [["dag", "vin_id", "vin", "butik", "kallsida", "klick"].join(";"),
      ...rows.map((r) => [r.day, r.wine_id, name.get(r.wine_id) ?? "", r.shop, r.source_page, r.clicks].map(csvCell).join(";"))];
  } else {
    const rows = await rawClicks({ from, to });
    const cols = ["ts", "wine_id", "shop", "price", "source_page", "page_path", "referrer_host", "compass_state_json", "device", "bot_flag"];
    lines = [[...cols.slice(0, 2), "vin", ...cols.slice(2)].join(";"),
      ...rows.map((r) => [r.ts, r.wine_id, name.get(String(r.wine_id)) ?? "", ...cols.slice(2).map((c) => r[c])].map(csvCell).join(";"))];
  }

  return new NextResponse("﻿" + lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="klick-${kind}-${from}-${to}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
