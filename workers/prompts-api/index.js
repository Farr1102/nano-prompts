/**
 * Cloudflare Worker：从 D1 读 prompts，提供与前端 fetchPromptPage / fetchPromptById 兼容的 JSON。
 * 部署：npx wrangler deploy（需 wrangler.toml 中真实 database_id）
 */
import { clampPageSize, queryPrompts } from "./query.js";

/** @type {PromptItem[]} */
let memoryCache = null;
let memoryCacheAt = 0;
const CACHE_MS = 45_000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

/** @param {Record<string, string>} h */
function json(data, status = 200, h = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS, ...h },
  });
}

/** @param {import("@cloudflare/workers-types").D1Database} db */
function rowToItem(row) {
  let tags = [];
  try {
    tags = JSON.parse(row.tags_json || "[]");
  } catch {
    tags = [];
  }
  return {
    id: row.id,
    title: row.title,
    author: row.author ?? "",
    link: row.link || undefined,
    source: row.source,
    model: row.model ?? "nano-banana",
    tags,
    input: row.input || undefined,
    prompt: row.prompt,
    note: row.note || undefined,
    imageUrl: row.image_url || undefined,
  };
}

/**
 * @param {{ DB: import("@cloudflare/workers-types").D1Database }} env
 * @returns {Promise<PromptItem[]>}
 */
async function loadAllFromD1(env) {
  const now = Date.now();
  if (memoryCache && now - memoryCacheAt < CACHE_MS) return memoryCache;

  const { results } = await env.DB.prepare(
    `SELECT id, title, author, link, source, model, tags_json, input, prompt, note, image_url
     FROM prompts`
  ).all();

  /** @type {PromptItem[]} */
  const items = (results || []).map((r) => rowToItem(r));
  memoryCache = items;
  memoryCacheAt = now;
  return items;
}

function parseModel(raw) {
  if (raw === "nano-banana" || raw === "gpt-image-2") return raw;
  return "all";
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, "") || "/";
    if (path !== "/api/prompts") {
      return new Response("Not Found", { status: 404, headers: CORS });
    }

    const id = url.searchParams.get("id");
    if (id) {
      const row = await env.DB.prepare(
        `SELECT id, title, author, link, source, model, tags_json, input, prompt, note, image_url
         FROM prompts WHERE id = ? LIMIT 1`
      )
        .bind(id)
        .first();
      if (request.method === "HEAD") return new Response(null, { status: 200, headers: CORS });
      return json({ item: row ? rowToItem(row) : null });
    }

    const model = parseModel(url.searchParams.get("model"));
    const q = url.searchParams.get("q") ?? "";
    const tagsParam = url.searchParams.get("tags") ?? "";
    const tags = tagsParam
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const limit = clampPageSize(parseInt(url.searchParams.get("limit") ?? "24", 10), 24);
    const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);

    const all = await loadAllFromD1(env);
    const filtered = queryPrompts(all, { model, q, tags });
    const slice = filtered.slice(offset, offset + limit);
    const nextOffset = offset + slice.length < filtered.length ? offset + slice.length : null;

    if (request.method === "HEAD") return new Response(null, { status: 200, headers: CORS });

    return json({
      items: slice,
      total: filtered.length,
      nextOffset,
      hasMore: nextOffset !== null,
      limit,
      offset,
      source: "d1",
    });
  },
};
