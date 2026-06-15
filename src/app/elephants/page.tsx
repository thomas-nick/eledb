import { Suspense } from "react";
import type { Metadata } from "next";
import { ElephantSearch } from "@/components/elephants/ElephantSearch";

export const metadata: Metadata = {
  title: "Elephant Database",
  description:
    "Search named Asian elephants — births, transfers, parentage, and camp history. Data from elephant.se, reformatted for easy browsing.",
};

export default function ElephantsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-muted">Loading database...</div>}>
      <ElephantSearch />
    </Suspense>
  );
}
