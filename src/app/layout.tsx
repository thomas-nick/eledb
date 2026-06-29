import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { Analytics } from "@/components/analytics/Analytics";
import { SITE_URL, SITE_NAME, LOGO_SRC } from "@/lib/site";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteDescription =
  "A resource for people who love Asian elephants — sanctuaries, wild corridors, field notes, and travel planning across Thailand, Cambodia, and 13 range states.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: siteDescription,
  keywords: [
    "Asian elephant",
    "Thailand elephant sanctuary",
    "Cambodia elephant",
    "elephant tourism",
    "wildlife corridors",
    "mahout",
  ],
  icons: {
    icon: LOGO_SRC,
    apple: LOGO_SRC,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: siteDescription,
    images: [{ url: LOGO_SRC, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: siteDescription,
    images: [LOGO_SRC],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-2 focus:left-2 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-forest focus:shadow-lg"
        >
          Skip to content
        </a>
        <Analytics />
        <AuthSessionProvider>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
