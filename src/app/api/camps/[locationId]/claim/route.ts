import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createCampClaim,
  getClaimByUserAndLocation,
  isCampManager,
} from "@/lib/camp-db";
import { getLocation } from "@/lib/locations";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { locationId } = await params;

  const location = await getLocation(locationId);
  if (!location) {
    return NextResponse.json({ error: "Camp not found" }, { status: 404 });
  }

  if (await isCampManager(session.user.id, locationId)) {
    return NextResponse.json(
      { error: "You already manage this camp" },
      { status: 409 }
    );
  }

  const existing = await getClaimByUserAndLocation(session.user.id, locationId);
  if (existing && existing.status === "pending") {
    return NextResponse.json(
      { error: "You already have a pending claim for this camp" },
      { status: 409 }
    );
  }

  try {
    const body = await request.json();
    const claim = await createCampClaim({
      locationId,
      locationName: location.displayName ?? location.name,
      userId: session.user.id,
      roleAtCamp: body.roleAtCamp ? String(body.roleAtCamp).trim() : undefined,
      contact: body.contact ? String(body.contact).trim() : undefined,
      message: body.message ? String(body.message).trim() : undefined,
    });
    return NextResponse.json({ ok: true, claim });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Claim failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
