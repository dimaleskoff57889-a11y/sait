import type { MetadataRoute } from "next";
import { site, has } from "@/content/site";

export const dynamic = "force-static";

/** Пока сайт черновик — закрыт от поисковиков целиком, как и мета-тегом noindex. */
export default function robots(): MetadataRoute.Robots {
  if (site.draft) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    ...(has(site.url) ? { sitemap: `${site.url}/sitemap.xml` } : {}),
  };
}
