import { NextResponse } from "next/server";
import { auth, isModerator } from "@/auth";
import { listPendingContributions } from "@/lib/contribution-db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contributions = await listPendingContributions();
  return NextResponse.json({ contributions });
}
