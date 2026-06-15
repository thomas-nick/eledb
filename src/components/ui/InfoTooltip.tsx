"use client";

import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  text: string;
  className?: string;
  iconClassName?: string;
  variant?: "light" | "dark";
}

export function InfoTooltip({ text, className, iconClassName, variant = "dark" }: InfoTooltipProps) {
  return (
    <span className={cn("relative inline-flex items-center group/tooltip", className)}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30",
          variant === "light"
            ? "text-ivory/60 hover:text-ivory"
            : "text-muted hover:text-forest",
          iconClassName
        )}
        aria-label="More information"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-lg bg-forest text-ivory text-xs leading-relaxed px-3 py-2 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible transition-opacity z-50 shadow-lg"
      >
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-forest" />
      </span>
    </span>
  );
}

interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
  className?: string;
  variant?: "light" | "dark";
}

export function LabelWithTooltip({ label, tooltip, className, variant = "dark" }: LabelWithTooltipProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {label}
      <InfoTooltip text={tooltip} variant={variant} />
    </span>
  );
}
