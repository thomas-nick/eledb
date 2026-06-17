"use client";

import { useCallback, useEffect, useState } from "react";
import type { ElephantPhoto } from "@/types/elephant";
import { resolveElephantPhotoUrl } from "@/lib/elephantSe";
import { Card } from "@/components/ui/Card";

interface ElephantPhotoGalleryProps {
  photos: ElephantPhoto[];
  elephantName: string;
}

export function ElephantPhotoGallery({ photos, elephantName }: ElephantPhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const resolved = photos.map((p) => ({
    ...p,
    url: resolveElephantPhotoUrl(p.url),
  }));

  const active = resolved[activeIndex];
  const hasMultiple = resolved.length > 1;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + resolved.length) % resolved.length);
    },
    [resolved.length]
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goTo(activeIndex - 1);
      if (e.key === "ArrowRight") goTo(activeIndex + 1);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen, activeIndex, goTo]);

  return (
    <section className="mb-12" aria-label="Photo gallery">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-widest text-clay mb-2">Gallery</p>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-forest">
          {hasMultiple ? `${resolved.length} photos` : "Photo"}
        </h2>
      </div>

      <Card className="overflow-hidden">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative block w-full aspect-[16/9] md:aspect-[21/9] bg-forest/5 cursor-zoom-in group"
          aria-label={`View full size photo of ${elephantName}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.url}
            alt={active.credit ?? elephantName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-forest/70 text-ivory text-xs backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            Expand
          </span>
          {hasMultiple && (
            <>
              <GalleryNavButton
                direction="prev"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeIndex - 1);
                }}
                className="left-3"
                label="Previous photo"
              />
              <GalleryNavButton
                direction="next"
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeIndex + 1);
                }}
                className="right-3"
                label="Next photo"
              />
            </>
          )}
        </button>

        {active.credit && (
          <p className="px-4 py-3 text-sm text-muted border-t border-border bg-ivory/50">
            {active.credit}
          </p>
        )}

        {hasMultiple && (
          <div className="flex gap-2 p-3 border-t border-border overflow-x-auto">
            {resolved.map((photo, i) => (
              <button
                key={photo.url}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeIndex
                    ? "border-clay ring-2 ring-clay/30"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={`Photo ${i + 1} of ${resolved.length}`}
                aria-current={i === activeIndex ? "true" : undefined}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </Card>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-forest/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo gallery for ${elephantName}`}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-ivory/80 hover:text-ivory text-sm font-medium px-3 py-2 rounded-lg bg-ivory/10 backdrop-blur-sm"
          >
            Close ✕
          </button>

          {hasMultiple && (
            <>
              <GalleryNavButton
                direction="prev"
                onClick={() => goTo(activeIndex - 1)}
                className="left-4 md:left-8"
                label="Previous photo"
                large
              />
              <GalleryNavButton
                direction="next"
                onClick={() => goTo(activeIndex + 1)}
                className="right-4 md:right-8"
                label="Next photo"
                large
              />
            </>
          )}

          <figure className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.url}
              alt={active.credit ?? elephantName}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
            />
            {active.credit && (
              <figcaption className="mt-4 text-sm text-ivory/70 text-center max-w-lg">
                {active.credit}
              </figcaption>
            )}
            {hasMultiple && (
              <p className="mt-2 text-xs text-ivory/50">
                {activeIndex + 1} / {resolved.length}
              </p>
            )}
          </figure>
        </div>
      )}
    </section>
  );
}

function GalleryNavButton({
  direction,
  onClick,
  className,
  label,
  large,
}: {
  direction: "prev" | "next";
  onClick: (e: React.MouseEvent) => void;
  className: string;
  label: string;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full bg-forest/60 text-ivory backdrop-blur-sm hover:bg-forest/80 transition-colors ${
        large ? "w-12 h-12 text-xl" : "w-9 h-9 text-base"
      } ${className}`}
    >
      {direction === "prev" ? "‹" : "›"}
    </button>
  );
}
