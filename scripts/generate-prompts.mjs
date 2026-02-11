#!/usr/bin/env node
/**
 * 从 data.md, nano-pro.md, new.md 生成统一的 prompts.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const IMAGE_BASE = "https://raw.githubusercontent.com/PicoTrex/Awesome-Nano-Banana-images/main/";

// 从 new.md 标题提取分类 (e.g. "Profile / Avatar - Title" -> "Profile / Avatar")
function extractCategory(title) {
  const match = title.match(/^([^\-]+)\s*-\s*(.+)$/);
  if (match) return { category: match[1].trim(), title: match[2].trim() };
  return { category: null, title };
}

// 解析 data.md
function parseDataMd(content) {
  const examples = [];
  const proSection = content.match(/## 🍌 Nano Banana Pro 例子\n([\s\S]*?)(?=## 🖼️ Nano Banana 例子)/);
  const bananaSection = content.match(/## 🖼️ Nano Banana 例子\n([\s\S]*?)(?=## 🙏 Acknowledge)/);

  const parseSection = (sectionContent, source) => {
    if (!sectionContent) return;
    const parts = sectionContent.split(/(?=### 例\s*\d+)/).filter(Boolean);

    for (const part of parts) {
      const headerMatch = part.match(/^### 例\s*(\d+)\s*[:\s：]?\s*(?:\[([^\]]+)\]\((https?:\/\/[^)]+)\)（by\s+\[@?([^\]]+)\](?:\([^)]*\))?\)?|([^（\n]+)（by\s+\[@?([^\]]+)\](?:\([^)]*\))?\)?)/);
      if (!headerMatch) continue;

      const num = headerMatch[1];
      const title = (headerMatch[2] || headerMatch[5] || "").trim();
      const link = headerMatch[3];
      const author = (headerMatch[4] || headerMatch[6] || "").trim();

      const promptMatch = part.match(/\*\*提示词:\*\*\s*```\s*\n([\s\S]*?)```/);
      const prompt = promptMatch ? promptMatch[1].trim() : "";
      if (!prompt) continue;

      const inputMatch = part.match(/\*\*输入:\*\*\s*([\s\S]+?)(?=\n\*\*|\n```|$)/);
      const input = inputMatch ? inputMatch[1].trim() : undefined;

      const noteMatch = part.match(/> \[!NOTE\]\s*\n> \*\*([\s\S]+?)\*\*/);
      const note = noteMatch ? noteMatch[1].trim() : undefined;

      const imgMatch = part.match(/<img src="(images\/[^"]+)"[^>]*alt="输出结果">/);
      const imagePath = imgMatch ? imgMatch[1] : part.match(/<img src="(images\/[^"]+\.(?:jpg|png|webp|gif))"/)?.[1];
      const imageUrl = imagePath ? IMAGE_BASE + imagePath : undefined;

      examples.push({
        id: `data-${source}-${num}`,
        title,
        author,
        link,
        source,
        tags: [source],
        input,
        prompt,
        note,
        imageUrl,
      });
    }
  };

  parseSection(proSection?.[1], "pro");
  parseSection(bananaSection?.[1], "banana");
  return examples;
}

// 解析 nano-pro.md
function parseNanoPro(content) {
  const examples = [];
  const parts = content.split(/(?=### \d+\.\d+\.)/).filter(Boolean);

  for (const part of parts) {
    const headerMatch = part.match(/^### (\d+)\.(\d+)\.\s*(.+?)(?=\n|$)/);
    if (!headerMatch) continue;

    const title = headerMatch[3].trim();
    const promptMatch = part.match(/\*\*Prompt:\*\*\s*```(?:text|json)?\s*\n([\s\S]*?)```/);
    const prompt = promptMatch ? promptMatch[1].trim() : "";
    if (!prompt) continue;

    const sourceMatch = part.match(/\*Source:\s*([^*]+)\*/);
    let author = "";
    let link;
    if (sourceMatch) {
      const src = sourceMatch[1].trim();
      const atMatch = src.match(/\[@?([^\]]+)\]\((https?:\/\/[^)]+)\)/);
      const nameMatch = src.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
      if (atMatch) {
        author = atMatch[1].replace(/^@/, "");
        link = src.match(/\[Post\]\((https?:\/\/[^)]+)\)/)?.[1] || atMatch[2];
      } else if (nameMatch) {
        author = nameMatch[1];
        link = nameMatch[2];
      }
    }

    const imgMatches = [...part.matchAll(/<img[^>]+src="(https?:\/\/[^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/g)];
    const generatedImg = imgMatches.find((m) => /generated|输出|result/i.test(m[2] || ""));
    const imageUrl = generatedImg?.[1] ?? imgMatches[0]?.[1];
    const subtitleMatch = part.match(/^\*([^*]+)\*/m);
    const note = subtitleMatch ? subtitleMatch[1].trim() : undefined;

    examples.push({
      id: `nano-pro-${headerMatch[1]}-${headerMatch[2]}`,
      title,
      author,
      link,
      source: "nano-pro",
      tags: ["nano-pro"],
      prompt,
      note,
      imageUrl,
    });
  }
  return examples;
}

// 解析 new.md (Awesome)
function parseNewMd(content) {
  const examples = [];
  const parts = content.split(/(?=### No\. \d+:)/).filter(Boolean);

  for (const part of parts) {
    const headerMatch = part.match(/^### No\. (\d+):\s*(.+?)(?=\n|$)/);
    if (!headerMatch) continue;

    const fullTitle = headerMatch[2].trim();
    const { category, title } = extractCategory(fullTitle);
    const displayTitle = title || fullTitle;

    const promptMatch = part.match(/#### 📝 Prompt\s*\n```\s*\n([\s\S]*?)```/);
    const prompt = promptMatch ? promptMatch[1].trim() : "";
    if (!prompt) continue;

    const descMatch = part.match(/#### 📖 Description\s*\n\s*\n([\s\S]*?)(?=\n#### |$)/);
    const note = descMatch ? descMatch[1].trim() : undefined;

    const imgMatch = part.match(/<img src="(https?:\/\/[^"]+)"[^>]*alt="[^"]*Image 1/);
    const imageUrl = imgMatch ? imgMatch[1] : part.match(/<img src="(https?:\/\/[^"]+)"[^>]*>/)?.[1];

    const authorMatch = part.match(/\*\*Author:\*\*\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    const author = authorMatch ? authorMatch[1] : "";
    const linkMatch = part.match(/\*\*Source:\*\*\s*\[[^\]]+\]\((https?:\/\/[^)]+)\)/);
    const link = linkMatch ? linkMatch[1] : undefined;

    const tags = ["awesome"];
    if (category) tags.push(category);

    const badges = [...part.matchAll(/!\[([^\]]+)\]\([^)]+\)/g)];
    for (const b of badges) {
      const badge = b[1];
      if (badge.startsWith("Language-")) {
        const lang = badge.replace("Language-", "").toLowerCase();
        if (!tags.includes(lang)) tags.push(lang);
      } else if (badge.includes("Featured")) {
        tags.push("featured");
      } else if (badge.includes("Raycast")) {
        tags.push("raycast");
      }
    }

    examples.push({
      id: null,
      title: displayTitle,
      author,
      link,
      source: "awesome",
      tags,
      prompt,
      note,
      imageUrl,
    });
  }
  return examples;
}

// 主流程
function main() {
  const all = [];
  let idCounter = 1;

  const dataPath = path.join(ROOT, "data.md");
  if (fs.existsSync(dataPath)) {
    const items = parseDataMd(fs.readFileSync(dataPath, "utf-8"));
    all.push(...items);
  }

  const nanoProPath = path.join(ROOT, "nano-pro.md");
  if (fs.existsSync(nanoProPath)) {
    const items = parseNanoPro(fs.readFileSync(nanoProPath, "utf-8"));
    all.push(...items);
  }

  const newPath = path.join(ROOT, "new.md");
  if (fs.existsSync(newPath)) {
    const items = parseNewMd(fs.readFileSync(newPath, "utf-8"));
    const seen = new Set(all.map((x) => x.id));
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let id = `awesome-${i + 1}`;
      while (seen.has(id)) id = `awesome-${idCounter++}`;
      item.id = id;
      seen.add(id);
      all.push(item);
    }
  }

  const output = {
    version: 1,
    updatedAt: new Date().toISOString(),
    total: all.length,
    prompts: all,
  };

  const outDir = path.join(ROOT, "public");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "prompts.json"),
    JSON.stringify(output, null, 0),
    "utf-8"
  );

  console.log(`Generated prompts.json with ${all.length} prompts`);
}

main();
