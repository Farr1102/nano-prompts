"use client";

import type { PromptItem } from "@/lib/prompts";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export default function PromptCard({
  example,
  onClick,
  locale,
}: {
  example: PromptItem;
  onClick: () => void;
  locale: Locale;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-stone-800 bg-stone-900/50 overflow-hidden hover:border-amber-500/40 hover:bg-stone-900 transition-all group"
    >
      <div className="aspect-[4/3] bg-stone-950 relative overflow-hidden">
        {example.imageUrl ? (
          <>
            <img
              src={example.imageUrl}
              alt={example.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove("hidden");
              }}
            />
            <div className="hidden absolute inset-0 flex items-center justify-center text-stone-600 text-4xl bg-stone-950">
              🖼️
            </div>
          </>
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
            {t(locale, "by")} @{example.author}
          </p>
        )}
      </div>
    </button>
  );
}
