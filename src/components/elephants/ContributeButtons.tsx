"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import type { ElephantRecord } from "@/types/elephant";
import { ContributeInfoForm } from "@/components/elephants/ContributeInfoForm";
import { ContributePhotoForm } from "@/components/elephants/ContributePhotoForm";
import { track } from "@/lib/analytics";

interface ContributeButtonsProps {
  elephant: ElephantRecord;
}

export function ContributeButtons({ elephant }: ContributeButtonsProps) {
  const { data: session } = useSession();
  const [mode, setMode] = useState<"photo" | "info" | null>(null);

  if (!session?.user) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/login?callbackUrl=/elephants/${elephant.id}`}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-forest hover:text-forest"
        >
          Sign in to contribute
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            const next = mode === "photo" ? null : "photo";
            if (next) track("contribute_open", { type: "photo", elephantId: elephant.id });
            setMode(next);
          }}
          className="inline-flex items-center rounded-lg bg-forest px-3 py-2 text-sm font-medium text-white hover:bg-forest-light"
        >
          Add photo
        </button>
        <button
          type="button"
          onClick={() => {
            const next = mode === "info" ? null : "info";
            if (next) track("contribute_open", { type: "info", elephantId: elephant.id });
            setMode(next);
          }}
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-forest"
        >
          Suggest edit
        </button>
      </div>

      {mode === "photo" && (
        <ContributePhotoForm elephantId={elephant.id} onDone={() => setMode(null)} />
      )}
      {mode === "info" && (
        <ContributeInfoForm elephant={elephant} onDone={() => setMode(null)} />
      )}
    </div>
  );
}
