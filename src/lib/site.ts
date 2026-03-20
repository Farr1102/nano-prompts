const DEFAULT_SITE_URL = "https://nano-banana-prompts.vercel.app";

/** Canonical site origin for metadata, JSON-LD, and sitemap. */
export function getSiteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}
