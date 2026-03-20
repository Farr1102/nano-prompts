import { afterEach, describe, expect, it } from "vitest";
import { getSiteBaseUrl } from "./site";

describe("getSiteBaseUrl", () => {
  const orig = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    if (orig === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = orig;
  });

  it("uses NEXT_PUBLIC_SITE_URL when set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    expect(getSiteBaseUrl()).toBe("https://example.com");
  });

  it("falls back to production default when unset", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteBaseUrl()).toBe("https://nano-banana-prompts.vercel.app");
  });
});
