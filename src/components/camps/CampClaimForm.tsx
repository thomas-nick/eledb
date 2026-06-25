"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CampClaimFormProps {
  locationId: string;
  campName: string;
}

export function CampClaimForm({ locationId, campName }: CampClaimFormProps) {
  const router = useRouter();
  const [roleAtCamp, setRoleAtCamp] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/camps/${locationId}/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleAtCamp, contact, message }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Claim failed");
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
        <p className="font-medium">Claim submitted for {campName}.</p>
        <p className="mt-1">
          Our team will review your request and verify your connection to this camp. You will be able
          to manage the listing once approved.
        </p>
        <button
          type="button"
          onClick={() => router.push(`/camps/${locationId}`)}
          className="mt-4 rounded-lg bg-forest px-3 py-2 text-sm font-medium text-white"
        >
          Back to camp
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Your role at the camp
        </label>
        <input
          type="text"
          value={roleAtCamp}
          onChange={(e) => setRoleAtCamp(e.target.value)}
          placeholder="e.g. Owner, manager, head mahout"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-forest focus:ring-1 focus:ring-forest"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Contact (email or phone)
        </label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="How we can reach you to verify"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-forest focus:ring-1 focus:ring-forest"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Anything that helps us verify your connection
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Website, social links, or how you're connected to this camp"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-forest focus:ring-1 focus:ring-forest"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-forest px-4 py-2.5 text-sm font-medium text-white hover:bg-forest-light disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit claim"}
      </button>
    </form>
  );
}
