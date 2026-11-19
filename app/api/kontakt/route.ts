// Kontaktformuläret. Meddelandet skickas vidare från servern till kellnerwines.se, som sparar det
// under Förfrågningar i admin och mejlar en notis. Besökaren ser aldrig vart det går, och
// Naturvinstipset behöver inga egna mejluppgifter.

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TARGET = "https://www.kellnerwines.se/api/forfragan";
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Ogiltig förfrågan" }, { status: 400 });
  // Fält som människor inte ser; fylls det i är det en robot.
  if (text(body.website, 200)) return NextResponse.json({ ok: true });

  const name = text(body.name, 120);
  const email = text(body.email, 200);
  const message = text(body.message, 2800);
  const subject = text(body.subject, 60);
  if (!name || !email || !message) return NextResponse.json({ error: "Fyll i namn, mejl och meddelande" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Kontrollera mejladressen" }, { status: 400 });

  const res = await fetch(TARGET, {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "NaturvinstipsetBot/1.0 (+https://www.naturvinstipset.se/om-oss)" },
    body: JSON.stringify({
      type: "naturvinstipset",
      name,
      email,
      message: subject ? `Ämne: ${subject}\n\n${message}` : message,
      page: `naturvinstipset.se${text(body.page, 150)}`,
    }),
  }).catch(() => null);
  if (!res?.ok) return NextResponse.json({ error: "Något gick fel, försök igen." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
