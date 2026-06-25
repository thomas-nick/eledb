import { NextResponse } from "next/server";
import { auth, isModerator } from "@/auth";
import { listPendingClaims } from "@/lib/camp-db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const claims = await listPendingClaims();
  return NextResponse.json({ claims });
}
