import { config } from "dotenv";
import { resolve } from "path";
import { writeFileSync } from "fs";
import type { ElephantEnrichment } from "../../src/types/enrichment";
import { migrateEnrichmentSchema, upsertEnrichments } from "../../src/lib/elephant-enrichment-db";
import { isMysqlConfigured } from "../../src/lib/elephant-db";
import { matchElephantId } from "./match";
import { sanctuarySources, sanctuarySourceMap } from "./sources";
import { discoverAndParsePhuketProfiles } from "./sources/phuket";
import type { ImportResult, SanctuaryImportSource } from "./types";
import { fetchHtml, IMPORT_DELAY_MS, sleep } from "./utils";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function importSource(source: SanctuaryImportSource): Promise<ImportResult> {
  console.log(`\n── ${source.label} (${source.id}) ──\n`);

  const records: ElephantEnrichment[] = [];
  const orphans: string[] = [];
  const now = new Date().toISOString();

  if (source.id === "phuket-elephant-sanctuary") {
    const parsed = await discoverAndParsePhuketProfiles();
    for (const partial of parsed) {
      const elephantId = await matchElephantId({
        displayName: partial.displayName,
        source: source.id,
        slug: partial.sourceSlug,
        locationId: partial.locationId ?? source.locationId,
      });
      const record: ElephantEnrichment = {
        id: `${source.id}:${partial.sourceSlug}`,
        source: source.id,
        elephantId,
        locationId: partial.locationId ?? source.locationId,
        syncedAt: now,
        ...partial,
      };
      records.push(record);
      logRecord(record, orphans);
    }
  } else {
    const profiles = await source.discoverProfiles();
    console.log(`Found ${profiles.length} profiles\n`);

    for (const profile of profiles) {
      try {
        await sleep(IMPORT_DELAY_MS);
        const html = await fetchHtml(profile.url);
        const partial = source.parseProfile(html, profile);
        const elephantId = await matchElephantId({
          displayName: partial.displayName,
          source: source.id,
          slug: profile.slug,
          locationId: partial.locationId ?? source.locationId,
          country: source.matchCountry,
        });
        const record: ElephantEnrichment = {
          id: `${source.id}:${profile.slug}`,
          source: source.id,
          elephantId,
          locationId: partial.locationId ?? source.locationId,
          syncedAt: now,
          ...partial,
        };
        records.push(record);
        logRecord(record, orphans);
      } catch (err) {
        console.error(`✗ ${profile.slug}:`, err instanceof Error ? err.message : err);
      }
    }
  }

  return {
    source: source.id,
    records,
    linked: records.filter((r) => r.elephantId).length,
    orphans,
  };
}

function logRecord(record: ElephantEnrichment, orphans: string[]) {
  if (record.elephantId) {
    console.log(`✓ ${record.displayName} → elephant.se #${record.elephantId}`);
  } else {
    orphans.push(record.displayName);
    console.log(`○ ${record.displayName} (no elephant.se link)`);
  }
}

export async function runSanctuaryImport(sourceIds?: string[]) {
  if (!isMysqlConfigured()) {
    throw new Error("MySQL not configured — set MYSQL_* in .env.local");
  }

  await migrateEnrichmentSchema();

  const selected = sourceIds?.length
    ? sourceIds.map((id) => {
        const source = sanctuarySourceMap[id];
        if (!source) throw new Error(`Unknown source: ${id}`);
        return source;
      })
    : sanctuarySources;

  const allRecords: ElephantEnrichment[] = [];
  const summary: ImportResult[] = [];

  for (const source of selected) {
    const result = await importSource(source);
    allRecords.push(...result.records);
    summary.push(result);
    console.log(`\n${result.records.length} imported, ${result.linked} linked`);
    if (result.orphans.length) {
      console.log(`Unlinked: ${result.orphans.join(", ")}`);
    }
  }

  await upsertEnrichments(allRecords);

  const reviewPath = resolve(process.cwd(), "scripts/sanctuary-import/.last-import-review.json");
  writeFileSync(
    reviewPath,
    JSON.stringify(
      {
        importedAt: new Date().toISOString(),
        summary,
        orphans: summary.flatMap((s) => s.orphans),
      },
      null,
      2
    )
  );

  console.log(`\n✅ Total: ${allRecords.length} enrichments upserted`);
  console.log(`Review file: ${reviewPath}`);

  return summary;
}

if (process.argv[1]?.includes("sanctuary-import/run")) {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  runSanctuaryImport(args.length ? args : undefined).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
