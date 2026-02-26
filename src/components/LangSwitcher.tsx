"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export default function LangSwitcher({ locale }: { locale: Locale }) {
  const target = locale === "en" ? "/zh" : "/en";
  const label = locale === "en" ? "中文" : "English";

  return (
    <Link
      href={target}
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors"
    >
      {label}
    </Link>
  );
}
