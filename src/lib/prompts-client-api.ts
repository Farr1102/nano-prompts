/**
 * 列表数据源（浏览器）：
 * - 默认：拉一次 `/prompts.json` + 内存 queryPrompts（静态导出友好）
 * - 可选：设置 `NEXT_PUBLIC_PROMPTS_WORKER_URL` 后走 Cloudflare Worker（D1），路径 `/api/prompts`，响应形状一致
 */
import type { PromptItem, PromptsData } from "@/lib/prompts";
import { clampPageSize, queryPrompts, type QueryModel } from "@/lib/prompt-query";

function workerBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_PROMPTS_WORKER_URL;
  if (typeof raw !== "string") return null;
  const t = raw.trim().replace(/\/$/, "");
  return t.length > 0 ? t : null;
}

let cached: PromptsData | null = null;
let loadPromise: Promise<PromptsData> | null = null;

/** 仅在未配置 Worker 时使用（全量 prompts.json） */
export async function loadPromptsCorpus(): Promise<PromptsData> {
  if (workerBaseUrl()) {
    throw new Error(
      "已设置 NEXT_PUBLIC_PROMPTS_WORKER_URL 时请勿拉全量 corpus，请用 fetchPromptPage / fetchPromptById"
    );
  }
  if (cached) return cached;
  if (!loadPromise) {
    loadPromise = fetch("/prompts.json")
      .then((r) => {
        if (!r.ok) throw new Error(`prompts.json: ${r.status}`);
        return r.json() as Promise<PromptsData>;
      })
      .then((data) => {
        cached = data;
        return data;
      });
  }
  return loadPromise;
}

export type PromptPageParams = {
  model: QueryModel;
  q: string;
  tags: string[];
  limit: number;
  offset: number;
};

type PageResponse = {
  items: PromptItem[];
  total: number;
  nextOffset: number | null;
  hasMore: boolean;
  limit: number;
  offset: number;
};

export async function fetchPromptPage(params: PromptPageParams): Promise<PageResponse> {
  const base = workerBaseUrl();
  const limit = clampPageSize(params.limit, 24);
  const offset = Math.max(0, params.offset);

  if (base) {
    const sp = new URLSearchParams({
      model: params.model,
      q: params.q,
      tags: params.tags.join(","),
      limit: String(limit),
      offset: String(offset),
    });
    const r = await fetch(`${base}/api/prompts?${sp}`);
    if (!r.ok) throw new Error(`prompts worker: ${r.status}`);
    return r.json() as Promise<PageResponse>;
  }

  const data = await loadPromptsCorpus();
  const filtered = queryPrompts(data.prompts, {
    model: params.model,
    q: params.q,
    tags: params.tags,
  });
  const slice = filtered.slice(offset, offset + limit);
  const nextOffset = offset + slice.length < filtered.length ? offset + slice.length : null;
  return {
    items: slice,
    total: filtered.length,
    nextOffset,
    hasMore: nextOffset !== null,
    limit,
    offset,
  };
}

export async function fetchPromptById(id: string): Promise<PromptItem | null> {
  const base = workerBaseUrl();
  if (base) {
    const r = await fetch(`${base}/api/prompts?id=${encodeURIComponent(id)}`);
    if (!r.ok) throw new Error(`prompts worker: ${r.status}`);
    const d = (await r.json()) as { item: PromptItem | null };
    return d.item ?? null;
  }
  const data = await loadPromptsCorpus();
  return data.prompts.find((p) => p.id === id) ?? null;
}
