import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isCampManager, pickProfileChanges, upsertCampProfile } from "@/lib/camp-db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { locationId } = await params;

  if (!(await isCampManager(session.user.id, locationId))) {
    return NextResponse.json(
      { error: "You are not a verified manager of this camp" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const changes = pickProfileChanges(body.changes ?? body ?? {});
    if (Object.keys(changes).length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
    }

    const profile = await upsertCampProfile({
      locationId,
      changes,
      updatedBy: session.user.id,
    });
    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
