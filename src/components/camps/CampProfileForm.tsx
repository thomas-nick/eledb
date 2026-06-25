"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { LocationProfile } from "@/types/location";

interface CampProfileFormProps {
  locationId: string;
  profile?: LocationProfile;
}

const FIELDS: {
  key: keyof Pick<
    LocationProfile,
    | "description"
    | "website"
    | "contactEmail"
    | "phone"
    | "address"
    | "welfareNotes"
    | "heroPhotoUrl"
  >;
  label: string;
  type: "text" | "textarea" | "url" | "email";
  placeholder?: string;
}[] = [
  { key: "description", label: "About this camp", type: "textarea", placeholder: "Describe your camp, its mission, and what visitors can expect." },
  { key: "welfareNotes", label: "Welfare practices", type: "textarea", placeholder: "How elephants are cared for, daily routine, no-riding policy, etc." },
  { key: "website", label: "Website", type: "url", placeholder: "https://" },
  { key: "contactEmail", label: "Contact email", type: "email" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "heroPhotoUrl", label: "Hero photo URL", type: "url", placeholder: "https://" },
];

export function CampProfileForm({ locationId, profile }: CampProfileFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => ({
    description: profile?.description ?? "",
    welfareNotes: profile?.welfareNotes ?? "",
    website: profile?.website ?? "",
    contactEmail: profile?.contactEmail ?? "",
    phone: profile?.phone ?? "",
    address: profile?.address ?? "",
    heroPhotoUrl: profile?.heroPhotoUrl ?? "",
  }));
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const res = await fetch(`/api/camps/${locationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ changes: values }),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-700">Saved. Changes are live on your camp page.</p>}

      {FIELDS.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-slate-700 mb-1">{field.label}</label>
          {field.type === "textarea" ? (
            <textarea
              value={values[field.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              rows={4}
              placeholder={field.placeholder}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-forest focus:ring-1 focus:ring-forest"
            />
          ) : (
            <input
              type={field.type === "url" ? "url" : field.type === "email" ? "email" : "text"}
              value={values[field.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-forest focus:ring-1 focus:ring-forest"
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
