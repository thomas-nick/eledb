import { NextResponse } from "next/server";
import { auth, isModerator } from "@/auth";
import {
  approveContribution,
  getContributionById,
  rejectContribution,
} from "@/lib/contribution-db";
import { deleteUploadFile } from "@/lib/uploads";
import type { PhotoContributionPayload } from "@/types/contribution";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const action = body.action as "approve" | "reject";
  const reviewNote = body.reviewNote ? String(body.reviewNote) : undefined;

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const existing = await getContributionById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contribution =
    action === "approve"
      ? await approveContribution(id, session.user.id, reviewNote)
      : await rejectContribution(id, session.user.id, reviewNote);

  if (!contribution) {
    return NextResponse.json({ error: "Could not update contribution" }, { status: 400 });
  }

  if (action === "reject" && contribution.type === "photo") {
    const payload = contribution.payload as PhotoContributionPayload;
    await deleteUploadFile(payload.filePath);
  }

  return NextResponse.json({ contribution });
}
