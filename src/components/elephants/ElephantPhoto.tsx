import type { ElephantPhoto as ElephantPhotoType } from "@/types/elephant";

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
  if (photo) {
    return (
      <figure className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt={photo.credit ?? alt}
          className="w-full h-full object-cover"
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
        />
        {showCredit && photo.credit && (
          <figcaption className="text-xs text-ivory/70 bg-forest/40 px-3 py-1.5 truncate">
            {photo.credit}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-forest-light via-forest to-forest w-full h-full ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_70%,var(--color-clay)_0%,transparent_50%)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8rem] md:text-[10rem] leading-none select-none opacity-25">🐘</span>
      </div>
    </div>
  );
}
