"use client";

import { useEffect, useState } from "react";
import { isBrowserTypesenseConfigured, globalSearchBrowser } from "@/lib/typesense-browser";
import type { GlobalSearchResult } from "@/lib/typesense-search";

/**
 * Debounced federated search for typeahead surfaces.
 * Uses the browser Typesense client when configured (fastest); otherwise /api/search.
 */
export function useGlobalSearch(
  query: string,
  options: { limit?: number; debounceMs?: number; minLength?: number } = {}
) {
  const { limit = 5, debounceMs, minLength = 1 } = options;
  const [result, setResult] = useState<GlobalSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useBrowser = isBrowserTypesenseConfigured();
  const effectiveDebounce = debounceMs ?? (useBrowser ? 100 : 180);

  useEffect(() => {
    const q = query.trim();
    if (q.length < minLength) {
      setResult(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const timer = setTimeout(async () => {
      try {
        if (useBrowser) {
          try {
            const data = await globalSearchBrowser(q, limit);
            if (!cancelled) {
              setResult(data);
              setError(null);
            }
            return;
          } catch {
            // Search-only key invalid or CORS — fall through to server API
          }
        }
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search request failed");
        const data = (await res.json()) as GlobalSearchResult;
        if (!cancelled) {
          setResult(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled && !(err instanceof DOMException && err.name === "AbortError")) {
          setError("Search unavailable. Try again.");
          setResult(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, effectiveDebounce);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, limit, minLength, effectiveDebounce, useBrowser]);

  return { result, loading, error, instant: useBrowser };
}
