import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createContribution } from "@/lib/contribution-db";
import { getElephantById } from "@/lib/elephants";
import { processAndSavePhoto } from "@/lib/uploads";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const elephantId = String(form.get("elephantId") ?? "").trim();
    const file = form.get("file");

    if (!elephantId) {
      return NextResponse.json({ error: "elephantId is required" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const elephant = await getElephantById(elephantId);
    if (!elephant) {
      return NextResponse.json({ error: "Elephant not found" }, { status: 404 });
    }

    const { filePath, publicUrl } = await processAndSavePhoto(file, elephantId);
    const credit = form.get("credit") ? String(form.get("credit")).trim() : undefined;
    const caption = form.get("caption") ? String(form.get("caption")).trim() : undefined;

    const contribution = await createContribution({
      elephantId,
      userId: session.user.id,
      type: "photo",
      payload: { filePath, publicUrl, credit, caption },
    });

    return NextResponse.json({ ok: true, contribution });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
