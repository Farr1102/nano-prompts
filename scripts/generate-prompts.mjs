#!/usr/bin/env node
/**
 * 从各数据源 md 生成统一的 prompts.json（多模型：Nano Banana、GPT Image 2 等）
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const IMAGE_BASE = "https://raw.githubusercontent.com/PicoTrex/Awesome-Nano-Banana-images/main/";
const JIMMY_IMAGE_BASE = "https://cdn.jsdelivr.net/gh/jamez-bondos/awesome-gpt4o-images/";

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
        model: "nano-banana",
        tags: [source, "nano-banana"],
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
    if (!imageUrl) {
      const fallback = part.match(/!\[[^\]]*\]\((https?:\/\/[^)]+\?(?:[^)]*format=(?:jpg|png|webp|gif)[^)]*))\)/);
      imageUrl = fallback ? fallback[1] : undefined;
    }
    if (imageUrl && imageUrl.includes("pbs.twimg.com")) {
      if (!imageUrl.includes(":")) {
        imageUrl = imageUrl.replace(/\.(jpg|png|webp)(\?|$)/, ".$1:large$2");
      }
      if (!imageUrl.includes(":large") && !imageUrl.match(/name=/)) {
        imageUrl += ":large";
      }
    }
    const subtitleMatch = part.match(/^\*([^*]+)\*/m);
    const note = subtitleMatch ? subtitleMatch[1].trim() : undefined;

    examples.push({
      id: `nano-pro-${headerMatch[1]}-${headerMatch[2]}`,
      title,
      author,
      link,
      source: "nano-pro",
      model: "nano-banana",
      tags: ["nano-pro", "nano-banana"],
      prompt,
      note,
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
    let imageUrl = geminiImg?.[1] ?? otherImg?.[1];
    if (!imageUrl) {
      const relImg = part.match(/<img[^>]+src="(cases\/[^"]+\.(?:png|jpg|jpeg|webp|gif))"/);
      if (relImg) imageUrl = JIMMY_IMAGE_BASE + relImg[1];
    }

    const noteMatch = part.match(/\*Note:([^*]+)\*/);
    const note = noteMatch ? noteMatch[1].trim() : undefined;

    examples.push({
      id: `jimmy-${num}`,
      title,
      author,
      link,
      source: "jimmy",
      model: "nano-banana",
      tags: ["jimmy", "nano-banana"],
      prompt,
      note,
      imageUrl,
    });
  }
  return examples;
}

// 解析 gpt-image.md（ZeroLu/awesome-gpt-image、Anil-matcha 等，GPT Image 2）
function parseGptImageAwesome(content, options = {}) {
  const examples = [];
  const RAW_BASE =
    options.rawBase ?? "https://raw.githubusercontent.com/ZeroLu/awesome-gpt-image/main/";
  const sourceKey = options.source ?? "gpt-image-awesome";
  const sections = content.split(/(?=^## [^#])/m).filter((s) => s.trim());

  for (const section of sections) {
    const secMatch = section.match(/^##\s+(.+)$/m);
    if (!secMatch) continue;
    const sectionTitle = secMatch[1].trim();
    const sectionLower = sectionTitle.toLowerCase();
    if (
      sectionLower.includes("table of contents") ||
      sectionLower.startsWith("why gpt") ||
      sectionLower.includes("contributing") ||
      sectionLower === "introduction" ||
      sectionLower === "news" ||
      sectionLower === "menu"
    ) {
      continue;
    }

    const categoryTag =
      sectionTitle
        .replace(/^#{1,6}\s*/, "")
        .replace(/^[^\p{L}\p{N}\u4e00-\u9fff]+\s*/u, "")
        .trim() || sectionTitle;

    const subparts = section.split(/(?=^### )/m).filter((p) => p.trim());
    for (const part of subparts) {
      if (!/^###\s+/m.test(part)) continue;
      const headerMatch = part.match(/^###\s+(.+)$/m);
      if (!headerMatch) continue;
      const title = headerMatch[1].trim();

      const promptMatch = part.match(/\*\*Prompt:\*\*\s*\n```(?:text)?\s*\n([\s\S]*?)```/);
      const prompt = promptMatch ? promptMatch[1].trim() : "";
      if (!prompt) continue;

      let imageUrl;
      const hasGptImageCol = /\|\s*GPT[- ]?Image\b/i.test(part);
      const htmlImgs = [...part.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi)];
      if (htmlImgs.length >= 2 && hasGptImageCol) {
        imageUrl = htmlImgs[1][1];
      } else {
        imageUrl = htmlImgs[0]?.[1];
      }
      if (!imageUrl) {
        const mdImgs = [...part.matchAll(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g)];
        if (mdImgs.length >= 2 && hasGptImageCol) {
          imageUrl = mdImgs[1][1];
        } else {
          imageUrl = mdImgs[0]?.[1];
        }
      }
      if (imageUrl && imageUrl.startsWith("assets/")) {
        imageUrl = RAW_BASE + imageUrl;
      }
      if (imageUrl && imageUrl.includes("pbs.twimg.com") && !imageUrl.includes(":")) {
        imageUrl = imageUrl.replace(/\.(jpg|png|webp)(\?|$)/, ".$1:large$2");
      }

      const sourceLine =
        part.match(/\*\*Source:\*\*\s*([^\n]+)/)?.[1] || part.match(/\*Source:\s*([^\n]+)/)?.[1];
      let author = "";
      let link;
      if (sourceLine) {
        const atMatch = sourceLine.match(/\[@?([^\]]+)\]\((https?:\/\/[^)]+)\)/);
        if (atMatch) {
          author = atMatch[1].replace(/^@/, "");
          link = atMatch[2];
        } else {
          const nameMatch = sourceLine.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
          if (nameMatch) {
            author = nameMatch[1];
            link = nameMatch[2];
          }
        }
      }

      const tags = ["gpt-image-2", sourceKey, categoryTag];

      examples.push({
        id: null,
        title,
        author,
        link,
        source: sourceKey,
        model: "gpt-image-2",
        tags,
        prompt,
        imageUrl,
      });
    }
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

    const tags = ["awesome", "nano-banana"];
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
      model: "nano-banana",
      tags,
      prompt,
      note,
      imageUrl,
    });
  }
  return examples;
}

/** YouMind awesome-gpt-image-2：结构与 new.md（parseNewMd）一致，归类为 GPT Image 2 */
function parseYouMindGptImage2(content) {
  return parseNewMd(content).map((item) => ({
    ...item,
    model: "gpt-image-2",
    source: "youmind-gpt-image-2",
    tags: [
      "gpt-image-2",
      "youmind-gpt-image-2",
      ...item.tags.filter((t) => t !== "nano-banana" && t !== "awesome"),
    ],
  }));
}

/** peterRooo awesome-gpt-image-2-prompts JSON 数据源（直接 fetch 不依赖本地文件） */
const PETER_GPT2_JSON_URL =
  "https://raw.githubusercontent.com/peterRooo/awesome-gpt-image-2-prompts/main/data/gpt-image-2-prompts.json";

async function parsePeterImages() {
  let items;
  try {
    const res = await fetch(PETER_GPT2_JSON_URL, {
      headers: { "User-Agent": "nano-prompt-updater/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    items = JSON.parse(await res.text());
  } catch (err) {
    console.error(`  [peter-gpt2] fetch failed: ${err.message}, using local cache if available`);
    const filePath = path.join(ROOT, "peter-gpt2.json");
    if (fs.existsSync(filePath)) {
      items = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } else {
      return [];
    }
  }
  return items.map((item) => ({
    id: `peter-gpt2-${item.index}`,
    title: item.title,
    author: item.author_name?.replace(/^@/, "") || "",
    link: item.source_url || undefined,
    source: "peter-gpt2",
    model: "gpt-image-2",
    tags: ["gpt-image-2", "peter-gpt2", item.language || "en", item.category || ""].filter(Boolean),
    prompt: item.prompt,
    note: undefined,
    imageUrl: item.image_url || undefined,
  }));
}

// 主流程
const SOURCE_ORDER = [
  { file: "data.md", parser: parseDataMd },
  { file: "nano-pro.md", parser: parseNanoPro },
  { file: "new.md", parser: parseNewMd },
  { file: "antigravity.md", parser: parseNanoPro },
  { file: "jimmy.md", parser: parseJimmy },
  { file: "gpt-image.md", parser: (c) => parseGptImageAwesome(c) },
  {
    file: "gpt-image-anil.md",
    parser: (c) =>
      parseGptImageAwesome(c, {
        rawBase: "https://raw.githubusercontent.com/Anil-matcha/Awesome-GPT-Image-2-API-Prompts/main/",
        source: "anil-gpt-image-2",
      }),
  },
  { file: "gpt-image-youmind.md", parser: parseYouMindGptImage2 },
  // peter-gpt2 为 async JSON fetch，在 main() 中单独处理
];

async function main() {
  let all = [];
  let idCounter = 1;
  /** 全量插入顺序 */
  let sortOrder = 0;

  for (const { file, parser } of SOURCE_ORDER) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf-8");
    let items = parser(content);

    if (file === "antigravity.md") {
      items = items.map((item) => ({
        ...item,
        source: "antigravity",
        id: item.id.replace("nano-pro-", "antigravity-"),
        tags: ["antigravity", "nano-banana"],
      }));
    }

    items = items.filter(
      (item) => typeof item.imageUrl === "string" && item.imageUrl.trim().length > 0
    );

    const seen = new Set(all.map((x) => x.id));
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.id || seen.has(item.id)) {
        item.id = `${item.source}-${idCounter++}`;
      }
      seen.add(item.id);
      const model = item.model || "nano-banana";
      const tags = item.tags || [];
      const withModelTag =
        model === "nano-banana" && !tags.includes("nano-banana")
          ? [...tags, "nano-banana"]
          : model === "gpt-image-2" && !tags.includes("gpt-image-2")
            ? [...tags, "gpt-image-2"]
            : tags;
      all.push({
        ...item,
        model,
        tags: withModelTag,
        _sortOrder: sortOrder++,
      });
    }
  }

  // peter-gpt2: async fetch JSON source, no local file dependency
  const peterItems = await parsePeterImages();
  for (const item of peterItems) {
    all.push({
      ...item,
      _sortOrder: sortOrder++,
    });
  }

  // 按写入顺序排列，最新数据在前
  all.sort((a, b) => b._sortOrder - a._sortOrder);

  const prompts = all.map(({ _sortOrder, ...rest }) => rest);

  const output = {
    version: 1,
    updatedAt: new Date().toISOString(),
    total: prompts.length,
    prompts,
  };

  const outDir = path.join(ROOT, "public");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "prompts.json"),
    JSON.stringify(output, null, 0),
    "utf-8"
  );

  console.log(`Generated prompts.json with ${prompts.length} prompts`);
}

main().catch((err) => {
  console.error("  ✗ Fatal error:", err.message);
  process.exit(1);
});
