import { NextRequest, NextResponse } from "next/server";
import { globalSearch } from "@/lib/typesense-search";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? 5), 10);

  const result = await globalSearch(q, limit);
  return NextResponse.json(result);
}
