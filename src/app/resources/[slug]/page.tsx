import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { articles, categoryLabels } from "@/data/articles";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);

  if (!article) notFound();

  return (
    <>
      <section className="relative h-[40vh] min-h-[300px]">
        <Image
          src={article.image}
          alt={article.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/80 to-transparent" />
      </section>

      <article className="py-12 md:py-16">
        <Container size="narrow">
          <Badge variant="info" className="mb-4">
            {categoryLabels[article.category]}
          </Badge>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-forest leading-tight">
            {article.title}
          </h1>
          <p className="mt-4 text-muted">
            {article.author} &middot;{" "}
            {new Date(article.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            &middot; {article.readTime} min read
          </p>

          <div className="mt-10 space-y-6">
            {article.content.map((paragraph, i) => (
              <p key={i} className="text-lg text-muted leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-wrap gap-4">
            <Button href="/resources" variant="outline">
              All Resources
            </Button>
            <Button href="/donate" variant="secondary">
              Support This Work
            </Button>
          </div>
        </Container>
      </article>
    </>
  );
}
