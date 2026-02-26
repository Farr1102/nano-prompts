import { MetadataRoute } from "next";
import { getPromptsData } from "@/lib/prompts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nano-banana-prompts.vercel.app";
  const { prompts } = getPromptsData();

  const entries: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/zh`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
  ];

  for (const locale of ["zh", "en"]) {
    for (const p of prompts) {
      entries.push({
        url: `${baseUrl}/${locale}/p/${p.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
