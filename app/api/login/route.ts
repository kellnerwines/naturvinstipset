import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.NVT_ADMIN_PASSWORD
  ) {
    await setSession();
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Fel användarnamn eller lösenord" }, { status: 401 });
}
