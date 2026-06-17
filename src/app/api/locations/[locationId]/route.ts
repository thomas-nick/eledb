import { NextResponse } from "next/server";
import { getLocation } from "@/lib/locations";

interface RouteParams {
  params: Promise<{ locationId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { locationId } = await params;
  const location = await getLocation(locationId);
  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }
  return NextResponse.json(location);
}
