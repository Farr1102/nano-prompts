import fs from "node:fs";
import path from "node:path";
import type { PromptsData } from "@/lib/prompts";

let cachedData: PromptsData | null = null;

/** 仅服务端 / 构建期使用；勿在 Client Component 中 import 本文件 */
export function getPromptsData(): PromptsData {
  if (cachedData) return cachedData;

  const filePath = path.join(process.cwd(), "public", "prompts.json");

  if (!fs.existsSync(filePath)) {
    return { version: 0, updatedAt: "", total: 0, prompts: [] };
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8")) as PromptsData;
  cachedData = data;
  return data;
}
