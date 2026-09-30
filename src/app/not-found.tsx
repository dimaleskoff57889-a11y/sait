import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactButtons } from "@/components/ContactButtons";
import { servicePages, servicePath } from "@/content/seo";

/**
 * Страница «не найдено» (404.html при сборке; Caddy отдаёт её с кодом 404).
 * Раньше была английская заглушка Next.js — теперь по-русски, со ссылками на
 * главную и услуги, чтобы человек не уходил с сайта.
 */
// noindex Next.js ставит странице 404 сам
export const metadata: Metadata = {
  title: { absolute: "Страница не найдена" },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="bg-steel-900 text-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="font-display text-6xl font-extrabold text-signal-500 sm:text-7xl">
            404
          </p>
          <h1 className="mt-4 font-display text-2xl font-extrabold sm:text-4xl">
            Такой страницы нет
          </h1>
          <p className="mt-4 max-w-xl text-base text-steel-300 sm:text-lg">
            Возможно, адрес набран с ошибкой. Начните с главной или выберите нужную
            работу:
          </p>

          <ul className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            <li>
              <Link
                href="/"
                className="group flex items-center justify-between gap-3 rounded-xl bg-steel-800 px-5 py-4 font-semibold ring-1 ring-steel-700 transition hover:ring-signal-500"
              >
                На главную
                <ArrowRight className="h-4 w-4 text-signal-400" aria-hidden />
              </Link>
            </li>
            {servicePages.map((s) => (
              <li key={s.page.slug}>
                <Link
                  href={servicePath(s)}
                  className="group flex items-center justify-between gap-3 rounded-xl bg-steel-800 px-5 py-4 font-semibold ring-1 ring-steel-700 transition hover:ring-signal-500"
                >
                  {s.title}
                  <ArrowRight className="h-4 w-4 text-signal-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <p className="mb-4 text-sm text-steel-400">Или сразу свяжитесь:</p>
            <ContactButtons />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
