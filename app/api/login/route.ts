import { NextRequest, NextResponse } from "next/server";
import { checkCredentials, setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({}));
  if (checkCredentials(username, password) && (await setSession())) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Fel användarnamn eller lösenord" }, { status: 401 });
}
