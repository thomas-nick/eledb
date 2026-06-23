"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ContributionRecord } from "@/types/contribution";
import { Container } from "@/components/ui/Container";

export default function AdminContributionsPage() {
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/contributions");
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to load queue");
      return;
    }
    setContributions(data.contributions ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function review(id: string, action: "approve" | "reject") {
    const reviewNote =
      action === "reject" ? window.prompt("Rejection note (optional)") ?? undefined : undefined;
    const res = await fetch(`/api/admin/contributions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reviewNote }),
    });
    if (res.ok) await load();
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <Container size="wide">
        <h1 className="text-2xl font-semibold text-slate-900">Moderation queue</h1>
        <p className="mt-1 text-sm text-slate-500">Review pending photo and info contributions.</p>

        {loading && <p className="mt-8 text-slate-500">Loading...</p>}
        {error && <p className="mt-8 text-red-600">{error}</p>}

        {!loading && contributions.length === 0 && (
          <p className="mt-8 text-slate-500">No pending contributions.</p>
        )}

        <ul className="mt-8 space-y-4">
          {contributions.map((c) => (
            <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {c.type === "photo" ? "Photo" : "Info edit"} · Elephant{" "}
                    <Link href={`/elephants/${c.elephantId}`} className="text-forest hover:underline">
                      #{c.elephantId}
                    </Link>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {c.userName ?? c.userEmail} · {new Date(c.createdAt).toLocaleString()}
                  </p>
                  {c.type === "photo" && "publicUrl" in c.payload && (
                    <div className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.payload.publicUrl}
                        alt="Pending contribution"
                        className="max-h-40 rounded-lg border border-slate-200"
                      />
                    </div>
                  )}
                  {c.type === "info" && "changes" in c.payload && (
                    <pre className="mt-2 text-xs bg-slate-50 p-2 rounded overflow-x-auto">
                      {JSON.stringify(c.payload.changes, null, 2)}
                    </pre>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => review(c.id, "approve")}
                    className="rounded-lg bg-forest px-3 py-2 text-sm font-medium text-white"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => review(c.id, "reject")}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
