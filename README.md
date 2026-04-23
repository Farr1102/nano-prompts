# 🖼️ 多模型图像提示词库

整合 **Nano Banana / Nano Banana Pro** 与 **GPT Image 2** 等多来源提示词，支持按模型与标签筛选、搜索、一键复制。

## 数据源

| 文件 | 模型 | 来源 |
|------|------|------|
| data.md | Nano Banana | [PicoTrex/Awesome-Nano-Banana-images](https://github.com/PicoTrex/Awesome-Nano-Banana-images) |
| nano-pro.md | Nano Banana | [ZeroLu/awesome-nanobanana-pro](https://github.com/ZeroLu/awesome-nanobanana-pro) |
| new.md | Nano Banana | [YouMind-OpenLab/awesome-nano-banana-pro-prompts](https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts) |
| zizheruan.md | Nano Banana | [ZizheRuan/awesome-nano-banana-pro-prompts-and-examples](https://github.com/ZizheRuan/awesome-nano-banana-pro-prompts-and-examples) |
| antigravity.md | Nano Banana | [devanshug2307/Awesome-Nano-Banana-Prompts](https://github.com/devanshug2307/Awesome-Nano-Banana-Prompts) |
| jimmy.md | Nano Banana | [JimmyLv/awesome-nano-banana](https://github.com/JimmyLv/awesome-nano-banana) |
| gpt-image.md | GPT Image 2 | [ZeroLu/awesome-gpt-image](https://github.com/ZeroLu/awesome-gpt-image) |

## 自动化更新

### 方式一：GitHub Actions（推荐）

推送代码到 GitHub 后，每周一自动从上游拉取最新内容并更新。

- 定时：每周一 8:00 UTC
- 手动：Actions → Update Prompts → Run workflow

### 方式二：本地命令

```bash
# 从 GitHub 拉取最新 md 并生成 prompts.json
npm run update

# 仅拉取（不生成）
npm run fetch

# 仅生成（使用本地 md）
npm run generate
```

### 新增数据源

编辑 `scripts/sources.config.json`，添加新的 source 后需在 `generate-prompts.mjs` 中实现对应 parser。

## 开发

```bash
npm run dev    # 开发（自动 generate）
npm run build  # 构建（自动 generate）
```

## SEO 与多语言

- **路由**：`/zh` 中文、`/en` 英文；根路径 `/` 在浏览器内按语言跳转 `/zh` 或 `/en`（静态导出兼容 Cloudflare Pages，无 Edge middleware）。
- **模型页**：`/zh/m/nano-banana`、`/zh/m/gpt-image-2` 等；旧链接 `?model=` 会在客户端规范到上述路径。
- **SEO**：metadata、Open Graph、Twitter、sitemap.xml、robots.txt、hreflang、单条提示词页 `/p/[id]`
- **部署（Cloudflare Pages · 静态导出）**
  1. 框架预设可选 **无**；**构建命令** `npm run build`；**构建输出目录**填 **`out`**（不要填 `.next`）。
  2. 环境变量 **Production**：`NEXT_PUBLIC_SITE_URL` = `https://你的子域.域名`（须含 `https://`）。
  3. 构建产物为纯静态 HTML（`output: 'export'`），无 Node 运行时；远程图片使用 `next/image` 的 **unoptimized** 模式。
- **部署（Vercel · 完整 Next）**  
  若改回默认 `next build`（去掉 `output: 'export'`）并恢复 middleware，可用 Vercel 托管；当前仓库默认配置面向 **CF Pages 静态**。

## 功能特性

- 按模型浏览：全部 / Nano Banana / GPT Image 2（路径 `/m/nano-banana`、`/m/gpt-image-2`，或首页带 `?model=` 会自动跳到路径形式）
- 搜索防抖、URL 可分享（`?q=xxx&tags=a,b&p=id`）
- 标签展开/收起、分区「显示更多」
- 图片懒加载与 Next/Image（静态导出为 unoptimized，由 CDN/浏览器加载原图）
- 无障碍（a11y）、Vercel Analytics

## 结构

- `scripts/sources.config.json` - 数据源配置
- `scripts/fetch-sources.mjs` - 从 GitHub 拉取
- `scripts/generate-prompts.mjs` - 解析并生成 JSON
- `public/prompts.json` - 统一 JSON 输出
