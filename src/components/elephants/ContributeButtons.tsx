"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import type { ElephantRecord } from "@/types/elephant";
import { ContributeInfoForm } from "@/components/elephants/ContributeInfoForm";
import { ContributePhotoForm } from "@/components/elephants/ContributePhotoForm";

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
          onClick={() => setMode(mode === "photo" ? null : "photo")}
          className="inline-flex items-center rounded-lg bg-forest px-3 py-2 text-sm font-medium text-white hover:bg-forest-light"
        >
          Add photo
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "info" ? null : "info")}
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
