"use client";

import { useState, useMemo } from "react";
import type { PromptExample } from "@/lib/parse";
import PromptCard from "./PromptCard";
import SearchBar from "./SearchBar";
import DetailModal from "./DetailModal";

export default function PromptList({
  proExamples,
  bananaExamples,
  nanoProExamples,
}: {
  proExamples: PromptExample[];
  bananaExamples: PromptExample[];
  nanoProExamples: PromptExample[];
}) {
  const [keyword, setKeyword] = useState("");
  const [selected, setSelected] = useState<PromptExample | null>(null);

  const filter = (list: PromptExample[]) =>
    keyword.trim()
      ? list.filter(
          (e) =>
            e.title.toLowerCase().includes(keyword.toLowerCase()) ||
            e.author.toLowerCase().includes(keyword.toLowerCase()) ||
            e.prompt.toLowerCase().includes(keyword.toLowerCase())
        )
      : list;

  const filteredPro = useMemo(() => filter(proExamples), [keyword, proExamples]);
  const filteredBanana = useMemo(
    () => filter(bananaExamples),
    [keyword, bananaExamples]
  );
  const filteredNanoPro = useMemo(
    () => filter(nanoProExamples),
    [keyword, nanoProExamples]
  );

  return (
    <div className="space-y-8">
      <div className="sticky top-[73px] z-10 -mx-4 px-4 py-3 bg-stone-950/95 backdrop-blur-sm border-b border-stone-800">
        <SearchBar onSearch={setKeyword} />
      </div>

      {filteredNanoPro.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-amber-400">★</span> Awesome Nano Pro (
            {filteredNanoPro.length})
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {filteredNanoPro.map((example) => (
              <PromptCard
                key={example.id}
                example={example}
                onClick={() => setSelected(example)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-amber-400">☆</span> Nano Banana Pro (
          {filteredPro.length})
        </h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {filteredPro.map((example) => (
            <PromptCard
              key={example.id}
              example={example}
              onClick={() => setSelected(example)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-amber-400">◇</span> Nano Banana (
          {filteredBanana.length})
        </h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {filteredBanana.map((example) => (
            <PromptCard
              key={example.id}
              example={example}
              onClick={() => setSelected(example)}
            />
          ))}
        </div>
      </section>

      <DetailModal example={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
