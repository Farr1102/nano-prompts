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
    <div className="min-h-screen flex items-center justify-center text-stone-500 text-sm">
      Loading…
    </div>
  );
}
