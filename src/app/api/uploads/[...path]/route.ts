import { NextResponse } from "next/server";
import { readUploadFile, uploadContentType } from "@/lib/uploads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  if (!segments?.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const relativePath = segments.join("/");
  if (relativePath.includes("..")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  try {
    const buffer = await readUploadFile(relativePath);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": uploadContentType(relativePath),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
