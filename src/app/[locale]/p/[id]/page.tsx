import { notFound } from "next/navigation";
import Link from "next/link";
import { getPromptsData } from "@/lib/prompts";
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
}) {
  const { locale, id } = await params;
  const { prompts } = getPromptsData();
  const item = prompts.find((p) => p.id === id);
  if (!item) return { title: "Not Found" };

  const loc = (locale === "en" ? "en" : "zh") as Locale;
  const title = `${item.title} - ${t(loc, "title")}`;

  return {
    title,
    description: item.prompt.slice(0, 160),
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

  if (!item) notFound();

  const labels = sourceLabels[loc];

  return (
    <main className="min-h-screen">
      <header className="border-b border-stone-800 bg-stone-900/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={`/${locale}`}
              className="text-stone-400 hover:text-amber-400 transition-colors">
              ← {t(loc, "title")}
            </Link>
            <LangSwitcher locale={loc} />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-stone-100 mb-4">{item.title}</h1>
          {item.author && (
            <p className="text-stone-500 text-sm mb-4">
              {t(loc, "by")} @{item.author} · {labels[item.source] || item.source}
            </p>
          )}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded text-xs bg-stone-800 text-stone-400"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              {item.input && (
                <p className="text-sm text-stone-400 border-l-2 border-stone-600 pl-3">
                  <span className="text-stone-500">{t(loc, "input")}</span>
                  {item.input}
                </p>
              )}
              <pre className="text-sm text-stone-300 bg-stone-950 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-words font-mono">
                {item.prompt}
              </pre>
              {item.note && (
                <p className="text-xs text-amber-400/90 bg-amber-500/10 rounded-lg px-3 py-2">
                  {item.note}
                </p>
              )}
            </div>
            <div className="relative aspect-square w-full">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-stone-800 flex items-center justify-center text-stone-500">
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
