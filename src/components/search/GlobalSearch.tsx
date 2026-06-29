"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { track } from "@/lib/analytics";
import {
  SearchDropdown,
  buildSearchDropdownItems,
  type SearchDropdownItem,
} from "@/components/search/SearchDropdown";

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { result, loading, error } = useGlobalSearch(query, { limit: 5, minLength: 1 });
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = "global-search-listbox";

  const items = buildSearchDropdownItems(result, query);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [result]);

  const go = useCallback(
    (item: SearchDropdownItem) => {
      track("global_search_select", { kind: item.kind, query: query.trim() });
      close();
      router.push(item.href);
    },
    [router, close, query]
  );

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[active];
      if (item) go(item);
      else if (query.trim()) {
        close();
        router.push(`/elephants?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the database"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/70 px-3 py-1.5 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden lg:inline">Search elephants, camps…</span>
        <span className="hidden lg:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
          ⌘K
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-900/40 backdrop-blur-sm px-4 pt-[12vh]"
          onClick={close}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4">
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search elephants, camps, countries…"
                aria-label="Search elephants and camps"
                aria-expanded={items.length > 0}
                aria-controls={listboxId}
                aria-activedescendant={items[active] ? `${listboxId}-option-${active}` : undefined}
                autoComplete="off"
                className="flex-1 bg-transparent py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {loading && (
                <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-200 border-t-forest" aria-hidden />
              )}
              <kbd className="hidden sm:block shrink-0 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">
                Esc
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2">
              {!query.trim() ? (
                <p className="px-4 py-8 text-center text-sm text-slate-400">
                  Search 14,000+ elephants and camps across 13 range states.
                </p>
              ) : (
                <SearchDropdown
                  items={items}
                  active={active}
                  query={query}
                  loading={loading}
                  error={error}
                  listboxId={listboxId}
                  onHover={setActive}
                  onSelect={go}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
