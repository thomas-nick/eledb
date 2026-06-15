import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { articles, categoryLabels } from "@/data/articles";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Field notes, science, and community stories from across Asia's elephant range states.",
};

export default function ResourcesPage() {
  return (
    <>
      <section className="py-16 md:py-24 bg-forest text-ivory">
        <Container>
          <SectionHeading
            eyebrow="Education"
            title="Resources & Field Notes"
            description="Stories from the field, conservation science, and community-led solutions from across 13 range states."
          />
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article) => (
              <Link key={article.slug} href={`/resources/${article.slug}`} className="group">
                <Card hover className="h-full p-0 overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="info">{categoryLabels[article.category]}</Badge>
                      <span className="text-xs text-muted">{article.readTime} min read</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-forest group-hover:text-clay transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted line-clamp-2">
                      {article.excerpt}
                    </p>
                    <p className="mt-4 text-xs text-muted">
                      {article.author} &middot; {new Date(article.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
