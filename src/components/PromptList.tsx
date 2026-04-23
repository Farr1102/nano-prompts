"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { getAllTags, getPromptModel, type PromptItem, type PromptModelId } from "@/lib/prompts";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import SearchBar from "./SearchBar";
import DetailModal from "./DetailModal";
import PromptMasonryGrid from "./PromptMasonryGrid";

const TAG_VISIBLE = 32;

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
  locale,
}: {
  prompts: PromptItem[];
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

  const visibleTags = tagsExpanded ? allTags : allTags.slice(0, TAG_VISIBLE);
  const hasMoreTags = allTags.length > TAG_VISIBLE;

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
    <div className="flex flex-col gap-8 lg:flex-row-reverse lg:items-start lg:gap-10 xl:gap-12">
      <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-16 lg:z-10 lg:self-start lg:w-80 lg:max-w-[20rem] xl:w-[22rem] xl:max-w-[22rem]">
        <div className="rounded-2xl border border-black/[0.06] bg-apple-surface p-4 shadow-apple">
          <SearchBar onSearch={handleSearch} locale={locale} initialValue={keyword} />
        </div>

        <div className="rounded-2xl border border-black/[0.06] bg-apple-surface p-4 shadow-apple">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-apple-tertiary">
            {t(locale, "sidebarTagsHeading")}
          </p>
          <div className="flex max-h-[min(50vh,28rem)] flex-wrap gap-2 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/15">
            {visibleTags.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={selectedTags.has(tag)}
                title={t(locale, "filterByTag", { tag })}
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue/35 ${
                  selectedTags.has(tag)
                    ? "bg-apple-blue text-white shadow-sm"
                    : "border border-black/[0.08] bg-apple-canvas/80 text-apple-secondary hover:border-black/[0.12]"
                }`}
              >
                {tag}
              </button>
            ))}
            {hasMoreTags && (
              <button
                type="button"
                onClick={() => setTagsExpanded(!tagsExpanded)}
                className="rounded-full border border-black/[0.08] bg-apple-canvas/80 px-2.5 py-1 text-xs font-medium text-apple-blue hover:bg-black/[0.04]"
              >
                {tagsExpanded ? t(locale, "collapseTags") : `+${allTags.length - TAG_VISIBLE} ${t(locale, "moreTags")}`}
              </button>
            )}
          </div>
        </div>

        <p className="px-1 text-sm text-apple-secondary">
          {t(locale, "filterResult", { count: String(filtered.length) })}
          {selectedTags.size > 0 && (
            <button
              type="button"
              onClick={clearTags}
              className="ml-2 font-medium text-apple-blue hover:underline"
            >
              {t(locale, "clearTags")}
            </button>
          )}
        </p>
      </aside>

      <div className="min-w-0 flex-1 space-y-6">
        <div
          className="sticky top-16 z-10 mb-4 rounded-2xl border border-black/[0.06] bg-apple-surface/95 px-3 py-2.5 shadow-apple backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-apple-surface/88"
        >
          <div
            className="flex flex-wrap gap-1.5 rounded-xl bg-black/[0.035] p-1.5"
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
                className={`rounded-full px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-apple-canvas ${
                  effectiveModel === tab.id
                    ? "bg-apple-surface font-semibold text-apple-label shadow-sm ring-1 ring-black/[0.07]"
                    : "font-medium text-apple-secondary hover:bg-white/70 hover:text-apple-label active:scale-[0.98]"
                }`}
              >
                {t(locale, tab.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-apple-secondary">
            {t(locale, "noResults")}
          </div>
        ) : (
          <PromptMasonryGrid items={filtered} locale={locale} onOpen={openPrompt} />
        )}
      </div>

      <DetailModal example={selected} onClose={() => openPrompt(null)} locale={locale} />
    </div>
  );
}
