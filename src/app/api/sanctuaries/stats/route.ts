import { NextResponse } from "next/server";
import { getSanctuaryElephantCounts } from "@/lib/sanctuaryStats";

export async function GET() {
  try {
    const counts = await getSanctuaryElephantCounts();
    return NextResponse.json({ counts });
  } catch {
    return NextResponse.json({ counts: {} });
  }
}
