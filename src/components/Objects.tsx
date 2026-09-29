import { site, has } from "@/content/site";
import { Section } from "./Section";

/**
 * Самый ценный блок сайта: доказательство, что человек действительно работал.
 * Пока список объектов пуст — секция не выводится совсем.
 */
export function Objects() {
  if (!has(site.objects)) return null;

  return (
    <Section
      id="objects"
      dark
      title="Объекты"
      lead="Часть работ, выполненных за последние годы."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {site.objects.map((o) => (
          <article
            key={o.name + o.work}
            className="overflow-hidden rounded-2xl border border-steel-700 bg-steel-800"
          >
            {o.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/photos/${o.photo}`}
                alt={o.name}
                className="h-44 w-full object-cover"
              />
            ) : null}
            <div className="p-5">
              <h3 className="text-base font-semibold text-white">{o.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-300">{o.work}</p>
              {o.year ? <p className="mt-3 text-xs text-steel-400">{o.year}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
