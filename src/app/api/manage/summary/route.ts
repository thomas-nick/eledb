import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listManagedLocationIds } from "@/lib/camp-db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }
  const ids = await listManagedLocationIds(session.user.id);
  return NextResponse.json({ count: ids.length });
}
