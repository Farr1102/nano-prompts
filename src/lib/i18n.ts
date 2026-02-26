export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];

export const translations = {
  zh: {
    title: "Nano Banana 提示词库",
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
  },
  en: {
    title: "Nano Banana Prompts",
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
  },
  en: {
    pro: "Nano Banana Pro",
    banana: "Nano Banana",
    "nano-pro": "Awesome Nano Pro",
    awesome: "YouMind Awesome",
    zizheruan: "ZizheRuan Cases",
    antigravity: "Antigravity 900+",
    jimmy: "JimmyLv Picks",
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
