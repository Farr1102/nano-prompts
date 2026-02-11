"use client";

import type { PromptExample } from "@/lib/parse";

export default function PromptCard({
  example,
  onClick,
}: {
  example: PromptExample;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-stone-800 bg-stone-900/50 overflow-hidden hover:border-amber-500/40 hover:bg-stone-900 transition-all group"
    >
      <div className="aspect-[4/3] bg-stone-950 relative overflow-hidden">
        {example.imageUrl ? (
          <img
            src={example.imageUrl}
            alt={example.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-600 text-4xl">
            🖼️
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-stone-100 line-clamp-2 group-hover:text-amber-400 transition-colors">
          {example.title}
        </h3>
        {example.author && (
          <p className="text-sm text-stone-500 mt-1 truncate">
            by @{example.author}
          </p>
        )}
      </div>
    </button>
  );
}
