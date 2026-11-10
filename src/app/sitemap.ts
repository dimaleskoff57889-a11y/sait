import type { MetadataRoute } from "next";
import { site, has } from "@/content/site";
import { absolute, servicePages, servicePath } from "@/content/seo";

export const dynamic = "force-static";

/**
 * Карта сайта: главная, страницы услуг, политика. Нужна только с настоящим
 * адресом — без site.url она пустая.
 * lastmod указываем только при наличии даты изменения конкретной страницы.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!has(site.url)) return [];
  return [
    { url: absolute("/"), changeFrequency: "monthly", priority: 1 },
    ...servicePages.map((s) => ({
      url: absolute(servicePath(s)),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absolute("/privacy/"), changeFrequency: "yearly", priority: 0.3 },
  ];
}
