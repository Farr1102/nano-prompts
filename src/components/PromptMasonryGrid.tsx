"use client";

import Masonry from "react-masonry-css";
import { useState } from "react";
import { getPromptModel, type PromptItem } from "@/lib/prompts";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

function PromptImageTile({
  item,
  locale,
  onOpen,
}: {
  item: PromptItem;
  locale: Locale;
  onOpen: (item: PromptItem) => void;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(item.imageUrl) && !imgFailed;

  const model = getPromptModel(item);
  const modelBadge =
    model === "gpt-image-2"
      ? {
          label: t(locale, "modelCornerBadgeGpt"),
          className: "bg-sky-100/95 text-sky-900 border-sky-200/90 shadow-sm",
        }
      : {
          label: t(locale, "modelCornerBadgeNano"),
          className: "bg-orange-50/95 text-orange-900 border-orange-200/80 shadow-sm",
        };

  const ariaSuffix = item.author
    ? t(locale, "openPromptAriaAuthorSuffix", { author: item.author })
    : "";
  const ariaLabel = `${t(locale, "openPromptAria", {
    title: item.title,
    suffix: ariaSuffix,
  })} · ${modelBadge.label}`;

  const placeholder = (
    <div className="flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-b from-neutral-100 to-neutral-200/70 text-apple-tertiary">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" className="opacity-[0.35]" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="m3 17 6-5 4 4 3-3 5 4" />
      </svg>
    </div>
  );

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={ariaLabel}
      className="group mb-4 w-full overflow-hidden rounded-xl border border-black/[0.06] bg-neutral-100 text-left shadow-apple transition-all duration-200 hover:border-black/[0.1] hover:shadow-apple-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue/35 focus-visible:ring-offset-2 active:scale-[0.99]"
    >
      <span className="relative block w-full">
        <span
          aria-hidden
          className={`pointer-events-none absolute right-2 top-2 z-10 max-w-[calc(100%-1rem)] truncate rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-tight backdrop-blur-sm ${modelBadge.className}`}
        >
          {modelBadge.label}
        </span>
        {showImage ? (
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="block h-auto max-h-[min(80vh,560px)] w-full transition-transform duration-300 group-hover:scale-[1.02]"
            onError={() => setImgFailed(true)}
          />
        ) : (
          placeholder
        )}
      </span>
    </button>
  );
}

/**
 * CSS 多列瀑布流（[react-masonry-css](https://github.com/paulcollett/react-masonry-css)）——仅布局；无限滚动与分页由 PromptList + IntersectionObserver 处理。
 */
export default function PromptMasonryGrid({
  items,
  locale,
  onOpen,
}: {
  items: PromptItem[];
  locale: Locale;
  onOpen: (item: PromptItem) => void;
}) {
  return (
    <Masonry
      breakpointCols={{
        default: 4,
        1280: 3,
        768: 2,
        480: 2,
      }}
      className="prompt-masonry-grid"
      columnClassName="prompt-masonry-grid_column"
    >
      {items.map((item) => (
        <PromptImageTile key={item.id} item={item} locale={locale} onOpen={onOpen} />
      ))}
    </Masonry>
  );
}
