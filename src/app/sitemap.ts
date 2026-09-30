import type { MetadataRoute } from "next";
import { site, has } from "@/content/site";
import { absolute, servicePages, servicePath } from "@/content/seo";

export const dynamic = "force-static";

/**
 * Карта сайта: главная, страницы услуг, политика. Нужна только с настоящим
 * адресом — без site.url она пустая.
 *
 * Дата изменения — дата сборки: сайт пересобирается только когда в нём
 * что-то поменяли (см. «Хостинг» в SITE.md).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!has(site.url)) return [];
  const lastModified = new Date();
  return [
    { url: absolute("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    ...servicePages.map((s) => ({
      url: absolute(servicePath(s)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: absolute("/privacy/"), lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
