#!/usr/bin/env node
/**
 * 从 GitHub 拉取最新 markdown 到本地
 * 用法: node scripts/fetch-sources.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

async function fetchUrl(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "nano-prompt-updater/1.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.text();
}

async function main() {
  const configPath = path.join(__dirname, "sources.config.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  console.log(`Fetching ${config.sources.length} sources from GitHub...\n`);

  for (const source of config.sources) {
    try {
      console.log(`  [${source.id}] ${source.name}`);
      const content = await fetchUrl(source.url);
      const outPath = path.join(ROOT, source.output);
      fs.writeFileSync(outPath, content, "utf-8");
      const lines = content.split("\n").length;
      console.log(`    → ${source.output} (${lines} lines)\n`);
    } catch (err) {
      console.error(`    ✗ Error: ${err.message}\n`);
    }
  }

  console.log("Done.");
}

main();
