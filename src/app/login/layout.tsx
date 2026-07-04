import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sign In",
  description: "Sign in to contribute photos and corrections to elephant records on mahoot.",
  path: "/login",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
