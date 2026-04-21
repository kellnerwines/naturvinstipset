import { NextRequest, NextResponse } from "next/server";
import { get as blobGet } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("Missing url", { status: 400 });

  if (!url.includes("blob.vercel-storage.com")) {
    return NextResponse.redirect(url);
  }

  try {
    const result = await blobGet(url, { access: "private" });
    if (!result || result.statusCode !== 200)
      return new NextResponse("Not found", { status: 404 });
    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType ?? "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Failed", { status: 500 });
  }
}
