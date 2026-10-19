import Link from "next/link";
import { site, has } from "@/content/site";
import { servicePages, servicePath } from "@/content/seo";
import { LogoMark } from "./LogoMark";

export function Footer() {
  const { form, fullName, shortName, inn, ogrnip } = site.legal;
  const legalLine = [
    has(fullName) ? [form, fullName].filter(has).join(" ") : shortName,
    has(inn) ? `ИНН ${inn}` : "",
    has(ogrnip) ? `ОГРНИП ${ogrnip}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="bg-steel-950 text-steel-400">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {/* Услуги — ссылки на их страницы с каждой страницы сайта (SEO, 30.09) */}
        {servicePages.length > 0 ? (
          <nav
            aria-label="Услуги"
            className="mb-6 border-b border-steel-800 pb-6"
          >
            <p className="text-xs font-semibold tracking-widest text-steel-500 uppercase">
              Услуги
            </p>
            <ul className="mt-3 grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
              {servicePages.map((s) => (
                <li key={s.page.slug}>
                  <Link
                    href={servicePath(s)}
                    className="group inline-flex items-start gap-2.5 text-steel-300 transition hover:text-white"
                  >
                    {/* Ромбик — как маркеры списков на сайте */}
                    <span
                      aria-hidden
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-signal-500 transition group-hover:scale-125"
                    />
                    {s.page.h1}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark className="h-7 w-7 shrink-0 text-steel-300" />
            {has(legalLine) ? <p className="text-sm">{legalLine}</p> : null}
          </div>
          <a
            href={`tel:${site.contacts.phoneRaw}`}
            className="text-sm font-semibold text-steel-200 hover:text-white"
          >
            {site.contacts.phoneDisplay}
          </a>
        </div>
        <p className="mt-3 text-sm">
          <Link href="/privacy" className="underline underline-offset-4 hover:text-steel-200">
            Политика обработки персональных данных
          </Link>
        </p>
        <p className="mt-2 text-xs text-steel-400">
          © {new Date().getFullYear()}. Сайт носит информационный характер и не является
          публичной офертой.
        </p>
      </div>
    </footer>
  );
}
