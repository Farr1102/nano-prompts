import { describe, expect, it } from "vitest";
import { buildHomeJsonLd, isIndexableModelSlug } from "./seo";

describe("seo helpers", () => {
  it("isIndexableModelSlug", () => {
    expect(isIndexableModelSlug("gpt-image-2")).toBe(true);
    expect(isIndexableModelSlug("nano-banana")).toBe(true);
    expect(isIndexableModelSlug("other")).toBe(false);
  });

  it("buildHomeJsonLd includes WebSite SearchAction for current locale", () => {
    const data = buildHomeJsonLd({ baseUrl: "https://example.com", locale: "zh", total: 100 });
    const graph = data["@graph"] as Record<string, unknown>[];
    const website = graph.find((x) => x["@type"] === "WebSite") as {
      potentialAction?: { target?: { urlTemplate?: string } };
    };
    expect(website?.potentialAction?.target?.urlTemplate).toBe(
      "https://example.com/zh?q={search_term_string}"
    );
  });
});
