import { Building2, Plus } from "lucide-react";
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
 */
export function PartnersTicker() {
  if (!has(site.partners)) return null;

  const half = Array.from({ length: REPEATS }, () => site.partners).flat();

  return (
    <section aria-label="Компании, с которыми работаю" className="border-b border-steel-200 bg-white py-7">
      <p className="mx-auto w-full max-w-6xl px-4 text-xs font-semibold tracking-widest text-steel-400 uppercase sm:px-6">
        Работаю вместе с компаниями
      </p>

      <div className="mt-3 flex items-center">
        {/* py-2 — запас под рамки плашек: overflow-hidden иначе срезает их сверху и снизу */}
        <div className="ticker min-w-0 flex-1 overflow-hidden py-2">
          <div aria-hidden className="ticker-track flex w-max">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center">
                {half.map((partner, i) => (
                  <li key={`${copy}-${i}`} className="flex items-center gap-3 pr-12">
                    <Logo partner={partner} />
                    <span className="text-lg font-bold whitespace-nowrap text-steel-800">
                      {partner.name}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div aria-hidden className="hidden shrink-0 items-center gap-3 pr-6 pl-2 sm:flex lg:pr-12">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-dashed border-steel-300 text-steel-400">
            <Plus className="h-5 w-5" />
          </span>
          <span className="text-lg whitespace-nowrap text-steel-400">и многие другие</span>
        </div>
      </div>

      <p aria-hidden className="mt-1 px-4 text-right text-sm text-steel-400 sm:hidden">
        и многие другие
      </p>

      <p className="sr-only">{site.partners.map((p) => p.name).join(", ")} и многие другие.</p>
    </section>
  );
}

/** Логотип компании или плашка-заглушка, пока логотипа нет */
function Logo({ partner }: { partner: Partner }) {
  if (partner.logo) {
    // Плашка тянется по ширине логотипа: у многих логотипов вытянутая форма
    return (
      <span
        className={`flex h-11 min-w-11 items-center justify-center overflow-hidden rounded-xl px-1.5 ring-1 ${
          partner.logoOnDark ? "bg-steel-900 ring-steel-800" : "bg-white ring-steel-200"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/logos/${partner.logo}`}
          alt=""
          className={
            partner.logoEmblemOnly
              ? "h-8 w-8 object-cover object-left" // только эмблема слева, надпись обрезана
              : "h-8 w-auto max-w-28 object-contain"
          }
        />
      </span>
    );
  }
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-steel-100 text-steel-500 ring-1 ring-steel-200">
      <Building2 className="h-5 w-5" />
    </span>
  );
}
