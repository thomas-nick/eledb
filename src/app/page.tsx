import { HomePortal } from "@/components/home/HomePortal";
import { DonateCTA } from "@/components/home/DonateCTA";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Link from "next/link";
import { articles, categoryLabels } from "@/data/articles";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { pageMetadata, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  const latestArticles = articles.slice(0, 3);

  return (
    <>
      <HomePortal />

      <section className="py-12 md:py-16 bg-white border-t border-slate-200">
        <Container size="wide">
          <div className="flex items-end justify-between mb-8">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {latestArticles.map((article) => (
              <Link key={article.slug} href={`/resources/${article.slug}`} className="group">
                <Card hover className="h-full p-5 border-slate-200">
                  <Badge variant="info" className="mb-3">
                    {categoryLabels[article.category]}
                  </Badge>
                  <h3 className="font-serif text-lg font-bold text-forest group-hover:text-clay transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted line-clamp-3">{article.excerpt}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    {article.readTime} min read
                  </p>
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
