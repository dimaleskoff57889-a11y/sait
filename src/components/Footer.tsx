import Link from "next/link";
import { site, has } from "@/content/site";

export function Footer() {
  const { fullName, shortName, inn, ogrnip } = site.legal;
  const legalLine = [
    has(fullName) ? fullName : shortName,
    has(inn) ? `ИНН ${inn}` : "",
    has(ogrnip) ? `ОГРНИП ${ogrnip}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <footer className="bg-steel-950 text-steel-400">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {has(legalLine) ? <p className="text-sm">{legalLine}</p> : null}
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
