"use client";

import { useState } from "react";
import type { ElephantPhoto as ElephantPhotoType } from "@/types/elephant";
import { resolveElephantPhotoUrl } from "@/lib/elephantSe";

interface ElephantPhotoProps {
  photo?: ElephantPhotoType;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  showCredit?: boolean;
}

export function ElephantPhoto({
  photo,
  alt,
  className = "",
  sizes,
  priority,
  showCredit = false,
}: ElephantPhotoProps) {
  const [failed, setFailed] = useState(false);

  if (photo && !failed) {
    return (
      <figure className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveElephantPhotoUrl(photo.url)}
          alt={photo.credit ?? alt}
          className="w-full h-full object-cover"
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
        {showCredit && photo.credit && (
          <figcaption className="text-xs text-ivory/70 bg-forest/40 px-3 py-1.5 truncate">
            {photo.credit}
          </figcaption>
        )}
      </figure>
    );
  }

  return <ElephantPhotoPlaceholder className={className} />;
}

export function ElephantPhotoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-100 flex items-center justify-center ${className}`}
      aria-hidden
    >
      <svg
        viewBox="0 0 64 48"
        className="w-1/3 max-w-[96px] text-slate-300"
        fill="currentColor"
      >
        <ellipse cx="30" cy="26" rx="20" ry="14" />
        <circle cx="46" cy="16" r="9" />
        <path d="M52 22c4 0 6 3 6 7s-3 6-5 5-3-4-2-7l1-5z" />
        <rect x="14" y="34" width="7" height="12" rx="2" />
        <rect x="26" y="35" width="7" height="11" rx="2" />
        <rect x="38" y="34" width="7" height="12" rx="2" />
      </svg>
    </div>
  );
}
