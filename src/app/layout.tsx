import type { Metadata } from "next";
import "@fontsource/golos-text/400.css";
import "@fontsource/golos-text/500.css";
import "@fontsource/golos-text/600.css";
import "@fontsource/golos-text/700.css";
import "./globals.css";
import { site, has } from "@/content/site";

const title = [site.hero.title, site.legal.shortName].filter(has).join(" — ");

// ЗАГЛУШКА: заголовок и описание переписываем, когда будет готов текст.
export const metadata: Metadata = {
  title,
  description: site.hero.subtitle,
  // Пока сайт черновик — закрыт от поисковиков.
  robots: site.draft ? { index: false, follow: false } : undefined,
  openGraph: {
    title,
    description: site.hero.subtitle,
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
