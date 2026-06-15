import { Container } from "@/components/ui/Container";
import { Stat } from "@/components/ui/Stat";
import { populationStats } from "@/data/stats";

export function StatsSection() {
  return (
    <section className="py-20 bg-forest">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {populationStats.map((stat) => (
            <Stat key={stat.label} {...stat} variant="light" />
          ))}
        </div>
      </Container>
    </section>
  );
}
