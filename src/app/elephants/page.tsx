import { Suspense } from "react";
import { ElephantSearch } from "@/components/elephants/ElephantSearch";
import { ExplorePageHeader } from "@/components/layout/ExplorePageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Elephant Database",
  description:
    "Search named Asian elephants — births, transfers, parentage, and camp history. Data from elephant.se, reformatted for easy browsing across 13 range countries.",
  path: "/elephants",
});

export default function ElephantsPage() {
  return (
    <>
      <ExplorePageHeader
        eyebrow="Database"
        title="Asian Elephant Records"
        description="Individual records from elephant.se — births, transfers, parentage, chip IDs, and camp history across 13 range countries and zoos worldwide."
      />
      <Suspense
        fallback={
          <div className="py-24 text-center text-slate-500 bg-slate-50">Loading database...</div>
        }
      >
        <ElephantSearch />
      </Suspense>
    </>
  );
}
