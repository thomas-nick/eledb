import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { listManagedLocationIds } from "@/lib/camp-db";
import { getLocation } from "@/lib/locations";

export const dynamic = "force-dynamic";

export default async function ManageDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/manage");
  }

  const locationIds = await listManagedLocationIds(session.user.id);
  const locations = (
    await Promise.all(locationIds.map((id) => getLocation(id)))
  ).filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <div className="bg-slate-50 min-h-screen">
      <Container size="wide" className="py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Manage your camps</h1>
        <p className="mt-1 text-sm text-slate-500">
          Camps you have been verified to manage. Update profiles and elephant records here.
        </p>

        {locations.length === 0 ? (
          <Card className="mt-8 p-8 text-center">
            <p className="text-slate-700 font-medium">You don&apos;t manage any camps yet.</p>
            <p className="mt-1 text-sm text-slate-500">
              Find your camp in the directory and submit a claim to get started.
            </p>
            <Link
              href="/camps"
              className="mt-4 inline-flex rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white"
            >
              Browse camps
            </Link>
          </Card>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {locations.map((loc) => (
              <Link key={loc.id} href={`/manage/camps/${loc.id}`}>
                <Card className="p-5 h-full hover:border-forest transition-colors">
                  <h2 className="font-serif text-lg font-bold text-forest">{loc.displayName}</h2>
                  <p className="text-sm text-muted mt-1">{loc.country}</p>
                  <p className="text-xs text-slate-500 mt-3">
                    {loc.elephantCount.toLocaleString()} records · {loc.livingCount.toLocaleString()}{" "}
                    living
                  </p>
                  <span className="mt-4 inline-block text-sm text-clay font-medium">Manage →</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
