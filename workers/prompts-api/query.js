/**
 * 与 src/lib/prompt-query.ts 行为保持一致（筛选逻辑变更时请同步两处）
 * @typedef {{ id: string; title: string; author: string; link?: string; source: string; model?: string; tags: string[]; input?: string; prompt: string; note?: string; imageUrl?: string }} PromptItem
 */

/** @param {PromptItem[]} prompts @param {string} model */
export function filterByModel(prompts, model) {
  if (model === "all") return prompts;
  return prompts.filter((p) => (p.model ?? "nano-banana") === model);
}

/** @param {PromptItem[]} prompts @param {string} q */
export function filterByKeyword(prompts, q) {
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

/** @param {PromptItem[]} prompts @param {string[]} tags */
export function filterBySelectedTags(prompts, tags) {
  if (!tags.length) return prompts;
  const set = new Set(tags);
  return prompts.filter((e) => (e.tags || []).some((tag) => set.has(tag)));
}

/**
 * @param {PromptItem[]} prompts
 * @param {{ model: string; q: string; tags: string[] }} opts
 */
export function queryPrompts(prompts, opts) {
  let list = filterByModel(prompts, opts.model);
  list = filterByKeyword(list, opts.q);
  list = filterBySelectedTags(list, opts.tags);
  return list;
}

/** @param {number} n @param {number} [fallback=24] */
export function clampPageSize(n, fallback = 24) {
  const x = Number.isFinite(n) ? Math.floor(n) : fallback;
  return Math.min(48, Math.max(1, x || fallback));
}
