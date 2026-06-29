"use client";

import { useEffect, useState } from "react";
import { isBrowserTypesenseConfigured, globalSearchBrowser } from "@/lib/typesense-browser";
import type { GlobalSearchResult } from "@/lib/typesense-search";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

async function searchViaApi(
  query: string,
  limit: number,
  signal: AbortSignal
): Promise<GlobalSearchResult> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
    signal,
  });
  if (!res.ok) throw new Error("Search request failed");
  return res.json() as Promise<GlobalSearchResult>;
}

/**
 * Debounced federated search for typeahead surfaces.
 * Races browser Typesense (fast) against /api/search (reliable fallback).
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
        const apiPromise = searchViaApi(q, limit, controller.signal);

        if (useBrowser) {
          const browserPromise = withTimeout(globalSearchBrowser(q, limit), 2000).catch(
            () => null
          );
          const data = await Promise.race([
            browserPromise.then((d) => (d ? d : apiPromise)),
            apiPromise,
          ]);
          if (!cancelled) {
            setResult(data);
            setError(null);
          }
          return;
        }

        const data = await apiPromise;
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
