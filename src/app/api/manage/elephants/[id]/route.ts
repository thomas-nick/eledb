import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isCampManager } from "@/lib/camp-db";
import { pickOverrideChanges, writeElephantOverride } from "@/lib/contribution-db";
import { getElephantById } from "@/lib/elephants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { id } = await params;

  const elephant = await getElephantById(id);
  if (!elephant) {
    return NextResponse.json({ error: "Elephant not found" }, { status: 404 });
  }
  if (!elephant.locationId) {
    return NextResponse.json(
      { error: "This record is not linked to a camp" },
      { status: 400 }
    );
  }

  if (!(await isCampManager(session.user.id, elephant.locationId))) {
    return NextResponse.json(
      { error: "You are not a verified manager of this camp" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const changes = pickOverrideChanges(body.changes ?? {});
    if (Object.keys(changes).length === 0) {
      return NextResponse.json({ error: "No valid changes provided" }, { status: 400 });
    }

    const override = await writeElephantOverride({
      elephantId: id,
      changes,
      updatedBy: session.user.id,
    });
    return NextResponse.json({ ok: true, override });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
