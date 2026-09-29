import { Clock, CalendarCheck } from "lucide-react";
import { site, has } from "@/content/site";
import { Section } from "./Section";
import { ProcessWave } from "./ProcessWave";

/**
 * «Как работаю»: путь заказчика от звонка до гарантии. Заменил отдельные
 * карточки «Гарантия / Оплата / Стоимость» — те же факты, но в порядке,
 * в котором заказчик с ними сталкивается, и без повторов.
 *
 * Горизонтально: на широком экране пять шагов в ряд, между номерами отрезки,
 * которые протягиваются при появлении (.step-line). Вертикальный вариант
 * пробовали 29.09 — владелец вернул горизонтальный. С 30.09 по отрезкам бежит
 * волна от первого этапа к последнему (ProcessWave).
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
      {has(site.process) ? <ProcessWave steps={site.process} /> : null}

      {rows.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rows.map((r) => (
            <div
              key={r.label}
              className="rounded-2xl border border-steel-200 bg-white p-5"
            >
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
                <tr
                  key={p.title}
                  className={i % 2 ? "bg-steel-50" : "bg-white"}
                >
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
