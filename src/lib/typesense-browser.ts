"use client";

import Typesense, { Client } from "typesense";
import {
  buildGlobalMultiSearch,
  mapGlobalMultiSearchResponse,
} from "@/lib/typesense-queries";
import type { GlobalSearchResult } from "@/lib/typesense-search";

let client: Client | null = null;

/** True when search-only key + host are available in the browser bundle. */
export function isBrowserTypesenseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_TYPESENSE_HOST &&
      process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY
  );
}

function getBrowserTypesenseClient(): Client {
  if (!isBrowserTypesenseConfigured()) {
    throw new Error("Browser Typesense is not configured");
  }

  if (!client) {
    client = new Typesense.Client({
      nodes: [
        {
          host: process.env.NEXT_PUBLIC_TYPESENSE_HOST!,
          port: Number(process.env.NEXT_PUBLIC_TYPESENSE_PORT ?? 443),
          protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL ?? "https",
        },
      ],
      apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_KEY!,
      connectionTimeoutSeconds: 5,
    });
  }

  return client;
}

/** Client-side federated search — skips the Next.js round trip for typeahead. */
export async function globalSearchBrowser(
  query: string,
  perCategory = 5
): Promise<GlobalSearchResult> {
  const q = query.trim();
  if (!q) {
    return {
      query: "",
      elephants: [],
      camps: [],
      elephantTotal: 0,
      campTotal: 0,
      source: "browser",
    };
  }

  const ts = getBrowserTypesenseClient();
  const response = await ts.multiSearch.perform(buildGlobalMultiSearch(q, perCategory));
  return mapGlobalMultiSearchResponse(q, response.results, "browser");
}
