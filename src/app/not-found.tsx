import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold text-apple-label">404</h1>
      <p className="text-sm text-apple-secondary">页面不存在</p>
      <Link
        href="/en"
        className="text-sm font-medium text-apple-blue hover:text-apple-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue/35 focus-visible:ring-offset-2 rounded-md"
      >
        返回首页 / Home
      </Link>
    </main>
  );
}
