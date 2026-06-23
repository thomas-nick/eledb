"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ContributionRecord } from "@/types/contribution";
import { Container } from "@/components/ui/Container";

export default function MyContributionsPage() {
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contributions/mine")
      .then((r) => {
        if (r.status === 401) {
          window.location.href = "/login?callbackUrl=/contributions";
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setContributions(data.contributions ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <Container size="narrow">
        <h1 className="text-2xl font-semibold text-slate-900">My contributions</h1>
        <p className="mt-1 text-sm text-slate-500">Track your submitted photos and edits.</p>

        {loading && <p className="mt-8 text-slate-500">Loading...</p>}

        {!loading && contributions.length === 0 && (
          <p className="mt-8 text-slate-500">
            No submissions yet.{" "}
            <Link href="/elephants" className="text-forest hover:underline">
              Browse elephants
            </Link>{" "}
            to contribute.
          </p>
        )}

        <ul className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {contributions.map((c) => (
            <li key={c.id} className="px-4 py-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  {c.type === "photo" ? "Photo" : "Info edit"} ·{" "}
                  <Link href={`/elephants/${c.elephantId}`} className="text-forest hover:underline">
                    Elephant #{c.elephantId}
                  </Link>
                </p>
                <p className="text-xs text-slate-500">{new Date(c.createdAt).toLocaleString()}</p>
                {c.reviewNote && (
                  <p
                    className={`mt-2 text-xs rounded-md px-2 py-1.5 ${
                      c.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span className="font-medium">Reviewer note:</span> {c.reviewNote}
                  </p>
                )}
              </div>
              <StatusBadge status={c.status} />
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

function StatusBadge({ status }: { status: ContributionRecord["status"] }) {
  const styles = {
    pending: "bg-amber-50 text-amber-800",
    approved: "bg-emerald-50 text-emerald-800",
    rejected: "bg-red-50 text-red-800",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
