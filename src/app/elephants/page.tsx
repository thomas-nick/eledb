import { Suspense } from "react";
import type { Metadata } from "next";
import { ElephantSearch } from "@/components/elephants/ElephantSearch";
import { ExplorePageHeader } from "@/components/layout/ExplorePageHeader";

export const metadata: Metadata = {
  title: "Elephant Database",
  description:
    "Search named Asian elephants — births, transfers, parentage, and camp history. Data from elephant.se, reformatted for easy browsing.",
};

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
