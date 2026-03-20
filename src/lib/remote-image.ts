/** Hostnames allowed in next.config.ts `images.remotePatterns` (keep in sync). */
const NEXT_IMAGE_HOSTS = new Set([
  "raw.githubusercontent.com",
  "pbs.twimg.com",
  "cms-assets.youmind.com",
  "github.com",
  "bibigpt-apps.chatvid.ai",
  "replicate.delivery",
]);

export function remoteImageIsOptimizable(url: string): boolean {
  try {
    const { hostname, protocol } = new URL(url);
    return protocol === "https:" && NEXT_IMAGE_HOSTS.has(hostname);
  } catch {
    return false;
  }
}
