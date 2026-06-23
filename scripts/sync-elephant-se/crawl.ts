import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { upsertElephants } from "../../src/lib/elephant-db";
import type { ElephantRecord } from "../../src/types/elephant";
import { fetchText } from "./discover";
import { parseElephantPage } from "./parse";
import { DEFAULT_MAX_ELEPHANT_ID, elephantPageUrl, sleep } from "./types";

const CHECKPOINT_PATH = resolve(__dirname, ".checkpoint.json");
const BATCH_SIZE = Number(process.env.SYNC_BATCH_SIZE ?? 50);
const RETRY_COUNT = 3;
const SEED_SAMPLE_SIZE = 100;

export interface CrawlRunResult {
  checkpoint: CrawlCheckpoint;
  syncedThisRun: number;
  idsTriedThisRun: number;
}

export interface CrawlCheckpoint {
  lastId: number;
  maxId: number;
  asianCount: number;
  skippedCount: number;
  failedIds: string[];
  startedAt: string;
  updatedAt: string;
}

function freshCheckpoint(maxId: number): CrawlCheckpoint {
  return {
    lastId: 0,
    maxId,
    asianCount: 0,
    skippedCount: 0,
    failedIds: [],
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function loadCheckpoint(maxId: number): CrawlCheckpoint {
  if (existsSync(CHECKPOINT_PATH)) {
    const raw = readFileSync(CHECKPOINT_PATH, "utf8").trim();
    if (raw) return JSON.parse(raw) as CrawlCheckpoint;
  }
  return freshCheckpoint(maxId);
}

function saveCheckpoint(cp: CrawlCheckpoint) {
  cp.updatedAt = new Date().toISOString();
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(cp, null, 2));
}

async function fetchWithRetry(id: string, delayMs: number): Promise<string | null> {
  for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
    try {
      await sleep(delayMs);
      return await fetchText(elephantPageUrl(id));
    } catch (err) {
      if (attempt === RETRY_COUNT) {
        console.warn(`\nFailed ${id} after ${RETRY_COUNT} attempts:`, err);
        return null;
      }
      await sleep(delayMs * attempt);
    }
  }
  return null;
}

export async function runWorldwideCrawl(options: {
  delayMs: number;
  maxId?: number;
  reset?: boolean;
}) {
  const maxId = options.maxId ?? Number(process.env.SYNC_MAX_ID ?? DEFAULT_MAX_ELEPHANT_ID);
  const delayMs = options.delayMs;

  if (options.reset && existsSync(CHECKPOINT_PATH)) {
    writeFileSync(CHECKPOINT_PATH, "");
  }

  let checkpoint = loadCheckpoint(maxId);
  if (options.reset) {
    checkpoint = freshCheckpoint(maxId);
  } else if (checkpoint.lastId >= maxId) {
    console.log("Previous crawl complete — starting fresh weekly refresh");
    checkpoint = freshCheckpoint(maxId);
  }

  const maxRuntimeMs = Number(process.env.SYNC_MAX_RUNTIME_MS ?? 0);
  const crawlStartedAt = Date.now();
  const startId = checkpoint.lastId + 1;
  const batch: ElephantRecord[] = [];
  const seedSample: ElephantRecord[] = [];
  let syncedThisRun = 0;
  let idsTriedThisRun = 0;

  console.log(
    `Worldwide Asian elephant crawl: IDs ${startId}–${maxId} (checkpoint: ${checkpoint.asianCount} Asian so far)`
  );

  try {
    for (let id = startId; id <= maxId; id++) {
      idsTriedThisRun++;
      if (maxRuntimeMs > 0 && Date.now() - crawlStartedAt >= maxRuntimeMs) {
        console.log(`\nStopping at ID ${id - 1} (SYNC_MAX_RUNTIME_MS reached)`);
        break;
      }
      if (id % 100 === 0) {
        process.stdout.write(
          `\rID ${id}/${maxId} — ${checkpoint.asianCount} Asian, ${checkpoint.skippedCount} skipped`
        );
      }

      const html = await fetchWithRetry(String(id), delayMs);
      if (!html) {
        checkpoint.failedIds.push(String(id));
        checkpoint.lastId = id;
        if (id % 50 === 0) saveCheckpoint(checkpoint);
        continue;
      }

      const parsed = parseElephantPage(html, String(id));
      checkpoint.lastId = id;

      if (!parsed) {
        checkpoint.skippedCount++;
        if (id % 100 === 0) saveCheckpoint(checkpoint);
        continue;
      }

      batch.push(parsed);
      checkpoint.asianCount++;
      syncedThisRun++;
      if (seedSample.length < SEED_SAMPLE_SIZE) seedSample.push(parsed);

      if (batch.length >= BATCH_SIZE) {
        await upsertElephants(batch);
        batch.length = 0;
        saveCheckpoint(checkpoint);
      } else if (id % 25 === 0) {
        saveCheckpoint(checkpoint);
      }
    }
  } finally {
    if (batch.length > 0) await upsertElephants(batch);
    saveCheckpoint(checkpoint);
  }

  const done = checkpoint.lastId >= maxId;
  console.log(
    done
      ? `\nCrawl complete: ${checkpoint.asianCount} Asian elephants, ${checkpoint.skippedCount} skipped, ${checkpoint.failedIds.length} failed`
      : `\nCrawl paused at ID ${checkpoint.lastId}: ${checkpoint.asianCount} Asian elephants, ${checkpoint.skippedCount} skipped, ${checkpoint.failedIds.length} failed`
  );

  const seedPath = resolve(process.cwd(), "src/data/elephantsSeed.json");
  writeFileSync(seedPath, JSON.stringify(seedSample, null, 2));
  console.log(`Wrote ${seedSample.length} sample records → ${seedPath}`);

  return { checkpoint, syncedThisRun, idsTriedThisRun };
}
