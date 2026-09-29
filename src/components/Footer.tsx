import Link from "next/link";
import { site, has } from "@/content/site";
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
        <p className="mt-2 text-xs text-steel-500">
          © {new Date().getFullYear()}. Сайт носит информационный характер и не является
          публичной офертой.
        </p>
      </div>
    </footer>
  );
}
