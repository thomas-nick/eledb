import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Elephant Camps & Sanctuaries",
  description:
    "Curated directory of elephant camps and sanctuaries across Thailand, Cambodia, India, and more — filter by experience type, country, and welfare assessments.",
  path: "/sanctuaries",
});

export default function SanctuariesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
