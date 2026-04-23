"use client";

import Image from "next/image";
import { useState } from "react";
import { getPromptModel, type PromptItem } from "@/lib/prompts";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { remoteImageIsOptimizable } from "@/lib/remote-image";

export default function PromptCard({
  example,
  onClick,
  locale,
}: {
  example: PromptItem;
  onClick: () => void;
  locale: Locale;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const useNext = Boolean(example.imageUrl && remoteImageIsOptimizable(example.imageUrl));

  const model = getPromptModel(example);
  const modelBadge =
    model === "gpt-image-2"
      ? { label: t(locale, "modelCornerBadgeGpt"), className: "bg-sky-500/90 text-white border-sky-400/50" }
      : { label: t(locale, "modelCornerBadgeNano"), className: "bg-amber-500/90 text-stone-950 border-amber-400/50" };

  const ariaSuffix = example.author
    ? t(locale, "openPromptAriaAuthorSuffix", { author: example.author })
    : "";
  const ariaLabel = `${t(locale, "openPromptAria", {
    title: example.title,
    suffix: ariaSuffix,
  })} · ${modelBadge.label}`;

  const showImage = Boolean(example.imageUrl) && !imgFailed;
  const placeholder = (
    <div className="w-full h-full flex items-center justify-center text-stone-600 text-4xl bg-stone-950">
      🖼️
    </div>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-full text-left rounded-xl border border-stone-800 bg-stone-900/50 overflow-hidden hover:border-amber-500/40 hover:bg-stone-900 transition-all group"
    >
      <span aria-hidden="true" className="block w-full">
        <div className="aspect-[4/3] bg-stone-950 relative overflow-hidden">
          <span
            aria-hidden
            className={`absolute top-2 right-2 z-10 max-w-[calc(100%-1rem)] truncate rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-tight shadow-sm backdrop-blur-[2px] ${modelBadge.className}`}
          >
            {modelBadge.label}
          </span>
          {showImage && useNext ? (
            <Image
              src={example.imageUrl!}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
              loading="lazy"
              fetchPriority="low"
              quality={75}
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
            />
          ) : showImage ? (
            <img
              src={example.imageUrl}
              alt=""
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              onError={() => setImgFailed(true)}
            />
          ) : (
            placeholder
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
      </span>
    </button>
  );
}
