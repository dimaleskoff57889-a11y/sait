import type { Metadata } from "next";
import "@fontsource/golos-text/400.css";
import "@fontsource/golos-text/500.css";
import "@fontsource/golos-text/600.css";
import "@fontsource/golos-text/700.css";
// Заголовки и крупные цифры — Unbounded (выбор владельца 30.09), основной текст — Golos
import "@fontsource/unbounded/800.css";
import "./globals.css";
import { site, has } from "@/content/site";

const title = [site.hero.title, site.legal.shortName].filter(has).join(" — ");

const siteUrl = has(site.url) ? new URL(site.url) : undefined;

export const metadata: Metadata = {
  // Без адреса сайта не задаём ни metadataBase, ни картинку превью: мессенджерам
  // нужен абсолютный URL, а подставленный localhost сломал бы превью.
  metadataBase: siteUrl,
  // Канонический адрес — без www: если сайт откроют как www.topmontaz.ru,
  // поисковики всё равно будут считать главным topmontaz.ru
  ...(siteUrl ? { alternates: { canonical: "/" } } : {}),
  title,
  description: site.hero.subtitle,
  // Пока сайт черновик — закрыт от поисковиков.
  robots: site.draft ? { index: false, follow: false } : undefined,
  openGraph: {
    title,
    description: site.hero.subtitle,
    type: "website",
    locale: "ru_RU",
    ...(siteUrl
      ? { url: "/", images: [{ url: "/og.png", width: 1200, height: 630, alt: title }] }
      : {}),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
