import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import { LOGO_SRC, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ef",
    theme_color: "#1a3a2a",
    icons: [
      {
        src: LOGO_SRC,
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
