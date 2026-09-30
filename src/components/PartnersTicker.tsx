import { Building2 } from "lucide-react";
import { site, has, type Partner } from "@/content/site";

/** Сколько раз повторить список в одной половине ленты — чтобы лента шла без пустот даже на широком экране */
const REPEATS = 4;

/**
 * Бегущая строка компаний, с которыми работает папа: логотип + название.
 * Едет справа налево бесконечно, на наведение останавливается (.ticker /
 * .ticker-track в globals.css). «И многие другие» стоит справа неподвижно —
 * по просьбе владельца (29.09), на телефоне — строкой под лентой.
 *
 * Лента состоит из двух одинаковых половин и сдвигается ровно на половину —
 * поэтому цикл без шва. Для экранных дикторов — обычный текст списком.
 *
 * С 30.09 — тёмная полоса, как первый экран, логотипы крупнее, лента медленнее
 * (вариант «оставить бегущую строку, но выделить» — выбор владельца).
 */
export function PartnersTicker() {
  if (!has(site.partners)) return null;

  const half = Array.from({ length: REPEATS }, () => site.partners).flat();

  return (
    <section
      aria-label="Компании, с которыми работаю"
      className="bg-steel-900 py-9 sm:py-10"
    >
      <p className="mx-auto flex w-full max-w-6xl items-center gap-2.5 px-4 text-sm font-semibold tracking-widest text-steel-300 uppercase sm:px-6">
        <span aria-hidden className="h-2 w-2 rotate-45 bg-signal-500" />
        Работаю вместе с компаниями
      </p>

      <div className="mt-5 flex items-center">
        {/* py-2 — запас под рамки плашек: overflow-hidden иначе срезает их сверху и снизу */}
        <div className="ticker min-w-0 flex-1 overflow-hidden py-2">
          <div aria-hidden className="ticker-track flex w-max">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center">
                {half.map((partner, i) => (
                  <li
                    key={`${copy}-${i}`}
                    className="flex items-center gap-4 pr-16"
                  >
                    <Logo partner={partner} />
                    <span className="text-xl font-bold whitespace-nowrap text-white">
                      {partner.name}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div
          aria-hidden
          className="hidden shrink-0 items-center gap-3 pr-6 pl-2 sm:flex lg:pr-12"
        >
          <span className="text-lg whitespace-nowrap text-steel-300">
            и многие другие
          </span>
        </div>
      </div>

      <p
        aria-hidden
        className="mt-2 px-4 text-right text-sm text-steel-300 sm:hidden"
      >
        и многие другие
      </p>

      <p className="sr-only">
        {site.partners.map((p) => p.name).join(", ")} и многие другие.
      </p>
    </section>
  );
}

/** Логотип компании или плашка-заглушка, пока логотипа нет */
function Logo({ partner }: { partner: Partner }) {
  if (partner.logo) {
    // Плашка тянется по ширине логотипа: у многих логотипов вытянутая форма
    return (
      <span
        className={`flex h-14 min-w-14 items-center justify-center overflow-hidden rounded-xl px-2 ring-1 ${
          partner.logoOnDark
            ? "bg-steel-800 ring-steel-700"
            : "bg-white ring-white/10"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/logos/${partner.logo}`}
          decoding="async"
          alt=""
          className={
            partner.logoEmblemOnly
              ? "h-10 w-10 object-cover object-left" // только эмблема слева, надпись обрезана
              : "h-10 w-auto max-w-36 object-contain"
          }
        />
      </span>
    );
  }
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-steel-800 text-steel-400 ring-1 ring-steel-700">
      <Building2 className="h-5 w-5" />
    </span>
  );
}
