import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Create Account",
  description: "Join the mahoot community to contribute photos and corrections to elephant records.",
  path: "/signup",
  noIndex: true,
});

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
