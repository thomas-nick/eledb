import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { CampProfileForm } from "@/components/camps/CampProfileForm";
import {
  CampElephantManager,
  type RosterElephant,
} from "@/components/camps/CampElephantManager";
import { isCampManager } from "@/lib/camp-db";
import { getLocation } from "@/lib/locations";
import { searchElephants } from "@/lib/elephants";

export const dynamic = "force-dynamic";

interface ManageCampPageProps {
  params: Promise<{ locationId: string }>;
}

export default async function ManageCampPage({ params }: ManageCampPageProps) {
  const { locationId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/manage/camps/${locationId}`);
  }

  if (!(await isCampManager(session.user.id, locationId))) {
    redirect("/manage");
  }

  const location = await getLocation(locationId);
  if (!location) notFound();

  const { elephants } = await searchElephants({
    locationId,
    sort: "name",
    perPage: 250,
  });

  const roster: RosterElephant[] = elephants.map((e) => ({
    id: e.id,
    name: e.name,
    sex: e.sex,
    status: e.status,
    ageYears: e.ageYears,
    birthDate: e.birthDate,
    management: e.management,
    source: e.id.startsWith("camp_") ? "camp" : undefined,
  }));

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container size="wide" className="py-12">
        <Link href="/manage" className="text-sm text-slate-500 hover:text-forest mb-4 inline-block">
          ← All camps
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{location.displayName}</h1>
            <p className="mt-1 text-sm text-slate-500">{location.country}</p>
          </div>
          <Link
            href={`/camps/${locationId}`}
            target="_blank"
            className="text-sm text-clay hover:text-forest font-medium"
          >
            View public page ↗
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Camp profile</h2>
            <Card className="p-6">
              <CampProfileForm locationId={locationId} profile={location.profile} />
            </Card>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Elephants
              <span className="text-slate-400 font-normal text-sm ml-2">
                ({roster.length.toLocaleString()})
              </span>
            </h2>
            <CampElephantManager locationId={locationId} elephants={roster} />
          </section>
        </div>
      </Container>
    </div>
  );
}
