import { NextRequest, NextResponse } from "next/server";
import { searchElephants } from "@/lib/elephants";
import type {
  ElephantCategory,
  ElephantSex,
  ElephantSort,
  ElephantStatus,
  ElephantSubspecies,
} from "@/types/elephant";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const result = await searchElephants({
    q: searchParams.get("q") ?? undefined,
    country: searchParams.get("country") ?? undefined,
    status: (searchParams.get("status") as ElephantStatus) ?? undefined,
    sex: (searchParams.get("sex") as ElephantSex) ?? undefined,
    subspecies: (searchParams.get("subspecies") as ElephantSubspecies) ?? undefined,
    locationId: searchParams.get("locationId") ?? undefined,
    locationName:
      searchParams.get("locationName") ?? searchParams.get("location") ?? undefined,
    category: (searchParams.get("category") as ElephantCategory) ?? undefined,
    sort: (searchParams.get("sort") as ElephantSort) ?? undefined,
    namedOnly: searchParams.get("includeUnnamed") !== "true",
    hasStory: searchParams.get("hasStory") === "true",
    page: Number(searchParams.get("page") ?? 1),
    perPage: Number(searchParams.get("perPage") ?? 24),
  });

  return NextResponse.json(result);
}
