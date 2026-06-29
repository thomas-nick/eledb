import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

interface FeatureHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  background?: string;
  className?: string;
  children?: React.ReactNode;
  containerSize?: "default" | "wide" | "narrow";
}

export function FeatureHero({
  eyebrow,
  title,
  description,
  background,
  className,
  children,
  containerSize = "wide",
}: FeatureHeroProps) {
  return (
    <section
      className={cn("relative overflow-hidden text-white", className)}
      style={background ? { background } : undefined}
    >
      <Container size={containerSize} className="relative py-12 md:py-16">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80 mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-3 text-sm md:text-base text-white/85 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
        {children}
      </Container>
    </section>
  );
}
