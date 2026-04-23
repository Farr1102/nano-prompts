"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 静态导出不能使用 middleware，根路径用语言偏好跳转 /zh 或 /en */
export default function RootRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const prefersZh = (navigator.language || "").toLowerCase().startsWith("zh");
    router.replace(prefersZh ? "/zh" : "/en");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-apple-tertiary">
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-apple-separator border-t-apple-blue" aria-hidden />
        Loading…
      </div>
    </div>
  );
}
