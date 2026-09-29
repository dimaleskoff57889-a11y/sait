import type { MetadataRoute } from "next";
import { site, has } from "@/content/site";

export const dynamic = "force-static";

/** Карта сайта нужна только с настоящим адресом — без site.url она пустая. */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!has(site.url)) return [];
  return [
    { url: `${site.url}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/privacy/`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
