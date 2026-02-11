import fs from "fs";
import path from "path";

const IMAGE_BASE = "https://raw.githubusercontent.com/PicoTrex/Awesome-Nano-Banana-images/main/";

export interface PromptExample {
  id: string;
  title: string;
  author: string;
  link?: string;
  category: "pro" | "banana" | "nano-pro";
  input?: string;
  prompt: string;
  note?: string;
  imageUrl?: string;
}

export function parseMarkdown(content: string): PromptExample[] {
  const examples: PromptExample[] = [];

  const proSection = content.match(/## 🍌 Nano Banana Pro 例子\n([\s\S]*?)(?=## 🖼️ Nano Banana 例子)/);
  const bananaSection = content.match(/## 🖼️ Nano Banana 例子\n([\s\S]*?)(?=## 🙏 Acknowledge)/);

  const parseSection = (sectionContent: string | undefined, category: "pro" | "banana") => {
    if (!sectionContent) return;

    const parts = sectionContent.split(/(?=### 例\s*\d+)/).filter(Boolean);
    const blocks: { num: string; title: string; link?: string; author: string; content: string }[] = [];

    for (const part of parts) {
      const headerMatch = part.match(/^### 例\s*(\d+)\s*[:\s：]?\s*(?:\[([^\]]+)\]\((https?:\/\/[^)]+)\)（by\s+\[@?([^\]]+)\](?:\([^)]*\))?\)?|([^（\n]+)（by\s+\[@?([^\]]+)\](?:\([^)]*\))?\)?)/);
      if (!headerMatch) continue;

      const num = headerMatch[1];
      const title = headerMatch[2] || headerMatch[5] || "";
      const link = headerMatch[3];
      const author = headerMatch[4] || headerMatch[6] || "";
      const content = part.slice(headerMatch[0].length);
      blocks.push({ num, title: title.trim(), link, author: author.trim(), content });
    }

    for (const block of blocks) {
      const inputMatch = block.content.match(/\*\*输入:\*\*\s*([\s\S]+?)(?=\n\*\*|\n```|$)/);
      const input = inputMatch ? inputMatch[1].trim() : undefined;

      const promptMatch = block.content.match(/\*\*提示词:\*\*\s*```\s*\n([\s\S]*?)```/);
      const prompt = promptMatch ? promptMatch[1].trim() : "";

      const noteMatch = block.content.match(/> \[!NOTE\]\s*\n> \*\*([\s\S]+?)\*\*/);
      const note = noteMatch ? noteMatch[1].trim() : undefined;

      const imgMatch = block.content.match(/<img src="(images\/[^"]+)"[^>]*alt="输出结果">/);
      const imagePath = imgMatch ? imgMatch[1] : block.content.match(/<img src="(images\/[^"]+\.(?:jpg|png|webp|gif))"/)?.[1];
      const imageUrl = imagePath ? IMAGE_BASE + imagePath : undefined;

      if (prompt) {
        examples.push({
          id: `${category}-${block.num}`,
          title: block.title,
          author: block.author,
          link: block.link,
          category,
          input,
          prompt,
          note,
          imageUrl,
        });
      }
    }
  };

  parseSection(proSection?.[1], "pro");
  parseSection(bananaSection?.[1], "banana");

  return examples;
}

export function parseNanoPro(content: string): PromptExample[] {
  const examples: PromptExample[] = [];
  const parts = content.split(/(?=### \d+\.\d+\.)/).filter(Boolean);

  for (const part of parts) {
    const headerMatch = part.match(/^### (\d+)\.(\d+)\.\s*(.+?)(?=\n|$)/);
    if (!headerMatch) continue;

    const sectionNum = headerMatch[1];
    const itemNum = headerMatch[2];
    const title = headerMatch[3].trim();

    const promptMatch = part.match(/\*\*Prompt:\*\*\s*```(?:text|json)?\s*\n([\s\S]*?)```/);
    const prompt = promptMatch ? promptMatch[1].trim() : "";
    if (!prompt) continue;

    const sourceMatch = part.match(/\*Source:\s*([^*]+)\*/);
    let author = "";
    let link: string | undefined;
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
      id: `nano-pro-${sectionNum}-${itemNum}`,
      title,
      author,
      link,
      category: "nano-pro",
      prompt,
      note,
      imageUrl,
    });
  }

  return examples;
}

export function getPromptData(): PromptExample[] {
  const examples: PromptExample[] = [];

  const dataPath = path.join(process.cwd(), "data.md");
  if (fs.existsSync(dataPath)) {
    examples.push(...parseMarkdown(fs.readFileSync(dataPath, "utf-8")));
  }

  const nanoProPath = path.join(process.cwd(), "nano-pro.md");
  if (fs.existsSync(nanoProPath)) {
    examples.push(...parseNanoPro(fs.readFileSync(nanoProPath, "utf-8")));
  }

  return examples;
}
