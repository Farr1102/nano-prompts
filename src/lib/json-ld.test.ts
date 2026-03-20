import { describe, expect, it } from "vitest";
import { serializeJsonLdForScript } from "./json-ld";

describe("serializeJsonLdForScript", () => {
  it("escapes < so </script> cannot terminate the script block", () => {
    const payload = { name: "</script><script>evil()</script>" };
    const raw = serializeJsonLdForScript(payload);
    expect(raw.includes("</script>")).toBe(false);
    expect(raw).toContain("\\u003c");
    expect(JSON.parse(raw)).toEqual(payload);
  });

  it("round-trips normal structured data", () => {
    const payload = {
      "@context": "https://schema.org",
      "@type": "Thing",
      name: "Hello",
    };
    expect(JSON.parse(serializeJsonLdForScript(payload))).toEqual(payload);
  });
});
