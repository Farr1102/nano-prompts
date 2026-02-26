"use client";

import { useState, useMemo } from "react";
import type { PromptItem } from "@/lib/prompts";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import PromptCard from "./PromptCard";
import SearchBar from "./SearchBar";
import DetailModal from "./DetailModal";

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
  const [keyword, setKeyword] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<PromptItem | null>(null);

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

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const sourceOrder = ["awesome", "zizheruan", "antigravity", "jimmy", "nano-pro", "pro", "banana"];

  return (
    <div className="space-y-8">
      <div className="sticky top-[73px] z-10 -mx-4 px-4 py-3 bg-stone-950/95 backdrop-blur-sm border-b border-stone-800 space-y-3">
        <SearchBar onSearch={setKeyword} locale={locale} />

        <div className="flex flex-wrap gap-2">
          {allTags.slice(0, 32).map((tag) => (
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
          {allTags.length > 32 && (
            <span className="text-stone-500 text-xs py-1">
              +{allTags.length - 32} {t(locale, "moreTags")}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-stone-500">
        {t(locale, "filterResult", { count: String(filtered.length) })}
        {selectedTags.size > 0 && (
          <button
            type="button"
            onClick={() => setSelectedTags(new Set())}
            className="ml-2 text-amber-400 hover:underline"
          >
            {t(locale, "clearTags")}
          </button>
        )}
      </p>

      {sourceOrder.map((source) => {
        const items = bySource.get(source) || [];
        if (items.length === 0) return null;

        return (
          <section key={source}>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-amber-400">◆</span>{" "}
              {sourceLabels[source] || source} ({items.length})
            </h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
              {items.map((example) => (
                <PromptCard
                  key={example.id}
                  example={example}
                  onClick={() => setSelected(example)}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        );
      })}

      <DetailModal example={selected} onClose={() => setSelected(null)} locale={locale} />
    </div>
  );
}
