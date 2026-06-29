import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ExplorePageHeader } from "@/components/layout/ExplorePageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { articles, categoryLabels } from "@/data/articles";

export const metadata: Metadata = {
  title: "Field Notes",
  description:
    "Field notes, science, and community stories from across Asia's elephant range states.",
};

export default function ResourcesPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <ExplorePageHeader
        eyebrow="Education"
        title="Resources & Field Notes"
        description="Stories from the field, conservation science, and community-led solutions from across 13 range states."
      />

      <section className="py-8 md:py-10">
        <Container size="wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {articles.map((article) => (
              <Link key={article.slug} href={`/resources/${article.slug}`} className="group">
                <Card hover className="h-full p-0 overflow-hidden border-slate-200 bg-white">
                  <div className="relative h-40 bg-slate-100">
                    <Image
                      src={article.image}
                      alt=""
                      fill
                      className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="info">{categoryLabels[article.category]}</Badge>
                      <span className="text-xs text-slate-400">{article.readTime} min read</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-forest group-hover:text-clay transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted line-clamp-3">{article.excerpt}</p>
                    <p className="mt-3 text-xs text-slate-400">
                      {article.author} ·{" "}
                      {new Date(article.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
