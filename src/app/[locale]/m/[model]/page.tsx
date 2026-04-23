import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPromptsData } from "@/lib/get-prompts-data";
import { getPromptModel } from "@/lib/prompts";
import { serializeJsonLdForScript } from "@/lib/json-ld";
import { buildModelHubJsonLd, isIndexableModelSlug, type IndexableModelSlug } from "@/lib/seo";
import { getSiteBaseUrl } from "@/lib/site";
import { locales, sourceLabels, t, type Locale } from "@/lib/i18n";
import PromptList from "@/components/PromptList";
import LangSwitcher from "@/components/LangSwitcher";

export function generateStaticParams() {
  const out: { locale: string; model: string }[] = [];
  for (const locale of locales) {
    for (const model of ["nano-banana", "gpt-image-2"] as const) {
      out.push({ locale, model });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; model: string }>;
}): Promise<Metadata> {
  const { locale, model: raw } = await params;
  if (!isIndexableModelSlug(raw)) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }
  const model = raw as IndexableModelSlug;
  const loc = (locale === "en" ? "en" : "zh") as Locale;
  const isEn = loc === "en";
  const { prompts } = getPromptsData();
  const count = prompts.filter((p) => getPromptModel(p) === model).length;

  const title =
    model === "gpt-image-2"
      ? `${t(loc, "seoModelMetaTitleGpt")} | ${t(loc, "title")}`
      : `${t(loc, "seoModelMetaTitleNano")} | ${t(loc, "title")}`;
  const description =
    model === "gpt-image-2"
      ? t(loc, "seoModelMetaDescGpt", { count: String(count) })
      : t(loc, "seoModelMetaDescNano", { count: String(count) });

  const baseUrl = getSiteBaseUrl();
  const canonical = `${baseUrl}/${loc}/m/${model}`;
  const keywords =
    model === "gpt-image-2"
      ? isEn
        ? ["GPT Image 2", "OpenAI", "image prompts", "DALL-E", "prompt engineering", "awesome-gpt-image"]
        : ["GPT Image 2", "OpenAI", "提示词", "图像生成", "DALL-E", "提示工程"]
      : isEn
        ? ["Nano Banana", "Nano Banana Pro", "Gemini", "image prompts", "prompt library"]
        : ["Nano Banana", "Nano Banana Pro", "Gemini", "提示词", "图像生成"];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
      languages: {
        "zh-CN": `${baseUrl}/zh/m/${model}`,
        en: `${baseUrl}/en/m/${model}`,
        "x-default": `${baseUrl}/en/m/${model}`,
      },
    },
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
    robots: { index: true, follow: true },
  };
}

export default async function ModelHubPage({
  params,
}: {
  params: Promise<{ locale: string; model: string }>;
}) {
  const { locale, model: raw } = await params;
  if (!isIndexableModelSlug(raw)) notFound();

  const model = raw as IndexableModelSlug;
  const loc = (locale === "en" ? "en" : "zh") as Locale;
  const data = getPromptsData();
  const { prompts } = data;
  const baseUrl = getSiteBaseUrl();
  const count = prompts.filter((p) => getPromptModel(p) === model).length;

  if (!prompts?.length) {
    return (
      <main className="min-h-screen">
        <header className="border-b border-stone-800 bg-stone-900/50 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-bold tracking-tight">🖼️ {t(loc, "title")}</h1>
              <LangSwitcher locale={loc} />
            </div>
          </div>
        </header>
        <div className="max-w-5xl mx-auto px-4 py-16 text-center text-stone-500">{t(loc, "errorLoading")}</div>
      </main>
    );
  }

  const labels = sourceLabels[loc];
  const h1 =
    model === "gpt-image-2"
      ? t(loc, "seoModelHubNameGpt", { count: String(count) })
      : t(loc, "seoModelHubNameNano", { count: String(count) });

  const jsonLd = buildModelHubJsonLd({ baseUrl, locale: loc, model, count });

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLdForScript(jsonLd) }}
      />
      <header className="border-b border-stone-800 bg-stone-900/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">🖼️ {h1}</h1>
              <p className="text-stone-400 mt-1 text-sm">
                {t(loc, "modelHubSubtitle", { count: String(count) })}
              </p>
              <p className="text-stone-500 mt-2 text-xs max-w-2xl leading-relaxed">
                {model === "gpt-image-2"
                  ? t(loc, "seoModelHubDescGpt", { count: String(count) })
                  : t(loc, "seoModelHubDescNano", { count: String(count) })}
              </p>
            </div>
            <LangSwitcher locale={loc} />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="py-8 text-stone-500 text-center">{t(loc, "searchPlaceholder")}</div>}>
          <PromptList prompts={prompts} sourceLabels={labels} locale={loc} />
        </Suspense>
      </div>
    </main>
  );
}
