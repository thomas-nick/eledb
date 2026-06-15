interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-widest text-clay mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-forest leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
