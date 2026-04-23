import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-stone-200">404</h1>
      <p className="text-stone-500 text-sm">页面不存在</p>
      <Link href="/en" className="text-amber-400 hover:underline text-sm">
        返回首页 / Home
      </Link>
    </main>
  );
}
