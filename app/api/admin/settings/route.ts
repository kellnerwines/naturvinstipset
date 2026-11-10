// Sajtinställningar från admin (BRIEF-KOMPASSEN.md, 7.1): ersättning från webbutiker av/på.

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/blob";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  const current = await getSettings();
  const v = form?.get("retailerCompensation");
  const next = { ...current, ...(v === "true" || v === "false" ? { retailerCompensation: v === "true" } : {}) };
  await saveSettings(next);
  revalidatePath("/", "layout");
  return NextResponse.redirect(new URL("/admin/klick", req.url), 303);
}
