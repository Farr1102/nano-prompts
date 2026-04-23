"use client";

import Image from "next/image";
import Link from "next/link";
import type { PromptItem } from "@/lib/prompts";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { remoteImageIsOptimizable } from "@/lib/remote-image";
import { useState, useEffect, useRef } from "react";

/** 右侧图片区固定尺寸（px） */
const IMAGE_BOX_W = 340;
const IMAGE_BOX_H = 468;

export default function DetailModal({
  example,
  onClose,
  locale,
}: {
  example: PromptItem | null;
  onClose: () => void;
  locale: Locale;
}) {
  const [copied, setCopied] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const prevActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (lightboxOpen) {
        setLightboxOpen(false);
        return;
      }
      onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose, lightboxOpen]);

  useEffect(() => {
    setImageFailed(false);
    setLightboxOpen(false);
  }, [example?.id, example?.imageUrl]);

  useEffect(() => {
    if (example) {
      prevActive.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        const focusable = contentRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      });
    } else {
      document.body.style.overflow = "";
      prevActive.current?.focus?.();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [example]);

  if (!example) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(example.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = example.prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasImage = Boolean(example.imageUrl) && !imageFailed;

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <div
          ref={contentRef}
          className="flex h-[min(90vh,640px)] w-[min(100vw-2rem,896px)] flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-apple-surface shadow-apple-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-black/[0.06] px-5 py-4 sm:px-6">
            <h2
              id="modal-title"
              className="truncate pr-4 text-[17px] font-semibold tracking-tight text-apple-label"
            >
              {example.title}
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/${locale}/p/${example.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-black/[0.08] bg-black/[0.03] px-3.5 py-1.5 text-sm font-medium text-apple-blue hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue/35"
              >
                {t(locale, "openInNewTab")}
              </Link>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-full bg-apple-blue px-4 py-1.5 text-sm font-medium text-white hover:bg-apple-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue/50 focus-visible:ring-offset-2"
              >
                {copied ? `✓ ${t(locale, "copied")}` : t(locale, "copyPrompt")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-apple-secondary hover:bg-black/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue/35"
                aria-label={t(locale, "close")}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
            <div className="min-h-0 flex-1 overflow-y-auto border-black/[0.06] p-5 sm:p-6 md:border-r">
              <div className="space-y-4">
                {example.author && (
                  <p className="text-sm text-apple-secondary">
                    {t(locale, "by")} @{example.author}
                  </p>
                )}
                {example.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {example.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-black/[0.04] px-2 py-0.5 text-xs font-medium text-apple-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {example.input && (
                  <p className="border-l-2 border-apple-separator pl-3 text-sm text-apple-secondary">
                    <span className="text-apple-tertiary">{t(locale, "input")}</span>
                    {example.input}
                  </p>
                )}
                <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-black/[0.06] bg-neutral-50 p-4 font-mono text-[13px] leading-relaxed text-apple-label">
                  {example.prompt}
                </pre>
                {example.note && (
                  <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-900">
                    {example.note}
                  </p>
                )}
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col items-center justify-center border-t border-black/[0.06] bg-apple-canvas/50 p-4 md:w-[372px] md:border-l md:border-t-0">
              <div
                className="overflow-hidden rounded-xl border border-black/[0.06] bg-neutral-100"
                style={{ width: IMAGE_BOX_W, height: IMAGE_BOX_H }}
              >
                {hasImage ? (
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="relative h-full w-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-apple-blue/45"
                    aria-label={t(locale, "viewLargeImage")}
                  >
                    {remoteImageIsOptimizable(example.imageUrl!) ? (
                      <Image
                        src={example.imageUrl!}
                        alt=""
                        fill
                        sizes={`${IMAGE_BOX_W}px`}
                        quality={85}
                        referrerPolicy="no-referrer"
                        className="object-contain"
                        onError={() => setImageFailed(true)}
                      />
                    ) : (
                      <img
                        src={example.imageUrl}
                        alt=""
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
                        onError={() => setImageFailed(true)}
                      />
                    )}
                  </button>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-apple-tertiary">
                    {t(locale, "noImage")}
                  </div>
                )}
              </div>
              {hasImage && (
                <p className="mt-2 text-center text-[11px] text-apple-tertiary">{t(locale, "viewLargeImage")}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && example.imageUrl && (
        <div
          role="presentation"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/88 p-4 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label={t(locale, "closeLightbox")}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={example.imageUrl}
            alt={example.title}
            className="max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
