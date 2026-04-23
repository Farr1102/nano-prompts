#!/usr/bin/env node
/**
 * 将 public/prompts.json 同步到 Cloudflare D1（追加/更新策略 + diff）
 *
 * - 主键：id（与站内 /p/[id]、prompts.json 一致）
 * - content_hash：对 title/prompt/imageUrl/model/source/tags/author/link/input/note 的稳定序列化后 sha256
 * - UPSERT：ON CONFLICT(id) DO UPDATE … WHERE excluded.content_hash != prompts.content_hash
 *   → 仅内容变化时更新行；全新 id 则 INSERT（created_at 为首次入库时间）
 *
 * 用法：
 *   npm run generate
 *   npm run d1:sync              # 只生成 d1/.last-sync.sql
 *   npm run d1:sync -- --apply   # 生成并 wrangler d1 execute --remote（需 CLOUDFLARE_API_TOKEN、正确 database_id）
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PROMPTS_JSON = path.join(ROOT, "public", "prompts.json");
const OUT_SQL = path.join(ROOT, "d1", ".last-sync.sql");

function sqlStr(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function contentHash(item) {
  const payload = {
    title: item.title,
    prompt: item.prompt,
    imageUrl: item.imageUrl ?? "",
    model: item.model ?? "nano-banana",
    source: item.source,
    tags: [...(item.tags || [])].sort(),
    author: item.author ?? "",
    link: item.link ?? "",
    input: item.input ?? "",
    note: item.note ?? "",
  };
  return crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function readWranglerD1() {
  const p = path.join(ROOT, "wrangler.toml");
  if (!fs.existsSync(p)) return { name: null, id: null };
  const text = fs.readFileSync(p, "utf8");
  const name = text.match(/database_name\s*=\s*"([^"]+)"/)?.[1] ?? null;
  const id = text.match(/database_id\s*=\s*"([^"]+)"/)?.[1] ?? null;
  return { name, id };
}

function buildUpsertSql(rows) {
  // 远程 `wrangler d1 execute --file` 不宜包含 BEGIN/COMMIT（与 Cloudflare 限制一致）
  const lines = [];
  const cols =
    "id, title, author, link, source, model, tags_json, input, prompt, note, image_url, content_hash, synced_at";

  for (const item of rows) {
    const hash = contentHash(item);
    const tagsJson = JSON.stringify(item.tags || []);
    const syncedAt = new Date().toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "Z");

    const values = [
      sqlStr(item.id),
      sqlStr(item.title),
      sqlStr(item.author ?? ""),
      item.link ? sqlStr(item.link) : "NULL",
      sqlStr(item.source),
      sqlStr(item.model ?? "nano-banana"),
      sqlStr(tagsJson),
      item.input ? sqlStr(item.input) : "NULL",
      sqlStr(item.prompt),
      item.note ? sqlStr(item.note) : "NULL",
      item.imageUrl ? sqlStr(item.imageUrl) : "NULL",
      sqlStr(hash),
      sqlStr(syncedAt),
    ].join(", ");

    lines.push(`INSERT INTO prompts (${cols}) VALUES (${values})
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  author = excluded.author,
  link = excluded.link,
  source = excluded.source,
  model = excluded.model,
  tags_json = excluded.tags_json,
  input = excluded.input,
  prompt = excluded.prompt,
  note = excluded.note,
  image_url = excluded.image_url,
  content_hash = excluded.content_hash,
  synced_at = excluded.synced_at
WHERE excluded.content_hash != prompts.content_hash;`);
  }

  return lines.join("\n");
}

function main() {
  const apply = process.argv.includes("--apply");

  if (!fs.existsSync(PROMPTS_JSON)) {
    console.error("Missing public/prompts.json — run: npm run generate");
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(PROMPTS_JSON, "utf8"));
  const rows = data.prompts || [];
  if (!Array.isArray(rows) || rows.length === 0) {
    console.error("prompts.json has no prompts array");
    process.exit(1);
  }

  const sql = buildUpsertSql(rows);
  fs.mkdirSync(path.dirname(OUT_SQL), { recursive: true });
  fs.writeFileSync(OUT_SQL, sql, "utf8");

  console.log(`Wrote ${OUT_SQL} (${rows.length} upsert statements)`);

  if (!apply) {
    console.log("Dry run. Apply with: npm run d1:sync -- --apply");
    return;
  }

  const { name, id } = readWranglerD1();
  if (!name || !id || id.includes("REPLACE")) {
    console.error("Set database_name and a real database_id in wrangler.toml before --apply");
    process.exit(1);
  }

  const relFile = path.relative(ROOT, OUT_SQL);
  const r = spawnSync(
    "npx",
    ["wrangler", "d1", "execute", name, "--remote", "--file", relFile],
    { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" }
  );

  if (r.error) {
    console.error(r.error);
    process.exit(1);
  }
  process.exit(r.status ?? 1);
}

main();
