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

    let imageUrl;
    const imgMatches = [...part.matchAll(/<img[^>]+src="(https?:\/\/[^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/g)];
    const generatedImg = imgMatches.find((m) => /generated|输出|result/i.test(m[2] || ""));
    imageUrl = generatedImg?.[1] ?? imgMatches[0]?.[1];
    if (!imageUrl) {
      const mdImg = part.match(/!\[[^\]]*\]\((https?:\/\/[^)]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^)]*)?)\)/);
      imageUrl = mdImg ? mdImg[1] : undefined;
    }
    if (imageUrl && imageUrl.includes("pbs.twimg.com") && !imageUrl.includes(":")) {
      imageUrl = imageUrl.replace(/\.(jpg|png|webp)(\?|$)/, ".$1:large$2");
    }
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

// 解析 zizheruan.md (Case N: 格式)
function parseZizheruan(content) {
  const examples = [];
  const parts = content.split(/(?=### Case \d+:)/).filter(Boolean);

  for (const part of parts) {
    const headerMatch = part.match(/^### Case (\d+):\s*\[([^\]]+)\]\((https?:\/\/[^)]+)\)[（(]by\s+\[@?([^\]]+)\]\((https?:\/\/[^)]+)\)[）)]/);
    if (!headerMatch) continue;

    const num = headerMatch[1];
    const title = headerMatch[2].trim();
    const link = headerMatch[3];
    const author = headerMatch[4].replace(/^@/, "");

    const promptMatch = part.match(/\*\*prompt:\*\*\s*```\s*\n([\s\S]*?)```/);
    const prompt = promptMatch ? promptMatch[1].trim() : "";
    if (!prompt) continue;

    const imgMatch = part.match(/<img[^>]+src="(https?:\/\/[^"]+)"[^>]*>/);
    let imageUrl = imgMatch ? imgMatch[1] : undefined;
    if (!imageUrl) {
      const relImg = part.match(/<img[^>]+src="(images\/[^"]+)"[^>]*>/);
      if (relImg) imageUrl = "https://raw.githubusercontent.com/ZizheRuan/awesome-nano-banana-pro-prompts-and-examples/main/" + relImg[1];
    }

    examples.push({
      id: `zizheruan-${num}`,
      title,
      author,
      link,
      source: "zizheruan",
      tags: ["zizheruan"],
      prompt,
      imageUrl,
    });
  }
  return examples;
}

// 解析 jimmy.md (Case N: Title (by @author) 格式)
function parseJimmy(content) {
  const examples = [];
  const parts = content.split(/(?=### Case \d+:)/).filter(Boolean);

  for (const part of parts) {
    const headerMatch = part.match(/^### Case (\d+):\s*(.+?)\s*\(by\s+\[@?([^\]]+)\]\((https?:\/\/[^)]+)\)\)/);
    if (!headerMatch) continue;

    const num = headerMatch[1];
    const title = headerMatch[2].trim();
    const author = headerMatch[3].replace(/^@/, "");
    const link = headerMatch[4];

    const promptMatch = part.match(/\*\*Prompt\*\*\s*\n```\s*\n([\s\S]*?)```/);
    const prompt = promptMatch ? promptMatch[1].trim() : "";
    if (!prompt) continue;

    const imgMatches = [...part.matchAll(/<img[^>]+src="(https?:\/\/[^"]+)"[^>]*>/g)];
    const geminiImg = imgMatches.find((m) => /gemini|chatimg|chatvid/i.test(m[1]));
    const otherImg = imgMatches.find((m) => !/shields\.io|badge|favicon/i.test(m[1]));
    const imageUrl = geminiImg?.[1] ?? otherImg?.[1];

    const noteMatch = part.match(/\*Note:([^*]+)\*/);
    const note = noteMatch ? noteMatch[1].trim() : undefined;

    examples.push({
      id: `jimmy-${num}`,
      title,
      author,
      link,
      source: "jimmy",
      tags: ["jimmy"],
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
const SOURCE_ORDER = [
  { file: "data.md", parser: parseDataMd },
  { file: "nano-pro.md", parser: parseNanoPro },
  { file: "new.md", parser: parseNewMd },
  { file: "zizheruan.md", parser: parseZizheruan },
  { file: "antigravity.md", parser: parseNanoPro },
  { file: "jimmy.md", parser: parseJimmy },
];

function main() {
  const all = [];
  let idCounter = 1;

  for (const { file, parser } of SOURCE_ORDER) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    let items = parser(content);

    if (file === "antigravity.md") {
      items = items.map((item) => ({ ...item, source: "antigravity", id: item.id.replace("nano-pro-", "antigravity-"), tags: ["antigravity"] }));
    }

    const seen = new Set(all.map((x) => x.id));
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.id || seen.has(item.id)) {
        item.id = `${item.source}-${idCounter++}`;
      }
      seen.add(item.id);
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
