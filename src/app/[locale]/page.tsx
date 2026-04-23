import { Suspense } from "react";
import { getPromptsData } from "@/lib/get-prompts-data";
import { getAllTags } from "@/lib/prompts";
import { serializeJsonLdForScript } from "@/lib/json-ld";
import { getSiteBaseUrl } from "@/lib/site";
import { buildHomeJsonLd } from "@/lib/seo";
import { t, type Locale } from "@/lib/i18n";
import PromptList from "@/components/PromptList";
import LangSwitcher from "@/components/LangSwitcher";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === "en" ? "en" : "zh") as Locale;
  const data = getPromptsData();
  const { prompts, total } = data;
  const tagsForModelCorpus = getAllTags(prompts);
  const baseUrl = getSiteBaseUrl();

  if (!prompts?.length) {
    return (
      <main className="min-h-screen">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/72">
          <div className="mx-auto flex h-full w-full max-w-page items-center px-5 sm:px-8">
            <div className="flex w-full min-w-0 items-center justify-between gap-4">
              <h1 className="truncate text-lg font-semibold tracking-tight text-apple-label sm:text-xl">{t(loc, "title")}</h1>
              <LangSwitcher locale={loc} />
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-page px-5 py-16 text-center text-apple-secondary sm:px-8">
          {t(loc, "errorLoading")}
        </div>
      </main>
    );
  }

  const collectionJsonLd = buildHomeJsonLd({ baseUrl, locale: loc, total });

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLdForScript(collectionJsonLd) }}
      />
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/72">
        <div className="mx-auto flex h-full w-full max-w-page items-center px-5 sm:px-8">
          <div className="flex w-full min-w-0 items-center justify-between gap-4">
            <h1
              className="truncate text-lg font-semibold tracking-tight text-apple-label sm:text-xl md:text-2xl"
              title={t(loc, "title")}
            >
              {t(loc, "title")}
            </h1>
            <LangSwitcher locale={loc} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-page px-5 py-8 sm:px-8">
        <Suspense
          fallback={
            <div className="py-12 text-center text-sm text-apple-tertiary">{t(loc, "searchPlaceholder")}</div>
          }
        >
          <PromptList locale={loc} tagsForModelCorpus={tagsForModelCorpus} />
        </Suspense>
      </div>
    </main>
  );
}
