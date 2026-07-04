import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "My Contributions",
  description: "Track your submitted photos and edits to elephant records.",
  path: "/contributions",
  noIndex: true,
});

export default function ContributionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
