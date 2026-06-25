import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { CampClaimForm } from "@/components/camps/CampClaimForm";
import { getClaimByUserAndLocation, isCampManager } from "@/lib/camp-db";
import { getLocation } from "@/lib/locations";

export const dynamic = "force-dynamic";

interface ClaimPageProps {
  params: Promise<{ locationId: string }>;
}

export default async function ClaimPage({ params }: ClaimPageProps) {
  const { locationId } = await params;
  const location = await getLocation(locationId);
  if (!location) notFound();

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/claim/${locationId}`);
  }

  if (await isCampManager(session.user.id, locationId)) {
    redirect(`/manage/camps/${locationId}`);
  }

  const existing = await getClaimByUserAndLocation(session.user.id, locationId);
  const pending = existing?.status === "pending";

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container size="narrow" className="py-16">
        <div className="max-w-xl mx-auto">
          <Link
            href={`/camps/${locationId}`}
            className="text-sm text-slate-500 hover:text-forest mb-4 inline-block"
          >
            ← Back to camp
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">
            Claim {location.displayName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Verify your connection to this camp to manage its profile and elephant records. Edits by
            verified managers publish instantly.
          </p>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
            {pending ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                You already have a pending claim for this camp. We&apos;ll be in touch once it&apos;s
                reviewed.
              </div>
            ) : (
              <CampClaimForm locationId={locationId} campName={location.displayName} />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
