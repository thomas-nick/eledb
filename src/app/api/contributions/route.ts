import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createContribution,
  pickOverrideChanges,
} from "@/lib/contribution-db";
import { getElephantById } from "@/lib/elephants";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const elephantId = String(body.elephantId ?? "").trim();
    const changes = pickOverrideChanges(body.changes ?? {});

    if (!elephantId) {
      return NextResponse.json({ error: "elephantId is required" }, { status: 400 });
    }
    if (Object.keys(changes).length === 0) {
      return NextResponse.json({ error: "No valid changes provided" }, { status: 400 });
    }

    const elephant = await getElephantById(elephantId);
    if (!elephant) {
      return NextResponse.json({ error: "Elephant not found" }, { status: 404 });
    }

    const contribution = await createContribution({
      elephantId,
      userId: session.user.id,
      type: "info",
      payload: { changes },
    });

    return NextResponse.json({ ok: true, contribution });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
