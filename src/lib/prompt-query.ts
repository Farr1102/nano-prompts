import type { PromptItem, PromptModelId } from "@/lib/prompts";
import { getPromptModel } from "@/lib/prompts";

export type QueryModel = "all" | PromptModelId;

export function filterByModel(prompts: PromptItem[], model: QueryModel): PromptItem[] {
  if (model === "all") return prompts;
  return prompts.filter((p) => getPromptModel(p) === model);
}

export function filterByKeyword(prompts: PromptItem[], q: string): PromptItem[] {
  const k = q.trim().toLowerCase();
  if (!k) return prompts;
  return prompts.filter(
    (e) =>
      e.title.toLowerCase().includes(k) ||
      e.author.toLowerCase().includes(k) ||
      e.prompt.toLowerCase().includes(k) ||
      (e.tags || []).some((tag) => tag.toLowerCase().includes(k))
  );
}

export function filterBySelectedTags(prompts: PromptItem[], tags: string[]): PromptItem[] {
  if (!tags.length) return prompts;
  const set = new Set(tags);
  return prompts.filter((e) => (e.tags || []).some((tag) => set.has(tag)));
}

export function queryPrompts(
  prompts: PromptItem[],
  opts: { model: QueryModel; q: string; tags: string[] }
): PromptItem[] {
  let list = filterByModel(prompts, opts.model);
  list = filterByKeyword(list, opts.q);
  list = filterBySelectedTags(list, opts.tags);
  return list;
}

export function clampPageSize(n: number, fallback = 24): number {
  const x = Number.isFinite(n) ? Math.floor(n) : fallback;
  return Math.min(48, Math.max(1, x || fallback));
}
