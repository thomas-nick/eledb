import { Hero } from "@/components/home/Hero";
import { StatsSection } from "@/components/home/StatsSection";
import { PillarCards } from "@/components/home/PillarCards";
import { DonateCTA } from "@/components/home/DonateCTA";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Link from "next/link";
import { articles } from "@/data/articles";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { categoryLabels } from "@/data/articles";
import Image from "next/image";

export default function HomePage() {
  const latestArticles = articles.slice(0, 3);

  return (
    <>
      <Hero />
      <StatsSection />
      <PillarCards />

      <section className="py-24">
        <Container>
          <div className="flex items-end justify-between mb-12">
            <SectionHeading
              eyebrow="From the Field"
              title="Latest Resources"
              description="Stories, science, and community solutions from across Asia's elephant range."
            />
            <Link
              href="/resources"
              className="hidden md:inline-flex text-sm font-medium text-clay hover:text-forest transition-colors"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              <Link key={article.slug} href={`/resources/${article.slug}`} className="group">
                <Card hover className="h-full p-0 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-6">
                    <Badge variant="info" className="mb-3">
                      {categoryLabels[article.category]}
                    </Badge>
                    <h3 className="font-serif text-xl font-bold text-forest group-hover:text-clay transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <DonateCTA />
    </>
  );
}
