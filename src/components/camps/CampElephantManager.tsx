"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ElephantRecord } from "@/types/elephant";

export interface RosterElephant {
  id: string;
  name: string;
  sex: ElephantRecord["sex"];
  status: ElephantRecord["status"];
  ageYears?: number;
  birthDate?: string;
  management?: string;
  source?: string;
}

interface CampElephantManagerProps {
  locationId: string;
  elephants: RosterElephant[];
}

const SEX_OPTIONS: ElephantRecord["sex"][] = ["unknown", "female", "male"];
const STATUS_OPTIONS: ElephantRecord["status"][] = ["living", "deceased"];

function EditRow({ elephant }: { elephant: RosterElephant }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(elephant.name);
  const [sex, setSex] = useState(elephant.sex);
  const [status, setStatus] = useState(elephant.status);
  const [ageYears, setAgeYears] = useState(
    elephant.ageYears != null ? String(elephant.ageYears) : ""
  );
  const [management, setManagement] = useState(elephant.management ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setError("");
    setSaved(false);
    const changes: Record<string, string | number> = {};
    if (name.trim()) changes.name = name.trim();
    changes.sex = sex;
    changes.status = status;
    if (ageYears.trim()) changes.ageYears = Number(ageYears);
    if (management.trim()) changes.management = management.trim();

    const res = await fetch(`/api/manage/elephants/${elephant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changes }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">{elephant.name || "Unnamed"}</p>
          <p className="text-xs text-slate-500 capitalize">
            {elephant.sex} · {elephant.status}
            {elephant.source === "camp" && (
              <span className="ml-2 rounded bg-clay/10 px-1.5 py-0.5 text-[10px] text-clay">
                Added by you
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-forest"
        >
          {open ? "Close" : "Edit"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && <p className="text-sm text-emerald-700">Saved. Changes are live.</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-medium text-slate-600">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-slate-600">
              Age (years)
              <input
                type="number"
                value={ageYears}
                onChange={(e) => setAgeYears(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-slate-600">
              Sex
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as ElephantRecord["sex"])}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm capitalize"
              >
                {SEX_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ElephantRecord["status"])}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm capitalize"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-600 sm:col-span-2">
              Management
              <input
                value={management}
                onChange={(e) => setManagement(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="rounded-lg bg-forest px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}
    </li>
  );
}

function AddElephant({ locationId }: { locationId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sex, setSex] = useState<ElephantRecord["sex"]>("unknown");
  const [status, setStatus] = useState<ElephantRecord["status"]>("living");
  const [ageYears, setAgeYears] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function add() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/camps/${locationId}/elephants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        sex,
        status,
        ageYears: ageYears.trim() ? Number(ageYears) : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not add elephant");
      return;
    }
    setName("");
    setAgeYears("");
    setSex("unknown");
    setStatus("living");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-clay px-4 py-2.5 text-sm font-medium text-white hover:bg-clay/90"
      >
        + Add an elephant
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-clay/30 bg-clay/5 p-4 space-y-3">
      <p className="text-sm font-medium text-slate-900">Add a new elephant</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="text-xs font-medium text-slate-600">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Age (years)
          <input
            type="number"
            value={ageYears}
            onChange={(e) => setAgeYears(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-slate-600">
          Sex
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value as ElephantRecord["sex"])}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm capitalize"
          >
            {SEX_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ElephantRecord["status"])}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm capitalize"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={add}
          disabled={loading}
          className="rounded-lg bg-forest px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add elephant"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function CampElephantManager({ locationId, elephants }: CampElephantManagerProps) {
  return (
    <div className="space-y-4">
      <AddElephant locationId={locationId} />
      {elephants.length === 0 ? (
        <p className="text-sm text-slate-500">No elephants on record yet. Add your first above.</p>
      ) : (
        <ul className="space-y-3">
          {elephants.map((e) => (
            <EditRow key={e.id} elephant={e} />
          ))}
        </ul>
      )}
    </div>
  );
}
