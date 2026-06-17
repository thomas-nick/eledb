import { NextRequest, NextResponse } from "next/server";
import { listLocations } from "@/lib/locations";
import type { ElephantCategory } from "@/types/elephant";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const result = await listLocations({
    country: searchParams.get("country") ?? undefined,
    category: (searchParams.get("category") as ElephantCategory) ?? undefined,
    q: searchParams.get("q") ?? undefined,
    limit: Number(searchParams.get("limit") ?? 30),
    offset: Number(searchParams.get("offset") ?? 0),
  });

  return NextResponse.json(result);
}
