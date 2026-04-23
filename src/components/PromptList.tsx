"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getAllTags, getPromptModel, type PromptItem, type PromptModelId } from "@/lib/prompts";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import PromptCard from "./PromptCard";
import SearchBar from "./SearchBar";
import DetailModal from "./DetailModal";

const TAG_VISIBLE = 32;
const ITEMS_PER_SECTION = 16;

type ModelParam = "all" | "nano-banana" | "gpt-image-2";

function normalizeModelParam(raw: string | null): ModelParam {
  if (raw === "nano-banana" || raw === "gpt-image-2") return raw;
  return "all";
}

function getListPath(locale: Locale, model: ModelParam): string {
  if (model === "all") return `/${locale}`;
  return `/${locale}/m/${model}`;
}

export default function PromptList({
  prompts,
  sourceLabels,
  locale,
}: {
  prompts: PromptItem[];
  sourceLabels: Record<string, string>;
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qFromUrl = searchParams.get("q") ?? "";
  const tagsFromUrl = searchParams.get("tags")?.split(",").filter(Boolean) ?? [];
  const pFromUrl = searchParams.get("p") ?? "";

  const hubModel = useMemo((): PromptModelId | null => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 3 && parts[1] === "m") {
      const m = parts[2];
      if (m === "nano-banana" || m === "gpt-image-2") return m;
    }
    return null;
  }, [pathname]);

  const queryModel = normalizeModelParam(searchParams.get("model"));
  const effectiveModel: ModelParam = hubModel ?? queryModel;

  const listPath = useMemo(
    () => getListPath(locale, effectiveModel),
    [locale, effectiveModel]
  );

  const [keyword, setKeyword] = useState(qFromUrl);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(tagsFromUrl));
  const [selected, setSelected] = useState<PromptItem | null>(null);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const pendingPRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setKeyword(qFromUrl);
    setSelectedTags(new Set(tagsFromUrl));
  }, [qFromUrl, tagsFromUrl.join(",")]);

  /** 替代原 middleware：/?model= 规范到 /m/{model}（仅语言根路径） */
  useEffect(() => {
    const model = searchParams.get("model");
    if (model !== "nano-banana" && model !== "gpt-image-2") return;
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length !== 1) return;
    const loc = parts[0];
    if (loc !== "zh" && loc !== "en") return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("model");
    const s = params.toString();
    const dest = s ? `/${loc}/m/${model}?${s}` : `/${loc}/m/${model}`;
    router.replace(dest);
  }, [pathname, router, searchParams]);

  const corpus = useMemo(() => {
    if (effectiveModel === "all") return prompts;
    return prompts.filter((p) => getPromptModel(p) === (effectiveModel as PromptModelId));
  }, [prompts, effectiveModel]);

  const allTags = useMemo(() => getAllTags(corpus), [corpus]);

  useEffect(() => {
    // Ignore stale URL updates while a newer open/close action is pending.
    if (pendingPRef.current !== undefined && pFromUrl !== pendingPRef.current) return;
    if (pendingPRef.current !== undefined && pFromUrl === pendingPRef.current) {
      pendingPRef.current = undefined;
    }

    const item = pFromUrl ? prompts.find((x) => x.id === pFromUrl) : null;
    setSelected(item ?? null);
  }, [pFromUrl, prompts]);

  const updateUrl = useCallback(
    (updates: { q?: string; tags?: string[]; p?: string }) => {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : searchParams.toString()
      );
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
      params.delete("model");
      const s = params.toString();
      router.replace(s ? `${listPath}?${s}` : listPath, { scroll: false });
    },
    [listPath, router, searchParams]
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
    pendingPRef.current = item?.id ?? "";
    setSelected(item);
    // Pass empty string when closing so `p` is explicitly removed from URL.
    updateUrl({ p: item?.id ?? "" });
  };

  const filtered = useMemo(() => {
    let list = corpus;

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
  }, [corpus, keyword, selectedTags]);

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

  const sourceOrder = [
    "gpt-image-awesome",
    "awesome",
    "zizheruan",
    "antigravity",
    "jimmy",
    "nano-pro",
    "pro",
    "banana",
  ];

  const setModelFilter = (next: ModelParam) => {
    setSelectedTags(new Set());
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : searchParams.toString()
    );
    params.delete("tags");
    params.delete("model");
    const q = params.get("q") ?? "";
    const p = params.get("p") ?? "";
    const nextParams = new URLSearchParams();
    if (q) nextParams.set("q", q);
    if (p) nextParams.set("p", p);
    const s = nextParams.toString();
    const path = getListPath(locale, next);
    router.replace(s ? `${path}?${s}` : path, { scroll: false });
  };

  const modelTabs = [
    { id: "all" as const, labelKey: "modelAll" as const },
    { id: "nano-banana" as const, labelKey: "modelNanoBanana" as const },
    { id: "gpt-image-2" as const, labelKey: "modelGptImage2" as const },
  ];

  return (
    <div className="space-y-8">
      <div
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label={t(locale, "modelFilterAria")}
      >
        {modelTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={effectiveModel === tab.id}
            onClick={() => setModelFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              effectiveModel === tab.id
                ? "bg-amber-500/25 text-amber-300 border-amber-500/50"
                : "bg-stone-900/80 text-stone-400 border-stone-700 hover:border-stone-600"
            }`}
          >
            {t(locale, tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="sticky top-[73px] z-10 -mx-4 px-4 py-3 bg-stone-950/95 backdrop-blur-sm border-b border-stone-800 space-y-3">
        <SearchBar onSearch={handleSearch} locale={locale} initialValue={keyword} />

        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={selectedTags.has(tag)}
              title={t(locale, "filterByTag", { tag })}
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

      <DetailModal example={selected} onClose={() => openPrompt(null)} locale={locale} />
    </div>
  );
}
