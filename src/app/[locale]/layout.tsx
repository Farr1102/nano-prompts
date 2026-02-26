import type { Metadata } from "next";
import { locales } from "@/lib/i18n";

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
    ? "Nano Banana Prompts - AI Prompt Library"
    : "Nano Banana 提示词库 - AI 提示词精选";
  const description = isEn
    ? "Curated prompts for Nano Banana & Nano Banana Pro. Search, filter by tags, one-click copy."
    : "Nano Banana 与 Nano Banana Pro 精选提示词集合，支持搜索、标签筛选、一键复制";

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nano-banana-prompts.vercel.app";
  const canonical = locale === "zh" ? `${baseUrl}/zh` : `${baseUrl}/en`;

  return {
    title,
    description,
    keywords: isEn
      ? ["Nano Banana", "AI prompts", "prompt library", "Nano Banana Pro", "Claude", "Gemini"]
      : ["Nano Banana", "提示词", "AI 提示词", "Nano Banana Pro", "Claude", "Gemini"],
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: isEn ? "Nano Banana Prompts" : "Nano Banana 提示词库",
      locale: isEn ? "en_US" : "zh_CN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical,
      languages: {
        "zh-CN": `${baseUrl}/zh`,
        en: `${baseUrl}/en`,
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
