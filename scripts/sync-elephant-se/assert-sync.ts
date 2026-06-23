/** Exit non-zero when a sync run clearly failed to import any records. */
export function failIfNoSync(synced: number, tried: number, label: string): void {
  if (synced > 0) {
    console.log(`${label}: imported ${synced} record(s)`);
    return;
  }
  if (tried < 10) {
    console.warn(`${label}: no records imported (${tried} ids tried — too few to judge)`);
    return;
  }
  console.error(`${label}: FAILED — 0 records imported after ${tried} attempts`);
  process.exit(1);
}
