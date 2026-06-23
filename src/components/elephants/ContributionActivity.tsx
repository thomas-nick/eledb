import Link from "next/link";
import type { ContributionRecord } from "@/types/contribution";

interface ContributionActivityProps {
  contributions: ContributionRecord[];
  syncedAt: string;
}

export function ContributionActivity({ contributions, syncedAt }: ContributionActivityProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">Data freshness</p>
        <p className="mt-1 text-sm text-slate-500">
          elephant.se sync:{" "}
          <time dateTime={syncedAt}>{new Date(syncedAt).toLocaleDateString()}</time>
        </p>
      </div>

      {contributions.length === 0 ? (
        <p className="text-sm text-slate-500">No community updates published yet for this record.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {contributions.map((c) => (
            <li key={c.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {c.type === "photo" ? "Photo added" : "Record updated"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.userName ?? c.userEmail ?? "Community member"}
                    {c.reviewedAt && (
                      <>
                        {" "}
                        · {new Date(c.reviewedAt).toLocaleDateString()}
                      </>
                    )}
                  </p>
                </div>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Approved
                </span>
              </div>
              {c.type === "info" && "changes" in c.payload && (
                <p className="mt-2 text-xs text-slate-600 font-mono">
                  {Object.keys(c.payload.changes).join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-slate-500">
        Want to help?{" "}
        <Link href="#contribute" className="text-forest hover:underline">
          Add a photo or suggest an edit
        </Link>
        .
      </p>
    </div>
  );
}
