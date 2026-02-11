"use client";

import { useState } from "react";

export default function SearchBar({
  onSearch,
}: {
  onSearch: (keyword: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="搜索提示词..."
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch(e.target.value);
        }}
        className="w-full px-4 py-2.5 pl-10 rounded-lg bg-stone-900 border border-stone-700 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50"
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">🔍</span>
    </div>
  );
}
