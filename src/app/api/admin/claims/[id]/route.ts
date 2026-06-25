import { NextResponse } from "next/server";
import { auth, isModerator } from "@/auth";
import { approveClaim, getClaimById, rejectClaim } from "@/lib/camp-db";

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

  const existing = await getClaimById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const claim =
    action === "approve"
      ? await approveClaim(id, session.user.id, reviewNote)
      : await rejectClaim(id, session.user.id, reviewNote);

  if (!claim) {
    return NextResponse.json({ error: "Could not update claim" }, { status: 400 });
  }

  return NextResponse.json({ claim });
}
