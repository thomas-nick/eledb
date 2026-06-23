import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listContributionsByUser } from "@/lib/contribution-db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const contributions = await listContributionsByUser(session.user.id);
  return NextResponse.json({ contributions });
}
