"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** 静态导出无 middleware，用首段路径同步 <html lang>（供无障碍与 SEO） */
export default function DocumentLang() {
  const pathname = usePathname();

  useEffect(() => {
    const seg = pathname.split("/").filter(Boolean)[0];
    document.documentElement.lang = seg === "en" ? "en" : "zh-CN";
  }, [pathname]);

  return null;
}
