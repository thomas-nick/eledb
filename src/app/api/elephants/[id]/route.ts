import { NextResponse } from "next/server";
import { getElephantById } from "@/lib/elephants";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const elephant = await getElephantById(id);

  if (!elephant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(elephant);
}
