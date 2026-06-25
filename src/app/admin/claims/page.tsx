"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CampClaim } from "@/types/camp";
import { Container } from "@/components/ui/Container";

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<CampClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/claims");
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to load queue");
      return;
    }
    setClaims(data.claims ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function review(id: string, action: "approve" | "reject") {
    const reviewNote =
      action === "reject" ? window.prompt("Rejection note (optional)") ?? undefined : undefined;
    const res = await fetch(`/api/admin/claims/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reviewNote }),
    });
    if (res.ok) await load();
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <Container size="wide">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Camp claims</h1>
            <p className="mt-1 text-sm text-slate-500">
              Verify camp/mahout ownership. Approving grants instant-publish manager access.
            </p>
          </div>
          <Link href="/admin/contributions" className="text-sm text-forest hover:underline">
            Contributions →
          </Link>
        </div>

        {loading && <p className="mt-8 text-slate-500">Loading...</p>}
        {error && <p className="mt-8 text-red-600">{error}</p>}

        {!loading && claims.length === 0 && (
          <p className="mt-8 text-slate-500">No pending claims.</p>
        )}

        <ul className="mt-8 space-y-4">
          {claims.map((c) => (
            <li key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    <Link href={`/camps/${c.locationId}`} className="text-forest hover:underline">
                      {c.locationName}
                    </Link>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {c.userName ?? c.userEmail} · {new Date(c.createdAt).toLocaleString()}
                  </p>
                  <dl className="mt-2 text-xs text-slate-600 space-y-1">
                    {c.roleAtCamp && (
                      <div>
                        <span className="text-slate-400">Role: </span>
                        {c.roleAtCamp}
                      </div>
                    )}
                    {c.contact && (
                      <div>
                        <span className="text-slate-400">Contact: </span>
                        {c.contact}
                      </div>
                    )}
                    {c.message && (
                      <div>
                        <span className="text-slate-400">Message: </span>
                        {c.message}
                      </div>
                    )}
                  </dl>
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
