/**
 * Renders a schema.org JSON-LD script tag. Server-renderable; safe for
 * structured data since the payload is our own serialized object.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
