"use client";

import { useState, useEffect, useCallback } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

const DEBOUNCE_MS = 200;

export default function SearchBar({
  onSearch,
  locale,
  initialValue = "",
}: {
  onSearch: (keyword: string) => void;
  locale: Locale;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);

  const debouncedSearch = useCallback(
    (v: string) => {
      const id = setTimeout(() => onSearch(v), DEBOUNCE_MS);
      return () => clearTimeout(id);
    },
    [onSearch]
  );

  useEffect(() => {
    const cleanup = debouncedSearch(value);
    return cleanup;
  }, [value, debouncedSearch]);

  useEffect(() => {
    setValue((prev) => (prev !== initialValue ? initialValue : prev));
  }, [initialValue]);

  return (
    <div className="relative">
      <input
        type="search"
        placeholder={t(locale, "searchPlaceholder")}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        className="w-full rounded-2xl border border-black/[0.08] bg-apple-surface py-3 pl-11 pr-4 text-[15px] text-apple-label shadow-apple placeholder:text-apple-tertiary focus:border-apple-blue/35 focus:outline-none focus:ring-2 focus:ring-apple-blue/25"
      />
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-apple-tertiary" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </span>
    </div>
  );
}
