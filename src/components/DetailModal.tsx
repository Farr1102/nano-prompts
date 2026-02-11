"use client";

import type { PromptExample } from "@/lib/parse";
import { useState, useEffect } from "react";

export default function DetailModal({
  example,
  onClose,
}: {
  example: PromptExample | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (example) {
      document.body.style.overflow = "hidden";
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-700">
          <h2 className="text-lg font-semibold text-stone-100 truncate pr-4">
            {example.title}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
            >
              {copied ? "✓ 已复制" : "复制提示词"}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800"
              aria-label="关闭"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          <div className="flex-1 overflow-y-auto p-6 md:border-r border-stone-700 min-h-0">
            <div className="space-y-4">
              {example.author && (
                <p className="text-sm text-stone-500">by @{example.author}</p>
              )}
              {example.input && (
                <p className="text-sm text-stone-400 border-l-2 border-stone-600 pl-3">
                  <span className="text-stone-500">输入：</span>
                  {example.input}
                </p>
              )}
              <pre className="text-sm text-stone-300 bg-stone-950 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-words font-mono">
                {example.prompt}
              </pre>
              {example.note && (
                <p className="text-xs text-amber-400/90 bg-amber-500/10 rounded-lg px-3 py-2">
                  {example.note}
                </p>
              )}
            </div>
          </div>

          <div className="w-full md:w-80 shrink-0 p-6 flex flex-col items-center justify-start bg-stone-950/50 border-t md:border-t-0 md:border-l border-stone-700">
            {example.imageUrl ? (
              <img
                src={example.imageUrl}
                alt={example.title}
                className="w-full rounded-lg object-contain max-h-[60vh]"
              />
            ) : (
              <div className="w-full aspect-square rounded-lg bg-stone-800 flex items-center justify-center text-stone-500 text-sm">
                暂无示例图
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
