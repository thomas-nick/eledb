import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function DonateCTA() {
  return (
    <section className="py-24 bg-clay-light/30">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-forest">
            Wild Corridors Need Land
          </h2>
          <p className="mt-4 text-lg text-muted leading-relaxed">
            Fragmented habitats are the quiet crisis behind human-elephant conflict. 
            The corridor portal tracks specific land bridges between wild populations — 
            one of the most tangible conservation levers out there.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/donate" size="lg">
              Support Corridors
            </Button>
            <Button href="/corridors" variant="outline" size="lg">
              Explore Corridors
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
