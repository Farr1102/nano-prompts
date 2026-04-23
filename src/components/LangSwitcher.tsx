"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export default function LangSwitcher({ locale }: { locale: Locale }) {
  const target = locale === "en" ? "/zh" : "/en";
  const label = locale === "en" ? "中文" : "English";

  return (
    <Link
      href={target}
      className="rounded-full px-4 py-1.5 text-sm font-medium text-apple-label bg-black/[0.04] hover:bg-black/[0.07] active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue/40 focus-visible:ring-offset-2"
    >
      {label}
    </Link>
  );
}
