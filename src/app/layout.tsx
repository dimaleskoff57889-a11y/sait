import type { Metadata, Viewport } from "next";
import "@fontsource/golos-text/400.css";
import "@fontsource/golos-text/500.css";
import "@fontsource/golos-text/600.css";
import "@fontsource/golos-text/700.css";
// Заголовки и крупные цифры — Unbounded (выбор владельца 30.09), основной текст — Golos
import "@fontsource/unbounded/800.css";
import "./globals.css";
import { site, has } from "@/content/site";
import { siteName } from "@/content/seo";

const siteUrl = has(site.url) ? new URL(site.url) : undefined;
const { yandex, google } = site.seo.verification;

/**
 * Общее для всех страниц. Заголовок, описание и канонический адрес каждая
 * страница задаёт сама (pageMetadata в src/content/seo.ts): канонический адрес
 * здесь достался бы всем страницам сразу — так политика 30.09 и считалась
 * поисковиками копией главной.
 */
export const metadata: Metadata = {
  // Без адреса сайта не задаём metadataBase: мессенджерам нужен абсолютный URL,
  // а подставленный localhost сломал бы превью.
  metadataBase: siteUrl,
  title: site.seo.title,
  description: site.seo.description,
  applicationName: siteName,
  // Пока сайт черновик — закрыт от поисковиков.
  robots: site.draft ? { index: false, follow: false } : undefined,
  // Номер телефона на странице — ссылка tel:, автоопределение iOS не нужно
  formatDetection: { telephone: false },
  ...(has(yandex) || has(google)
    ? {
        verification: {
          ...(has(google) ? { google } : {}),
          ...(has(yandex) ? { yandex } : {}),
        },
      }
    : {}),
};

/** Цвет панели браузера на телефоне — как шапка сайта */
export const viewport: Viewport = {
  themeColor: "#1d2734",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
