import { site, has } from "@/content/site";
import { iconMap } from "./icons";
import { Section } from "./Section";

export function Services() {
  if (!has(site.services)) return null;

  return (
    <Section id="services" title="Что делаю" lead={has(site.notDoing) ? undefined : undefined}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {site.services.map((s) => {
          const Icon = iconMap[s.icon];
          return (
            <article
              key={s.title}
              className={`rounded-2xl border p-5 ${
                s.primary
                  ? "border-steel-300 bg-steel-50"
                  : "border-steel-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal-500/15">
                  <Icon className="h-5 w-5 text-signal-600" aria-hidden />
                </div>
                <h3 className="min-w-0 flex-1 text-base font-semibold text-steel-900">
                  {s.title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-steel-500">{s.text}</p>
            </article>
          );
        })}
      </div>

      {has(site.equipment) ? (
        <div className="mt-10">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-steel-400">
            Оборудование
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {site.equipment.map((e) => (
              <li
                key={e}
                className="rounded-lg border border-steel-200 bg-steel-50 px-3 py-1.5 text-sm text-steel-700"
              >
                {e}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {has(site.brands) ? (
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-steel-400">
            Марки, с которыми работаю
          </h3>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {site.brands.map((b) => (
              <li key={b} className="text-base font-semibold text-steel-700">
                {b}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {has(site.notDoing) ? (
        <p className="mt-8 rounded-xl border border-steel-200 bg-steel-50 p-4 text-sm text-steel-500">
          <span className="font-semibold text-steel-700">Не берусь за:</span>{" "}
          {site.notDoing.join(", ")}.
        </p>
      ) : null}
    </Section>
  );
}
