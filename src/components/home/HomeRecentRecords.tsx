import Link from "next/link";
import { searchElephants } from "@/lib/elephants";
import { displayElephantName } from "@/lib/elephantNames";

export async function HomeRecentRecords() {
  const { elephants } = await searchElephants({
    sort: "updated",
    perPage: 6,
    namedOnly: true,
  });

  if (elephants.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
        <h2 className="text-sm font-semibold text-slate-900">Recently updated records</h2>
        <Link href="/elephants?sort=updated" className="text-xs font-medium text-forest hover:underline">
          View all →
        </Link>
      </div>
      <ul className="divide-y divide-slate-100">
        {elephants.map((e) => (
          <li key={e.id}>
            <Link
              href={`/elephants/${e.id}`}
              className="flex items-center justify-between gap-4 px-4 py-2.5 hover:bg-slate-50 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {displayElephantName(e)}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {e.locationName} · {e.country}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-400 capitalize">{e.status}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
