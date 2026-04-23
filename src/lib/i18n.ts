export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];

export const translations = {
  zh: {
    title: "多模型图像提示词库",
    subtitle: "{total} 个提示词 · 支持标签筛选 · 一键复制",
    searchPlaceholder: "搜索提示词...",
    filterResult: "筛选结果：{count} 个",
    clearTags: "清除标签",
    moreTags: "更多",
    copy: "复制",
    copied: "已复制",
    copyPrompt: "复制提示词",
    close: "关闭",
    input: "输入：",
    noImage: "暂无示例图",
    by: "by",
    noResults: "暂无匹配结果，试试调整搜索或标签",
    errorLoading: "数据加载失败，请稍后重试",
    expandTags: "展开更多标签",
    collapseTags: "收起标签",
    openInNewTab: "新标签页打开",
    showMore: "显示更多",
    openPromptAria: "查看提示词：{title}{suffix}",
    openPromptAriaAuthorSuffix: "，作者 @{author}",
    filterByTag: "按标签筛选：{tag}",
    modelAll: "全部",
    modelNanoBanana: "Nano Banana",
    modelGptImage2: "GPT Image 2",
    modelFilterAria: "按模型筛选",
    seoWebSiteDescription:
      "收录 Nano Banana、Nano Banana Pro、GPT Image 2 等 AI 图像生成提示词共 {total} 条，支持搜索、标签筛选与一键复制，持续同步社区精选。",
    seoModelHubNameNano: "Nano Banana 提示词精选（{count} 条）",
    seoModelHubNameGpt: "GPT Image 2 提示词精选（{count} 条）",
    seoModelHubDescNano:
      "Nano Banana / Nano Banana Pro 图像提示词合集，涵盖社区 Awesome 列表与实拍示例，支持标签筛选与复制。",
    seoModelHubDescGpt:
      "OpenAI GPT Image 2 图像生成提示词与案例，涵盖摄影、游戏风、UI 等分类，支持标签筛选与复制。",
    seoModelMetaTitleNano: "Nano Banana 提示词库 · Nano Banana Pro 精选",
    seoModelMetaTitleGpt: "GPT Image 2 提示词库 · OpenAI 图像生成精选",
    seoModelMetaDescNano:
      "浏览 {count} 条 Nano Banana 与 Nano Banana Pro 提示词：社区合集、标签筛选、一键复制，适合 Gemini 等图像工作流。",
    seoModelMetaDescGpt:
      "浏览 {count} 条 GPT Image 2 提示词：摄影/游戏/UI 等分类，来自 awesome-gpt-image 等精选源，支持搜索与复制。",
    modelHubSubtitle: "{count} 条 · 标签筛选 · 一键复制",
    modelCornerBadgeNano: "Nano",
    modelCornerBadgeGpt: "GPT Image 2",
  },
  en: {
    title: "Multi-model Image Prompts",
    subtitle: "{total} prompts · Tag filter · One-click copy",
    searchPlaceholder: "Search prompts...",
    filterResult: "Filtered: {count}",
    clearTags: "Clear tags",
    moreTags: "more",
    copy: "Copy",
    copied: "Copied",
    copyPrompt: "Copy prompt",
    close: "Close",
    input: "Input:",
    noImage: "No sample image",
    by: "by",
    noResults: "No results. Try adjusting search or tags.",
    errorLoading: "Failed to load data. Please try again later.",
    expandTags: "Show more tags",
    collapseTags: "Collapse tags",
    openInNewTab: "Open in new tab",
    showMore: "Show more",
    openPromptAria: "View prompt: {title}{suffix}",
    openPromptAriaAuthorSuffix: ", by @{author}",
    filterByTag: "Filter by tag: {tag}",
    modelAll: "All models",
    modelNanoBanana: "Nano Banana",
    modelGptImage2: "GPT Image 2",
    modelFilterAria: "Filter by model",
    seoWebSiteDescription:
      "{total}+ curated prompts for Nano Banana, Nano Banana Pro, and GPT Image 2. Search, filter by tags, copy in one click — updated from top community lists.",
    seoModelHubNameNano: "Nano Banana prompts ({count})",
    seoModelHubNameGpt: "GPT Image 2 prompts ({count})",
    seoModelHubDescNano:
      "Nano Banana & Nano Banana Pro image prompts from curated Awesome lists and examples. Filter by tag and copy instantly.",
    seoModelHubDescGpt:
      "GPT Image 2 image generation prompts: photography, games, UI, and more — sourced from awesome-gpt-image and community picks.",
    seoModelMetaTitleNano: "Nano Banana Prompts · Nano Banana Pro Library",
    seoModelMetaTitleGpt: "GPT Image 2 Prompts · OpenAI Image Generation Library",
    seoModelMetaDescNano:
      "Browse {count} Nano Banana & Pro prompts: community lists, tag filters, one-click copy — ideal for Gemini-style image workflows.",
    seoModelMetaDescGpt:
      "Browse {count} GPT Image 2 prompts across photography, games, UI, and more — from awesome-gpt-image and curated sources.",
    modelHubSubtitle: "{count} prompts · Tags · One-click copy",
    modelCornerBadgeNano: "Nano",
    modelCornerBadgeGpt: "GPT Image 2",
  },
} as const;

export const sourceLabels: Record<Locale, Record<string, string>> = {
  zh: {
    pro: "Nano Banana Pro",
    banana: "Nano Banana",
    "nano-pro": "Awesome Nano Pro",
    awesome: "YouMind Awesome",
    zizheruan: "ZizheRuan 案例",
    antigravity: "Antigravity 900+",
    jimmy: "JimmyLv 精选",
    "gpt-image-awesome": "Awesome GPT Image 2",
  },
  en: {
    pro: "Nano Banana Pro",
    banana: "Nano Banana",
    "nano-pro": "Awesome Nano Pro",
    awesome: "YouMind Awesome",
    zizheruan: "ZizheRuan Cases",
    antigravity: "Antigravity 900+",
    jimmy: "JimmyLv Picks",
    "gpt-image-awesome": "Awesome GPT Image 2",
  },
};

export function t(locale: Locale, key: keyof typeof translations.zh, params?: Record<string, string | number>): string {
  let text: string = translations[locale][key] ?? translations.zh[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}
