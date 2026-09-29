import { Phone } from "lucide-react";
import { site, has } from "@/content/site";
import { LogoMark } from "./LogoMark";

const nav = [
  { href: "#services", label: "Услуги" },
  { href: "#objects", label: "Объекты" },
  { href: "#about", label: "О мастере" },
  { href: "#process", label: "Как работаю" },
  { href: "#contacts", label: "Контакты" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-steel-800 bg-steel-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Знак «Шахта» + подпись (подпись владелец напишет сам — site.legal.shortName) */}
        <a
          href="#top"
          aria-label="Наверх"
          className="group flex items-center gap-2.5 text-sm font-bold tracking-tight text-white sm:text-base"
        >
          <LogoMark className="h-11 w-11 text-steel-200 transition-colors group-hover:text-white" />
          {has(site.legal.shortName) ? site.legal.shortName : null}
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-steel-300 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href={`tel:${site.contacts.phoneRaw}`}
          className="inline-flex items-center gap-2 rounded-lg bg-signal-500 px-3.5 py-2 text-sm font-semibold text-steel-950 transition hover:bg-signal-400"
        >
          <Phone className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{site.contacts.phoneDisplay}</span>
          <span className="sm:hidden">Позвонить</span>
        </a>
      </div>

      {/* Мутный градиент под шапкой: страница уходит под неё мягко, без резкого среза */}
      <div aria-hidden className="header-haze pointer-events-none absolute inset-x-0 top-full h-8" />
    </header>
  );
}
