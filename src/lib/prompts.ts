export type PromptModelId = "nano-banana" | "gpt-image-2";

export interface PromptItem {
  id: string;
  title: string;
  author: string;
  link?: string;
  /** 数据源 id，与 generate 脚本一致；不限死枚举以免漏类型 */
  source: string;
  /** 适用模型族，缺省视为 nano-banana（兼容旧数据） */
  model?: PromptModelId;
  tags: string[];
  input?: string;
  prompt: string;
  note?: string;
  imageUrl?: string;
}

export function getPromptModel(item: PromptItem): PromptModelId {
  return item.model ?? "nano-banana";
}

export interface PromptsData {
  version: number;
  updatedAt: string;
  total: number;
  prompts: PromptItem[];
}

export function getAllTags(prompts: PromptItem[]): string[] {
  const set = new Set<string>();
  for (const p of prompts) {
    for (const t of p.tags || []) {
      if (t.trim()) set.add(t.trim());
    }
  }
  return [...set].sort();
}
