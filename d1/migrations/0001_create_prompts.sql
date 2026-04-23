-- Prompts 主表：与 public/prompts.json 中单条结构对应；同步时用 id + content_hash 做 diff upsert

CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  link TEXT,
  source TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'nano-banana',
  tags_json TEXT NOT NULL DEFAULT '[]',
  input TEXT,
  prompt TEXT NOT NULL,
  note TEXT,
  image_url TEXT,
  content_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_prompts_model ON prompts(model);
CREATE INDEX IF NOT EXISTS idx_prompts_source ON prompts(source);
CREATE INDEX IF NOT EXISTS idx_prompts_content_hash ON prompts(content_hash);
