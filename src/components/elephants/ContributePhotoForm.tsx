"use client";

import { useState } from "react";

interface ContributePhotoFormProps {
  elephantId: string;
  onDone: () => void;
}

export function ContributePhotoForm({ elephantId, onDone }: ContributePhotoFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [credit, setCredit] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a photo to upload");
      return;
    }

    setLoading(true);
    setError("");

    const form = new FormData();
    form.set("elephantId", elephantId);
    form.set("file", file);
    if (credit) form.set("credit", credit);
    if (caption) form.set("caption", caption);

    const res = await fetch("/api/contributions/photo", { method: "POST", body: form });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }

    setSuccess(true);
    setTimeout(onDone, 1500);
  }

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Photo submitted for review. Thank you!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
      <p className="text-sm font-medium text-slate-900">Upload a photo</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-slate-600"
      />
      <input
        type="text"
        placeholder="Photo credit (optional)"
        value={credit}
        onChange={(e) => setCredit(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Caption (optional)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-forest px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Submit for review"}
        </button>
        <button type="button" onClick={onDone} className="text-sm text-slate-500 hover:text-slate-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
