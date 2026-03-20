/**
 * JSON-LD for <script type="application/ld+json">: avoid breaking out of the
 * script element (e.g. "</script>" in a string) and normalize problematic
 * Unicode line separators in script-embedded JSON.
 */
export function serializeJsonLdForScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
