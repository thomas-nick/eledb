import { Container } from "@/components/ui/Container";
import { ExploreNav } from "@/components/layout/ExploreNav";

interface ExplorePageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function ExplorePageHeader({ eyebrow, title, description }: ExplorePageHeaderProps) {
  return (
    <section className="bg-white border-b border-slate-200">
      <Container size="wide" className="pt-8 md:pt-10 pb-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-forest mb-2">
          {eyebrow}
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">{description}</p>
        <div className="mt-6">
          <ExploreNav />
        </div>
      </Container>
    </section>
  );
}
