"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { PromptItem } from "@/lib/prompts";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import PromptCard from "./PromptCard";
import SearchBar from "./SearchBar";
import DetailModal from "./DetailModal";

const TAG_VISIBLE = 32;
const ITEMS_PER_SECTION = 16;

export default function PromptList({
  prompts,
  allTags,
  sourceLabels,
  locale,
}: {
  prompts: PromptItem[];
  allTags: string[];
  sourceLabels: Record<string, string>;
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qFromUrl = searchParams.get("q") ?? "";
  const tagsFromUrl = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
  const pFromUrl = searchParams.get("p") ?? "";

  const [keyword, setKeyword] = useState(qFromUrl);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(tagsFromUrl));
  const [selected, setSelected] = useState<PromptItem | null>(null);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    setKeyword(qFromUrl);
    setSelectedTags(new Set(tagsFromUrl));
  }, [qFromUrl, tagsFromUrl.join(",")]);

  useEffect(() => {
    const item = pFromUrl ? prompts.find((x) => x.id === pFromUrl) : null;
    setSelected(item ?? null);
  }, [pFromUrl, prompts]);

  const updateUrl = useCallback(
    (updates: { q?: string; tags?: string[]; p?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.q !== undefined) {
        if (updates.q) params.set("q", updates.q);
        else params.delete("q");
      }
      if (updates.tags !== undefined) {
        if (updates.tags.length) params.set("tags", updates.tags.join(","));
        else params.delete("tags");
      }
      if (updates.p !== undefined) {
        if (updates.p) params.set("p", updates.p);
        else params.delete("p");
      }
      const s = params.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleSearch = useCallback(
    (k: string) => {
      setKeyword(k);
      updateUrl({ q: k || undefined });
    },
    [updateUrl]
  );

  const toggleTag = (tag: string) => {
    const next = new Set(selectedTags);
    if (next.has(tag)) next.delete(tag);
    else next.add(tag);
    setSelectedTags(next);
    updateUrl({ tags: [...next] });
  };

  const clearTags = () => {
    setSelectedTags(new Set());
    updateUrl({ tags: [] });
  };

  const openPrompt = (item: PromptItem | null) => {
    setSelected(item);
    updateUrl({ p: item?.id ?? undefined });
  };

  const filtered = useMemo(() => {
    let list = prompts;

    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(k) ||
          e.author.toLowerCase().includes(k) ||
          e.prompt.toLowerCase().includes(k) ||
          (e.tags || []).some((t) => t.toLowerCase().includes(k))
      );
    }

    if (selectedTags.size > 0) {
      list = list.filter((e) =>
        (e.tags || []).some((t) => selectedTags.has(t))
      );
    }

    return list;
  }, [prompts, keyword, selectedTags]);

  const bySource = useMemo(() => {
    const map = new Map<string, PromptItem[]>();
    for (const p of filtered) {
      const arr = map.get(p.source) || [];
      arr.push(p);
      map.set(p.source, arr);
    }
    return map;
  }, [filtered]);

  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, TAG_VISIBLE);
  const hasMoreTags = allTags.length > TAG_VISIBLE;

  const sourceOrder = ["awesome", "zizheruan", "antigravity", "jimmy", "nano-pro", "pro", "banana"];

  return (
    <div className="space-y-8">
      <div className="sticky top-[73px] z-10 -mx-4 px-4 py-3 bg-stone-950/95 backdrop-blur-sm border-b border-stone-800 space-y-3">
        <SearchBar onSearch={handleSearch} locale={locale} initialValue={keyword} />

        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedTags.has(tag)
                  ? "bg-amber-500/30 text-amber-400 border border-amber-500/50"
                  : "bg-stone-800/80 text-stone-400 hover:bg-stone-700 border border-stone-700"
              }`}
            >
              {tag}
            </button>
          ))}
          {hasMoreTags && (
            <button
              type="button"
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className="px-2.5 py-1 rounded-md text-xs font-medium text-amber-400 hover:bg-amber-500/20 border border-stone-700"
            >
              {tagsExpanded ? t(locale, "collapseTags") : `+${allTags.length - TAG_VISIBLE} ${t(locale, "moreTags")}`}
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-stone-500">
        {t(locale, "filterResult", { count: String(filtered.length) })}
        {selectedTags.size > 0 && (
          <button
            type="button"
            onClick={clearTags}
            className="ml-2 text-amber-400 hover:underline"
          >
            {t(locale, "clearTags")}
          </button>
        )}
      </p>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-stone-500">
          {t(locale, "noResults")}
        </div>
      ) : (
        sourceOrder.map((source) => {
          const items = bySource.get(source) || [];
          if (items.length === 0) return null;

          const isExpanded = expandedSections.has(source);
          const displayItems = items.length > ITEMS_PER_SECTION && !isExpanded
            ? items.slice(0, ITEMS_PER_SECTION)
            : items;
          const hasMore = items.length > ITEMS_PER_SECTION && !isExpanded;

          return (
            <section key={source}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-amber-400">◆</span>{" "}
                {sourceLabels[source] || source} ({items.length})
              </h2>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {displayItems.map((example) => (
                  <PromptCard
                    key={example.id}
                    example={example}
                    onClick={() => openPrompt(example)}
                    locale={locale}
                  />
                ))}
              </div>
              {hasMore && (
                <button
                  type="button"
                  onClick={() => setExpandedSections((prev) => new Set(prev).add(source))}
                  className="mt-4 px-4 py-2 rounded-lg text-sm text-amber-400 hover:bg-amber-500/20 border border-stone-700"
                >
                  {t(locale, "showMore")} ({items.length - ITEMS_PER_SECTION})
                </button>
              )}
            </section>
          );
        })
      )}

      <DetailModal
        example={selected}
        onClose={() => openPrompt(null)}
        locale={locale}
        localePath={pathname.split("/")[1]}
      />
    </div>
  );
}
