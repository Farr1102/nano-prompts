import { describe, expect, it } from "vitest";
import { remoteImageIsOptimizable } from "./remote-image";

describe("remoteImageIsOptimizable", () => {
  it("returns true for configured HTTPS hosts", () => {
    expect(remoteImageIsOptimizable("https://pbs.twimg.com/media/x.jpg")).toBe(true);
    expect(
      remoteImageIsOptimizable("https://cms-assets.youmind.com/media/a.png")
    ).toBe(true);
  });

  it("returns false for unknown or invalid URLs", () => {
    expect(remoteImageIsOptimizable("https://evil.example/a.jpg")).toBe(false);
    expect(remoteImageIsOptimizable("not-a-url")).toBe(false);
  });

  it("returns false for non-HTTPS", () => {
    expect(remoteImageIsOptimizable("http://pbs.twimg.com/x.jpg")).toBe(false);
  });
});
