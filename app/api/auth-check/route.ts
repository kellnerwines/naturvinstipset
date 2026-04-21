import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  if (await isAuthenticated()) return NextResponse.json({ ok: true });
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
