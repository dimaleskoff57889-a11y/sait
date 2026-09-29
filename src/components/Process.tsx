import { Clock, CalendarCheck } from "lucide-react";
import { site, has } from "@/content/site";
import { Section } from "./Section";
import { revealDelay } from "./reveal";

/**
 * «Как работаю»: путь заказчика от звонка до гарантии. Заменил отдельные
 * карточки «Гарантия / Оплата / Стоимость» — те же факты, но в порядке,
 * в котором заказчик с ними сталкивается, и без повторов.
 *
 * Горизонтально: на широком экране пять шагов в ряд, между номерами отрезки,
 * которые протягиваются при появлении (.step-line). Вертикальный вариант
 * пробовали 29.09 — владелец вернул горизонтальный.
 */
export function Process() {
  const { responseTime, weekends } = site.terms;
  const rows = [
    { icon: Clock, label: "Выезд", value: responseTime },
    { icon: CalendarCheck, label: "График", value: weekends },
  ].filter((r) => has(r.value));

  if (!has(site.process) && rows.length === 0 && !has(site.prices)) return null;

  return (
    <Section id="process" title="Как работаю">
      {has(site.process) ? (
        <ol className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-6">
          {site.process.map((step, i) => (
            <li
              key={step.title}
              data-reveal
              style={revealDelay(i * 140)}
              className="relative flex gap-4 lg:block"
            >
              {/* Отрезок до следующего шага — только на широком экране */}
              {i < site.process.length - 1 ? (
                <div
                  aria-hidden
                  className="step-line absolute top-5 -right-6 left-12 hidden h-px bg-signal-500/40 lg:block"
                />
              ) : null}
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-steel-900 text-sm font-bold text-signal-400 ring-4 ring-white">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="lg:mt-5">
                <h3 className="text-base font-semibold text-steel-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-steel-500">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      {rows.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div key={r.label} className="rounded-2xl border border-steel-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal-500/15">
                  <r.icon className="h-5 w-5 text-signal-600" aria-hidden />
                </div>
                <h3 className="min-w-0 flex-1 text-sm font-semibold text-steel-900">
                  {r.label}
                </h3>
              </div>
              <p className="mt-2 text-sm text-steel-500">{r.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {has(site.prices) ? (
        <div className="mt-10 overflow-hidden rounded-2xl border border-steel-200">
          <table className="w-full text-left text-sm">
            <tbody>
              {site.prices.map((p, i) => (
                <tr key={p.title} className={i % 2 ? "bg-steel-50" : "bg-white"}>
                  <td className="px-5 py-3.5 text-steel-700">{p.title}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-steel-900">
                    {p.from}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="bg-white px-5 py-3 text-xs text-steel-400">
            Точная стоимость — после осмотра объекта.
          </p>
        </div>
      ) : null}
    </Section>
  );
}
