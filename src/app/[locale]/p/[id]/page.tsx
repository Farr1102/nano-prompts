import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { serializeJsonLdForScript } from "@/lib/json-ld";
import { getPromptsData } from "@/lib/get-prompts-data";
import { getPromptModel } from "@/lib/prompts";
import { remoteImageIsOptimizable } from "@/lib/remote-image";
import { getSiteBaseUrl } from "@/lib/site";
import { sourceLabels, t, type Locale } from "@/lib/i18n";
import LangSwitcher from "@/components/LangSwitcher";

export async function generateStaticParams() {
  const { prompts } = getPromptsData();
  const params: { locale: string; id: string }[] = [];
  for (const locale of ["zh", "en"]) {
    for (const p of prompts) {
      params.push({ locale, id: p.id });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const { prompts } = getPromptsData();
  const item = prompts.find((p) => p.id === id);
  if (!item) {
    return {
      title: "Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const loc = (locale === "en" ? "en" : "zh") as Locale;
  const isEn = loc === "en";
  const title = item.title;
  const description = item.prompt.replace(/\s+/g, " ").trim().slice(0, 160);
  const baseUrl = getSiteBaseUrl();
  const canonical = `${baseUrl}/${loc}/p/${item.id}`;
  const image = item.imageUrl ? [item.imageUrl] : undefined;

  return {
    title,
    description,
    keywords: [
      ...item.tags,
      item.source,
      getPromptModel(item),
      "AI prompt",
      "prompt library",
    ],
    alternates: {
      canonical,
      languages: {
        "zh-CN": `${baseUrl}/zh/p/${item.id}`,
        en: `${baseUrl}/en/p/${item.id}`,
        "x-default": `${baseUrl}/en/p/${item.id}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: isEn ? "Multi-model Image Prompts" : "多模型图像提示词库",
      locale: isEn ? "en_US" : "zh_CN",
      images: image,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PromptPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const loc = (locale === "en" ? "en" : "zh") as Locale;
  const { prompts } = getPromptsData();
  const item = prompts.find((p) => p.id === id);
  const baseUrl = getSiteBaseUrl();

  if (!item) notFound();

  const labels = sourceLabels[loc];
  const detailUrl = `${baseUrl}/${loc}/p/${item.id}`;
  const listUrl = `${baseUrl}/${loc}`;

  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.title,
    description: item.prompt.replace(/\s+/g, " ").trim().slice(0, 200),
    inLanguage: loc === "en" ? "en" : "zh-CN",
    keywords: item.tags,
    url: detailUrl,
    image: item.imageUrl || undefined,
    author: item.author
      ? {
          "@type": "Person",
          name: item.author,
        }
      : undefined,
    isPartOf: {
      "@type": "CollectionPage",
      name: t(loc, "title"),
      url: listUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t(loc, "title"),
        item: listUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: item.title,
        item: detailUrl,
      },
    ],
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLdForScript(creativeWorkJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLdForScript(breadcrumbJsonLd) }}
      />
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/72">
        <div className="mx-auto flex h-full w-full max-w-page items-center px-5 sm:px-8">
          <div className="flex w-full min-w-0 items-center justify-between gap-4">
            <Link
              href={`/${locale}`}
              className="min-w-0 truncate text-[15px] font-medium text-apple-blue hover:text-apple-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue/35 focus-visible:ring-offset-2 rounded-md"
            >
              ← {t(loc, "title")}
            </Link>
            <LangSwitcher locale={loc} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-page px-5 py-8 sm:px-8">
        <article className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-2xl font-semibold tracking-tight text-apple-label md:text-[28px] md:leading-snug">
            {item.title}
          </h1>
          {(item.author || item.source) && (
            <p className="mb-4 text-sm text-apple-secondary">
              {item.author ? (
                <>
                  {t(loc, "by")} @{item.author}
                  {item.source ? " · " : ""}
                </>
              ) : null}
              {item.source ? <>{labels[item.source] || item.source}</> : null}
              <span className="text-apple-tertiary">
                {" "}
                ·{" "}
                {getPromptModel(item) === "gpt-image-2"
                  ? t(loc, "modelGptImage2")
                  : t(loc, "modelNanoBanana")}
              </span>
            </p>
          )}
          {item.tags?.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-black/[0.04] px-2 py-0.5 text-xs font-medium text-apple-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              {item.input && (
                <p className="border-l-2 border-apple-separator pl-3 text-sm text-apple-secondary">
                  <span className="text-apple-tertiary">{t(loc, "input")}</span>
                  {item.input}
                </p>
              )}
              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-black/[0.06] bg-neutral-50 p-4 font-mono text-[13px] leading-relaxed text-apple-label">
                {item.prompt}
              </pre>
              {item.note && (
                <p className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-900">
                  {item.note}
                </p>
              )}
            </div>
            <div className="relative aspect-square w-full">
              {item.imageUrl && remoteImageIsOptimizable(item.imageUrl) ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  quality={80}
                  priority
                  referrerPolicy="no-referrer"
                  className="rounded-2xl object-contain"
                />
              ) : item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="h-full w-full rounded-2xl object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-apple-separator bg-apple-surface text-apple-tertiary">
                  {t(loc, "noImage")}
                </div>
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
