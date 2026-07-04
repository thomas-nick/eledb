import type { Metadata } from "next";
import { absoluteUrl, LOGO_SRC, SITE_NAME, SITE_URL } from "@/lib/site";

/** Primary meta description — used in layout, OG, Twitter, and JSON-LD. */
export const SITE_DESCRIPTION =
  "mahoot is an independent guide to Asian elephants — search 14,000+ named individuals, browse camps and sanctuaries, explore wild range maps, and read field notes across 13 range states.";

/** Homepage & brand title shown in search results. */
export const SITE_TITLE =
  "mahoot — Asian Elephant Database, Sanctuaries & Range Map";

export const SITE_KEYWORDS = [
  "Asian elephant",
  "elephant database",
  "Thailand elephant sanctuary",
  "elephant camps Thailand",
  "Asian elephant range map",
  "elephant tourism",
  "wildlife corridors",
  "mahout culture",
  "elephant.se records",
  "Cambodia elephant",
  "India elephant",
];

type PageMetaOptions = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
  /** Use full title as-is (homepage) instead of "Title | mahoot". */
  absoluteTitle?: boolean;
};

/** Build page-level metadata with consistent OG/Twitter/canonical. */
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path = "",
  noIndex = false,
  ogImage = LOGO_SRC,
  absoluteTitle = false,
}: PageMetaOptions): Metadata {
  const url = path ? absoluteUrl(path) : SITE_URL;
  const imageUrl = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage);
  const displayTitle = absoluteTitle ? title : title;
  const ogTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

  return {
    title: displayTitle,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: SITE_NAME,
      title: ogTitle,
      description,
      images: [{ url: imageUrl, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      images: [imageUrl],
    },
  };
}

export function rootMetadata(): Metadata {
  const imageUrl = absoluteUrl(LOGO_SRC);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_TITLE,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: SITE_KEYWORDS,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "travel",
    icons: {
      icon: LOGO_SRC,
      apple: LOGO_SRC,
    },
    alternates: {
      canonical: SITE_URL,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [{ url: imageUrl, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [imageUrl],
    },
  };
}

export function siteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: absoluteUrl(LOGO_SRC),
      description: SITE_DESCRIPTION,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/elephants?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}
