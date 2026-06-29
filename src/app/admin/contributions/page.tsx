"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ContributionRecord } from "@/types/contribution";
import { Container } from "@/components/ui/Container";

export default function AdminContributionsPage() {
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (!rejectingId) return;
    textareaRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setRejectingId(null);
        setRejectNote("");
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [rejectingId]);

  async function review(id: string, action: "approve" | "reject", reviewNote?: string) {
    const res = await fetch(`/api/admin/contributions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reviewNote }),
    });
    if (res.ok) {
      setRejectingId(null);
      setRejectNote("");
      await load();
    }
  }

  function openReject(id: string) {
    setRejectingId(id);
    setRejectNote("");
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
                    onClick={() => openReject(c.id)}
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

      {rejectingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
          role="presentation"
          onClick={() => {
            setRejectingId(null);
            setRejectNote("");
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-dialog-title"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="reject-dialog-title" className="text-lg font-semibold text-slate-900">
              Reject contribution
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Optional note for the contributor (visible on their submissions page).
            </p>
            <label htmlFor="reject-note" className="sr-only">
              Rejection note
            </label>
            <textarea
              ref={textareaRef}
              id="reject-note"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={4}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-forest focus:ring-1 focus:ring-forest"
              placeholder="Reason for rejection (optional)"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingId(null);
                  setRejectNote("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => review(rejectingId, "reject", rejectNote.trim() || undefined)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Confirm reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
