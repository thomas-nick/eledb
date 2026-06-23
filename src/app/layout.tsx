import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { Analytics } from "@/components/analytics/Analytics";
import { SITE_URL } from "@/lib/site";
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Asian Elephant",
    template: "%s | Asian Elephant",
  },
  description:
    "A resource for people who love Asian elephants — sanctuaries, wild corridors, field notes, and travel planning across Thailand, Cambodia, and 13 range states.",
  keywords: [
    "Asian elephant",
    "Thailand elephant sanctuary",
    "Cambodia elephant",
    "elephant tourism",
    "wildlife corridors",
    "mahout",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <Analytics />
        <AuthSessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
