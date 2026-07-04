import { siteJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

/** Site-wide Organization + WebSite structured data for search engines. */
export function SiteJsonLd() {
  const graphs = siteJsonLd();
  return (
    <>
      {graphs.map((data) => (
        <JsonLd key={data["@type"] as string} data={data} />
      ))}
    </>
  );
}
