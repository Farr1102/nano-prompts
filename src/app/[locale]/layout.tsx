import type { Metadata } from "next";
import { locales } from "@/lib/i18n";
import { getSiteBaseUrl } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";

  const title = isEn
    ? "Multi-model Image Prompts - Nano Banana & GPT Image 2"
    : "多模型图像提示词库 - Nano Banana 与 GPT Image 2";
  const description = isEn
    ? "Curated image prompts for Nano Banana, Nano Banana Pro, and GPT Image 2. Search, filter by model and tags, one-click copy."
    : "整合 Nano Banana、Nano Banana Pro、GPT Image 2 等图像模型提示词，支持按模型与标签筛选、一键复制。";

  const baseUrl = getSiteBaseUrl();
  const canonical = locale === "zh" ? `${baseUrl}/zh` : `${baseUrl}/en`;

  return {
    title: {
      default: title,
      template: isEn ? "%s · Multi-model Image Prompts" : "%s · 多模型图像提示词库",
    },
    description,
    applicationName: isEn ? "Multi-model Image Prompts" : "多模型图像提示词库",
    keywords: isEn
      ? [
          "Nano Banana",
          "GPT Image 2",
          "AI prompts",
          "prompt library",
          "Nano Banana Pro",
          "image generation",
          "OpenAI",
        ]
      : ["Nano Banana", "GPT Image 2", "提示词", "AI 提示词", "Nano Banana Pro", "图像生成", "OpenAI"],
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: isEn ? "Multi-model Image Prompts" : "多模型图像提示词库",
      locale: isEn ? "en_US" : "zh_CN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: {
      canonical,
      languages: {
        "zh-CN": `${baseUrl}/zh`,
        en: `${baseUrl}/en`,
        "x-default": `${baseUrl}/en`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
