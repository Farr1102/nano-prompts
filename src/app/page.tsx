import { getPromptsData, getAllTags, SOURCE_LABELS } from "@/lib/prompts";
import PromptList from "@/components/PromptList";

export default async function Home() {
  const { prompts, total, updatedAt } = getPromptsData();
  const allTags = getAllTags(prompts);

  return (
    <main className="min-h-screen">
      <header className="border-b border-stone-800 bg-stone-900/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold tracking-tight">
            🍌 Nano Banana 提示词库
          </h1>
          <p className="text-stone-400 mt-1 text-sm">
            共 {total} 个提示词 · 支持标签筛选 · 一键复制
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <PromptList
          prompts={prompts}
          allTags={allTags}
          sourceLabels={SOURCE_LABELS}
        />
      </div>
    </main>
  );
}
