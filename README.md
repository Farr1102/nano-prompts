# 🍌 Nano Banana 提示词库

整合 data.md、nano-pro.md、new.md 的提示词，支持标签筛选、搜索、一键复制。

## 数据源

- **data.md** - PicoTrex Awesome-Nano-Banana-images（Pro + Banana）
- **nano-pro.md** - ZeroLu awesome-nanobanana-pro
- **new.md** - YouMind awesome-nano-banana-pro-prompts

## 开发

```bash
# 生成 prompts.json（解析三个 md 文件）
npm run generate

# 开发
npm run dev

# 构建（自动先执行 generate）
npm run build
```

## 结构

- `public/prompts.json` - 统一 JSON 数据，含 tags 字段
- `scripts/generate-prompts.mjs` - 生成脚本