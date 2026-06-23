import { Container } from "@/components/ui/Container";
import { HomeExploreNav } from "@/components/home/HomeExploreNav";
import { HomeSearch } from "@/components/home/HomeSearch";
import { HomeStatsGrid } from "@/components/home/HomeStatsGrid";
import { HomeRecentRecords } from "@/components/home/HomeRecentRecords";
import { getSiteStats } from "@/lib/siteStats";
import { SITE_NAME } from "@/lib/site";

export async function HomePortal() {
  const stats = await getSiteStats();

  return (
    <div className="bg-slate-50">
      <section className="home-portal-hero border-b border-border">
        <Container size="wide" className="pt-8 md:pt-10 pb-0">
          <p className="text-xs font-semibold tracking-widest text-forest mb-2">
            {SITE_NAME}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Everything Asian elephants
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
            Search {stats.named.toLocaleString()}+ named individuals across camps, sanctuaries,
            and range countries — plus field notes, corridor maps, and visit planning.
          </p>
          <div className="mt-6">
            <HomeExploreNav />
          </div>
        </Container>

        <Container size="wide" className="py-6 md:py-8">
          <HomeSearch />
        </Container>
      </section>

      <section className="py-6 md:py-8">
        <Container size="wide">
          <div className="flex items-baseline justify-between gap-4 mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Database overview</h2>
            {stats.source === "mysql" && (
              <span className="text-xs text-slate-400">Live from elephant.se sync</span>
            )}
          </div>
          <HomeStatsGrid stats={stats} />
        </Container>
      </section>

      <section className="pb-8 md:pb-10">
        <Container size="wide">
          <HomeRecentRecords />
        </Container>
      </section>
    </div>
  );
}
