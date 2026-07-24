import { describe, expect, it } from "vitest";
import { queryPrompts, clampPageSize, filterWithImages } from "./prompt-query";
import type { PromptItem } from "./prompts";

const samples: PromptItem[] = [
  {
    id: "a",
    title: "Apple",
    author: "u1",
    source: "t",
    model: "nano-banana",
    tags: ["fruit", "nano-banana"],
    prompt: "red fruit",
    imageUrl: "https://example.com/a.jpg",
  },
  {
    id: "b",
    title: "Banana GPT",
    author: "u2",
    source: "t",
    model: "gpt-image-2",
    tags: ["fruit", "gpt-image-2"],
    prompt: "yellow",
    imageUrl: "https://example.com/b.jpg",
  },
  {
    id: "c",
    title: "Cherry",
    author: "u3",
    source: "t",
    model: "nano-banana",
    tags: ["fruit", "hidden"],
    prompt: "red no image",
  },
  {
    id: "d",
    title: "Date",
    author: "u4",
    source: "t",
    model: "nano-banana",
    tags: ["fruit", "hidden"],
    prompt: "blank image",
    imageUrl: "  ",
  },
];

describe("queryPrompts", () => {
  it("filters by model", () => {
    const r = queryPrompts(samples, { model: "gpt-image-2", q: "", tags: [] });
    expect(r.map((x) => x.id)).toEqual(["b"]);
  });

  it("filters by keyword in title", () => {
    const r = queryPrompts(samples, { model: "all", q: "apple", tags: [] });
    expect(r.map((x) => x.id)).toEqual(["a"]);
  });

  it("filters by selected tags", () => {
    const r = queryPrompts(samples, { model: "all", q: "", tags: ["fruit"] });
    expect(r.length).toBe(2);
    const r2 = queryPrompts(samples, { model: "all", q: "", tags: ["nano-banana"] });
    expect(r2.map((x) => x.id)).toEqual(["a"]);
  });

  it("filters out prompts without images", () => {
    expect(filterWithImages(samples).map((x) => x.id)).toEqual(["a", "b"]);

    const r = queryPrompts(samples, { model: "all", q: "red", tags: [] });
    expect(r.map((x) => x.id)).toEqual(["a"]);
  });
});

describe("clampPageSize", () => {
  it("clamps to 1..48", () => {
    expect(clampPageSize(0)).toBe(24);
    expect(clampPageSize(100)).toBe(48);
    expect(clampPageSize(12)).toBe(12);
  });
});
