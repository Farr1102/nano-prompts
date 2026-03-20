# 🍌 Nano Banana 提示词库

整合 data.md、nano-pro.md、new.md 的提示词，支持标签筛选、搜索、一键复制。

## 数据源

| 文件 | 来源 |
|------|------|
| data.md | [PicoTrex/Awesome-Nano-Banana-images](https://github.com/PicoTrex/Awesome-Nano-Banana-images) |
| nano-pro.md | [ZeroLu/awesome-nanobanana-pro](https://github.com/ZeroLu/awesome-nanobanana-pro) |
| new.md | [YouMind-OpenLab/awesome-nano-banana-pro-prompts](https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts) |
| zizheruan.md | [ZizheRuan/awesome-nano-banana-pro-prompts-and-examples](https://github.com/ZizheRuan/awesome-nano-banana-pro-prompts-and-examples) |
| antigravity.md | [devanshug2307/Awesome-Nano-Banana-Prompts](https://github.com/devanshug2307/Awesome-Nano-Banana-Prompts) |
| jimmy.md | [JimmyLv/awesome-nano-banana](https://github.com/JimmyLv/awesome-nano-banana) |

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

- **路由**：`/zh` 中文、`/en` 英文，根路径 `/` 根据 Accept-Language 重定向
- **SEO**：metadata、Open Graph、Twitter Card、sitemap.xml、robots.txt、hreflang、单条提示词页 `/p/[id]`
- **部署（Vercel）**
  1. 将仓库接入 Vercel，Framework Preset 选 **Next.js**（默认即可）。
  2. **Build Command** 保持默认 `npm run build`（会先执行 `generate-prompts.mjs`，与本地一致）。
  3. 在 **Project → Settings → Environment Variables** 为 **Production**（以及 Preview 若需要）设置：
     - `NEXT_PUBLIC_SITE_URL` = 站点根地址，例如 `https://your-domain.vercel.app` 或自定义域名（须含 `https://`）。用于 canonical、hreflang、sitemap、JSON-LD 中的绝对 URL。
  4. 合并进 `main` 后由 Vercel 自动构建部署；本仓库的 **GitHub Actions「CI」** 会在 push/PR 上跑 `tsc` 与 `npm test`（与 Vercel 构建互补，不重复全量静态页生成）。

## 功能特性

- 搜索防抖、URL 可分享（`?q=xxx&tags=a,b&p=id`）
- 标签展开/收起、分区「显示更多」
- 图片懒加载与 Next/Image 优化
- 无障碍（a11y）、Vercel Analytics

## 结构

- `scripts/sources.config.json` - 数据源配置
- `scripts/fetch-sources.mjs` - 从 GitHub 拉取
- `scripts/generate-prompts.mjs` - 解析并生成 JSON
- `public/prompts.json` - 统一 JSON 输出
