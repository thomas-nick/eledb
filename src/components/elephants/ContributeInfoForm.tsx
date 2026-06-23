"use client";

import { useState } from "react";
import type { ElephantRecord } from "@/types/elephant";
import { OVERRIDE_FIELD_KEYS } from "@/types/contribution";

const fieldLabels: Record<string, string> = {
  name: "Name",
  sex: "Sex",
  status: "Status",
  subspecies: "Subspecies",
  birthDate: "Birth date",
  birthPlace: "Birth place",
  ageYears: "Age (years)",
  origin: "Origin",
  country: "Country",
  fatherName: "Sire name",
  motherName: "Dam name",
  management: "Management",
};

interface ContributeInfoFormProps {
  elephant: ElephantRecord;
  onDone: () => void;
}

export function ContributeInfoForm({ elephant, onDone }: ContributeInfoFormProps) {
  const [changes, setChanges] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const editableFields = OVERRIDE_FIELD_KEYS.filter((key) => {
    const val = elephant[key as keyof ElephantRecord];
    return val !== undefined && val !== null && val !== "";
  });

  const emptyFields = OVERRIDE_FIELD_KEYS.filter((key) => !editableFields.includes(key));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(changes)) {
      if (!value.trim()) continue;
      payload[key] = key === "ageYears" ? Number(value) : value.trim();
    }

    if (Object.keys(payload).length === 0) {
      setError("Enter at least one correction");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elephantId: elephant.id, changes: payload }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Submission failed");
      return;
    }

    setSuccess(true);
    setTimeout(onDone, 1500);
  }

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Edit submitted for review. Thank you!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
      <p className="text-sm font-medium text-slate-900">Suggest a correction</p>
      <p className="text-xs text-slate-500">Only fill in fields you want to change. A moderator will review before publishing.</p>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {[...editableFields, ...emptyFields].map((key) => (
          <div key={key}>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {fieldLabels[key] ?? key}
              {editableFields.includes(key) && (
                <span className="text-slate-400 font-normal ml-1">
                  (current: {String(elephant[key as keyof ElephantRecord] ?? "—")})
                </span>
              )}
            </label>
            <input
              type={key === "ageYears" ? "number" : "text"}
              value={changes[key] ?? ""}
              onChange={(e) => setChanges((c) => ({ ...c, [key]: e.target.value }))}
              placeholder={emptyFields.includes(key) ? "Add missing value" : "Suggested value"}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-forest px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit for review"}
        </button>
        <button type="button" onClick={onDone} className="text-sm text-slate-500 hover:text-slate-700">
          Cancel
        </button>
      </div>
    </form>
  );
}
