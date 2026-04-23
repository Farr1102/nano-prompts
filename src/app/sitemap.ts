import { MetadataRoute } from "next";
import { getPromptsData } from "@/lib/get-prompts-data";
import { getSiteBaseUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteBaseUrl();
  const { prompts, updatedAt } = getPromptsData();
  const lastModified = updatedAt ? new Date(updatedAt) : new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/zh`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/en`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/zh/m/nano-banana`, lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/zh/m/gpt-image-2`, lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/en/m/nano-banana`, lastModified, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/en/m/gpt-image-2`, lastModified, changeFrequency: "weekly", priority: 0.95 },
  ];

  for (const locale of ["zh", "en"]) {
    for (const p of prompts) {
      entries.push({
        url: `${baseUrl}/${locale}/p/${p.id}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
