import { Container } from "@/components/ui/Container";
import { HomeExploreNav } from "@/components/home/HomeExploreNav";

interface ExploreHeroProps {
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  showNav?: boolean;
}

export function ExploreHero({
  eyebrow,
  title,
  description,
  showNav = true,
}: ExploreHeroProps) {
  return (
    <section className="home-portal-hero border-b border-border">
      <Container size="wide" className="pt-8 md:pt-10 pb-6">
        <p className="text-xs font-semibold tracking-widest text-forest mb-2">{eyebrow}</p>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">{description}</p>
        {showNav && (
          <div className="mt-6">
            <HomeExploreNav />
          </div>
        )}
      </Container>
    </section>
  );
}
