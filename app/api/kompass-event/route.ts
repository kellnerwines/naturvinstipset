// Anonyma händelser från Vinkompassen (BRIEF-KOMPASSEN.md, 4.5): frågesvar,
// fritext (kortad), använda paneler och antal förslag. Ingen IP-adress, ingen kaka.

import { NextRequest, NextResponse } from "next/server";
import { logCompassEvent } from "@/lib/clicks/db";
import { isBot } from "@/lib/clicks/util";

export const dynamic = "force-dynamic";

const s = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);

export async function POST(req: NextRequest) {
  if (isBot(req.headers.get("user-agent"))) return new NextResponse(null, { status: 204 });
  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (text.length > 2000) return new NextResponse(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  switch (body.type) {
    case "answer":
      await logCompassEvent("answer", { question: s(body.question, 20), value: s(body.value, 120) });
      break;
    case "freetext":
      await logCompassEvent("freetext", { text: s(body.text, 200) });
      break;
    case "panel":
      await logCompassEvent("panel", { panel: s(body.panel, 20) });
      break;
    case "result":
      await logCompassEvent("result", { count: typeof body.count === "number" ? Math.round(body.count) : null });
      break;
    default:
      return NextResponse.json({ error: "Okänd händelse" }, { status: 400 });
  }
  return new NextResponse(null, { status: 204 });
}
