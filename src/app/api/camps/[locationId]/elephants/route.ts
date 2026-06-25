import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createCampElephant, isCampManager } from "@/lib/camp-db";
import { getLocation } from "@/lib/locations";
import type {
  ElephantOrigin,
  ElephantSex,
  ElephantStatus,
  ElephantSubspecies,
} from "@/types/elephant";

const SEXES: ElephantSex[] = ["male", "female", "unknown"];
const STATUSES: ElephantStatus[] = ["living", "deceased"];
const ORIGINS: ElephantOrigin[] = ["wild-caught", "captive-born", "unknown"];
const SUBSPECIES: ElephantSubspecies[] = [
  "indian",
  "sri-lankan",
  "sumatran",
  "borneo",
  "unknown",
];

function pickEnum<T extends string>(value: unknown, allowed: T[]): T | undefined {
  const v = String(value ?? "").trim();
  return allowed.includes(v as T) ? (v as T) : undefined;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { locationId } = await params;

  if (!(await isCampManager(session.user.id, locationId))) {
    return NextResponse.json(
      { error: "You are not a verified manager of this camp" },
      { status: 403 }
    );
  }

  const location = await getLocation(locationId);
  if (!location) {
    return NextResponse.json({ error: "Camp not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const ageYears =
      body.ageYears !== undefined && body.ageYears !== null && body.ageYears !== ""
        ? Number(body.ageYears)
        : undefined;

    const { id } = await createCampElephant({
      locationId,
      locationName: location.name,
      country: location.country,
      category: location.category,
      name,
      sex: pickEnum(body.sex, SEXES),
      status: pickEnum(body.status, STATUSES),
      subspecies: pickEnum(body.subspecies, SUBSPECIES),
      birthDate: body.birthDate ? String(body.birthDate).trim() : undefined,
      ageYears: Number.isFinite(ageYears) ? ageYears : undefined,
      origin: pickEnum(body.origin, ORIGINS),
      management: body.management ? String(body.management).trim() : undefined,
      sourceUrl: `/camps/${locationId}`,
    });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
