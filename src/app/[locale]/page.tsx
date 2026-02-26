import { Suspense } from "react";
import { getPromptsData, getAllTags } from "@/lib/prompts";
import { sourceLabels, t, type Locale } from "@/lib/i18n";
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

  if (!prompts?.length) {
    return (
      <main className="min-h-screen">
        <header className="border-b border-stone-800 bg-stone-900/50 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-bold tracking-tight">🍌 {t(loc, "title")}</h1>
              <LangSwitcher locale={loc} />
            </div>
          </div>
        </header>
        <div className="max-w-5xl mx-auto px-4 py-16 text-center text-stone-500">
          {t(loc, "errorLoading")}
        </div>
      </main>
    );
  }

  const allTags = getAllTags(prompts);
  const labels = sourceLabels[loc];

  return (
    <main className="min-h-screen">
      <header className="border-b border-stone-800 bg-stone-900/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                🍌 {t(loc, "title")}
              </h1>
              <p className="text-stone-400 mt-1 text-sm">
                {t(loc, "subtitle", { total: String(total) })}
              </p>
            </div>
            <LangSwitcher locale={loc} />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="py-8 text-stone-500 text-center">{t(loc, "searchPlaceholder")}</div>}>
          <PromptList
            prompts={prompts}
            allTags={allTags}
            sourceLabels={labels}
            locale={loc}
          />
        </Suspense>
      </div>
    </main>
  );
}
