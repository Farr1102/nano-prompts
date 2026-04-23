import { t, type Locale } from "@/lib/i18n";

export const INDEXABLE_MODEL_SLUGS = ["nano-banana", "gpt-image-2"] as const;
export type IndexableModelSlug = (typeof INDEXABLE_MODEL_SLUGS)[number];

export function isIndexableModelSlug(s: string): s is IndexableModelSlug {
  return (INDEXABLE_MODEL_SLUGS as readonly string[]).includes(s);
}

/** 首页：WebSite（含站内搜索）+ Organization + CollectionPage */
export function buildHomeJsonLd(opts: {
  baseUrl: string;
  locale: Locale;
  total: number;
}) {
  const { baseUrl, locale, total } = opts;
  const siteName = locale === "en" ? "Multi-model Image Prompts" : "多模型图像提示词库";
  const pageUrl = `${baseUrl}/${locale}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: siteName,
        description: t(locale, "seoWebSiteDescription", { total: String(total) }),
        inLanguage: locale === "en" ? "en" : "zh-CN",
        publisher: { "@id": `${baseUrl}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/${locale}?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: siteName,
        url: baseUrl,
      },
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}/#collection`,
        name: t(locale, "title"),
        description: t(locale, "subtitle", { total: String(total) }),
        url: pageUrl,
        isPartOf: { "@id": `${baseUrl}/#website` },
        numberOfItems: total,
        inLanguage: locale === "en" ? "en" : "zh-CN",
      },
    ],
  };
}

/** 模型聚合页：WebPage + 面包屑 */
export function buildModelHubJsonLd(opts: {
  baseUrl: string;
  locale: Locale;
  model: IndexableModelSlug;
  count: number;
}) {
  const { baseUrl, locale, model, count } = opts;
  const pageUrl = `${baseUrl}/${locale}/m/${model}`;
  const homeUrl = `${baseUrl}/${locale}`;
  const pageName =
    model === "gpt-image-2"
      ? t(locale, "seoModelHubNameGpt", { count: String(count) })
      : t(locale, "seoModelHubNameNano", { count: String(count) });
  const desc =
    model === "gpt-image-2"
      ? t(locale, "seoModelHubDescGpt", { count: String(count) })
      : t(locale, "seoModelHubDescNano", { count: String(count) });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: pageName,
        description: desc,
        isPartOf: { "@id": `${baseUrl}/#website` },
        inLanguage: locale === "en" ? "en" : "zh-CN",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: t(locale, "title"),
            item: homeUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: model === "gpt-image-2" ? t(locale, "modelGptImage2") : t(locale, "modelNanoBanana"),
            item: pageUrl,
          },
        ],
      },
    ],
  };
}
