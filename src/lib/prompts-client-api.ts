/**
 * 列表数据源（浏览器）：
 * - Worker + D1：`NEXT_PUBLIC_PROMPTS_WORKER_URL`（构建时注入）**或** 运行时请求 **`/prompts-worker.json`**（适合 Cloudflare Pages 未配环境变量仍要打 Worker）
 * - 否则：拉一次 `/prompts.json` + 内存 queryPrompts
 */
import type { PromptItem, PromptsData } from "@/lib/prompts";
import { clampPageSize, queryPrompts, type QueryModel } from "@/lib/prompt-query";

/** `undefined` = 尚未解析；`null` = 明确走 prompts.json */
let resolvedWorkerBase: string | null | undefined = undefined;
let resolveWorkerPromise: Promise<string | null> | null = null;

async function resolveWorkerBase(): Promise<string | null> {
  if (resolvedWorkerBase !== undefined) return resolvedWorkerBase;
  if (!resolveWorkerPromise) {
    resolveWorkerPromise = (async () => {
      const fromEnv =
        typeof process.env.NEXT_PUBLIC_PROMPTS_WORKER_URL === "string"
          ? process.env.NEXT_PUBLIC_PROMPTS_WORKER_URL.trim().replace(/\/$/, "")
          : "";
      if (fromEnv) {
        resolvedWorkerBase = fromEnv;
        return fromEnv;
      }
      try {
        const r = await fetch("/prompts-worker.json");
        if (r.ok) {
          const j = (await r.json()) as { baseUrl?: unknown };
          const u = typeof j.baseUrl === "string" ? j.baseUrl.trim().replace(/\/$/, "") : "";
          if (u) {
            resolvedWorkerBase = u;
            return u;
          }
        }
      } catch {
        /* 无文件或网络错误则回退 json */
      }
      resolvedWorkerBase = null;
      return null;
    })();
  }
  return resolveWorkerPromise;
}

let cached: PromptsData | null = null;
let loadPromise: Promise<PromptsData> | null = null;

/** 仅在未使用 Worker 时使用（全量 prompts.json） */
export async function loadPromptsCorpus(): Promise<PromptsData> {
  if (await resolveWorkerBase()) {
    throw new Error(
      "当前使用 Worker 数据源，请勿拉全量 corpus，请用 fetchPromptPage / fetchPromptById"
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
  const base = await resolveWorkerBase();
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
  const base = await resolveWorkerBase();
  if (base) {
    const r = await fetch(`${base}/api/prompts?id=${encodeURIComponent(id)}`);
    if (!r.ok) throw new Error(`prompts worker: ${r.status}`);
    const d = (await r.json()) as { item: PromptItem | null };
    return d.item ?? null;
  }
  const data = await loadPromptsCorpus();
  return data.prompts.find((p) => p.id === id) ?? null;
}
