export interface PromptItem {
  id: string;
  title: string;
  author: string;
  link?: string;
  source: "pro" | "banana" | "nano-pro" | "awesome" | "zizheruan" | "antigravity" | "jimmy";
  tags: string[];
  input?: string;
  prompt: string;
  note?: string;
  imageUrl?: string;
}

export interface PromptsData {
  version: number;
  updatedAt: string;
  total: number;
  prompts: PromptItem[];
}

let cachedData: PromptsData | null = null;

export function getPromptsData(): PromptsData {
  if (cachedData) return cachedData;

  if (typeof window !== "undefined") {
    return { version: 0, updatedAt: "", total: 0, prompts: [] };
  }

  const fs = require("fs");
  const path = require("path");
  const filePath = path.join(process.cwd(), "public", "prompts.json");

  if (!fs.existsSync(filePath)) {
    return { version: 0, updatedAt: "", total: 0, prompts: [] };
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as PromptsData;
  cachedData = data;
  return data;
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
