"use client";

import dynamic from "next/dynamic";
import { ProfileTabs } from "@/components/elephants/ProfileTabs";
import { ElephantDetailPanels } from "@/components/elephants/ElephantDetailPanels";
import { ElephantEnrichmentStory } from "@/components/elephants/ElephantEnrichmentStory";
import { ElephantUnnamedBanner } from "@/components/elephants/ElephantUnnamedBanner";
import { ContributionActivity } from "@/components/elephants/ContributionActivity";
import type { ElephantEnrichment } from "@/types/enrichment";
import type { ContributionRecord } from "@/types/contribution";
import type { ElephantPhoto, ElephantRecord } from "@/types/elephant";
import type { Sanctuary } from "@/data/sanctuaries";

const ElephantLineageSection = dynamic(
  () =>
    import("@/components/elephants/ElephantLineageSection").then((m) => m.ElephantLineageSection),
  { loading: () => <TabLoading /> }
);
const ElephantHerdSection = dynamic(
  () => import("@/components/elephants/ElephantHerdSection").then((m) => m.ElephantHerdSection),
  { loading: () => <TabLoading /> }
);
const ElephantPhotoGallery = dynamic(
  () => import("@/components/elephants/ElephantPhotoGallery").then((m) => m.ElephantPhotoGallery),
  { loading: () => <TabLoading /> }
);

interface ElephantProfileTabsProps {
  elephant: ElephantRecord;
  enrichment: ElephantEnrichment | null;
  unnamed: boolean;
  linkedSanctuaries: Sanctuary[];
  father: ElephantRecord | null;
  mother: ElephantRecord | null;
  offspring: ElephantRecord[];
  herdMates: ElephantRecord[];
  photos: ElephantPhoto[];
  displayName: string;
  activity: ContributionRecord[];
}

function TabLoading() {
  return <p className="text-sm text-slate-500 py-8">Loading…</p>;
}

export function ElephantProfileTabs({
  elephant,
  enrichment,
  unnamed,
  linkedSanctuaries,
  father,
  mother,
  offspring,
  herdMates,
  photos,
  displayName,
  activity,
}: ElephantProfileTabsProps) {
  return (
    <ProfileTabs
      overview={
        <div className="space-y-8">
          {enrichment && <ElephantEnrichmentStory enrichment={enrichment} />}
          {unnamed && !enrichment && <ElephantUnnamedBanner elephant={elephant} />}
          <ElephantDetailPanels elephant={elephant} linkedSanctuaries={linkedSanctuaries} />
        </div>
      }
      lineage={
        <ElephantLineageSection
          elephant={elephant}
          father={father}
          mother={mother}
          offspring={offspring}
        />
      }
      herd={<ElephantHerdSection elephant={elephant} herdMates={herdMates} />}
      photos={
        photos.length > 0 ? (
          <ElephantPhotoGallery photos={photos} elephantName={displayName} />
        ) : (
          <p className="text-sm text-slate-500">No photos yet for this record.</p>
        )
      }
      activity={
        <ContributionActivity contributions={activity} syncedAt={elephant.syncedAt} />
      }
    />
  );
}
