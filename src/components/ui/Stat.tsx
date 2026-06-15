"use client";

import { LabelWithTooltip } from "@/components/ui/InfoTooltip";

interface StatProps {
  value: string;
  label: string;
  description?: string;
  tooltip?: string;
  variant?: "light" | "dark";
}

export function Stat({ value, label, description, tooltip, variant = "dark" }: StatProps) {
  const valueColor = variant === "light" ? "text-ivory" : "text-forest";
  const labelColor = variant === "light" ? "text-ivory/70" : "text-muted";
  const descColor = variant === "light" ? "text-ivory/50" : "text-muted/80";

  return (
    <div className="text-center md:text-left">
      <p className={`font-serif text-4xl md:text-5xl font-bold ${valueColor}`}>{value}</p>
      <p className={`mt-2 text-sm font-semibold uppercase tracking-wider ${labelColor}`}>
        {tooltip ? (
          <LabelWithTooltip
            label={label}
            tooltip={tooltip}
            variant={variant}
            className="justify-center md:justify-start"
          />
        ) : (
          label
        )}
      </p>
      {description && (
        <p className={`mt-1 text-sm ${descColor}`}>{description}</p>
      )}
    </div>
  );
}
