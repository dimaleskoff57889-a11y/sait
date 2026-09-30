import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, TriangleAlert } from "lucide-react";
import { site, has } from "@/content/site";
import {
  servicePages,
  servicePath,
  type ServiceWithPage,
} from "@/content/seo";
import { ContactButtons } from "./ContactButtons";
import { Section } from "./Section";
import { revealDelay } from "./reveal";

/**
 * Блоки страницы услуги (SEO, 30.09) — в стиле главной: тёмный первый экран
 * с сигнальной лентой, серо-синие разделы, ромбики-маркеры, как в «Объектах».
 * Сама страница собирается в src/app/[service]/page.tsx.
 */

/** Задержка появления элемента первого экрана, мс */
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Маркер списка — оранжевый ромбик, как в списках работ по объектам */
function Diamond() {
  return (
    <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-signal-500" />
  );
}

export function ServiceHero({ service }: { service: ServiceWithPage }) {
  const { page } = service;
  return (
    <section id="top" className="relative overflow-hidden bg-steel-900 text-white">
      <div aria-hidden className="blueprint-grid absolute inset-0" />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <nav aria-label="Навигационная цепочка" className="hero-in text-sm">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-steel-400">
            <li>
              <Link href="/" className="transition hover:text-white">
                Главная
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-steel-300">
              {service.title}
            </li>
          </ol>
        </nav>

        <div
          style={delay(60)}
          className="hero-in mt-8 flex items-center gap-2 text-sm text-steel-300"
        >
          <MapPin className="h-4 w-4 text-signal-500" aria-hidden />
          <span>
            {site.geo.main}
            {has(site.geo.trips) ? ` · ${site.geo.trips}` : ""}
          </span>
        </div>

        <h1
          style={delay(120)}
          className="hero-in mt-4 max-w-4xl font-display text-3xl font-extrabold leading-[1.15] sm:text-5xl"
        >
          {page.h1}
        </h1>

        {page.intro.map((p, i) => (
          <p
            key={p}
            style={delay(220 + i * 80)}
            className={`hero-in max-w-2xl text-base leading-relaxed text-steel-300 sm:text-lg ${i === 0 ? "mt-6" : "mt-4"}`}
          >
            {p}
          </p>
        ))}

        <div style={delay(400)} className="hero-in mt-9">
          <ContactButtons size="lg" />
        </div>
        {has(site.contacts.hours) ? (
          <p style={delay(480)} className="hero-in mt-2 text-sm text-steel-400">
            Звонки {site.contacts.hours}
          </p>
        ) : null}
      </div>

      <div className="hazard-march h-1.5 w-full" />
    </section>
  );
}

/** «Когда пора звонить» — признаки, что подъёмнику нужна эта работа */
export function ServiceSigns({ service }: { service: ServiceWithPage }) {
  const signs = service.page.signs;
  if (!signs || !has(signs.items)) return null;

  return (
    <Section id="signs" title={signs.title}>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {signs.items.map((item, i) => (
          <li
            key={item}
            data-reveal
            style={revealDelay(i * 80)}
            className="flex items-start gap-3 rounded-2xl border border-steel-200 bg-white p-4 sm:p-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-signal-500/15">
              <TriangleAlert className="h-4.5 w-4.5 text-signal-600" aria-hidden />
            </span>
            <span className="pt-1.5 text-base leading-snug text-steel-800">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** «Что входит»: одна группа — её название и есть заголовок раздела */
export function ServiceIncludes({ service }: { service: ServiceWithPage }) {
  const groups = service.page.includes.filter((g) => has(g.items));
  if (groups.length === 0) return null;
  const single = groups.length === 1;

  return (
    <Section
      id="includes"
      title={single ? groups[0].title : "Что входит в работу"}
      lead="Механическую и электрическую часть делает одна бригада — у каждого специалиста есть необходимые допуски."
      muted
    >
      <div className={`grid grid-cols-1 gap-4 ${single ? "" : "md:grid-cols-2"}`}>
        {groups.map((group, g) => (
          <div
            key={group.title}
            data-reveal
            style={revealDelay(g * 120)}
            className="rounded-2xl border border-steel-200 bg-white p-6 sm:p-7"
          >
            {single ? null : (
              <h3 className="font-display text-lg font-extrabold text-steel-900 sm:text-xl">
                {group.title}
              </h3>
            )}
            <ul
              className={`grid gap-y-3 ${single ? "sm:grid-cols-2 sm:gap-x-10" : "mt-5"}`}
            >
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-base leading-snug text-steel-700"
                >
                  <Diamond />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/**
 * Объекты, где была эта работа, — из site.objects по слову в поле work
 * (objectsWork). Тексты те же, что в «Объектах» на главной.
 */
export function ServiceObjects({ service }: { service: ServiceWithPage }) {
  const word = service.page.objectsWork.toLowerCase();
  const objects = site.objects.filter((o) => o.work.toLowerCase().includes(word));
  if (objects.length === 0) return null;

  return (
    <Section
      id="objects"
      dark
      title="Объекты"
      lead="Несколько объектов, где делал эти работы, — из более чем 500 с 2009 года."
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {objects.map((o, i) => (
          <li
            key={o.name}
            data-reveal
            style={revealDelay((i % 3) * 100)}
            className="flex flex-col overflow-hidden rounded-2xl bg-steel-800 ring-1 ring-steel-700"
          >
            {o.logos && o.logos.length > 0 ? (
              <div className="flex h-28 items-center justify-center gap-6 bg-white px-6">
                {o.logos.map((file, k) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={file}
                    src={`/logos/objects/${file}`}
                    alt={k === 0 ? o.name : ""}
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-auto max-w-[45%] object-contain"
                  />
                ))}
              </div>
            ) : null}
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-widest text-signal-400 uppercase">
                {o.work}
              </p>
              <h3 className="mt-2 font-display text-lg font-extrabold text-white">
                {o.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-steel-300">{o.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link
          href="/#objects"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-signal-500 decoration-2 underline-offset-4 hover:text-steel-200"
        >
          Все объекты
          <ArrowRight
            aria-hidden
            className="h-4 w-4 text-signal-400 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </p>
    </Section>
  );
}

/** Ссылки на остальные услуги — перелинковка страниц для людей и поисковиков */
export function OtherServices({ service }: { service: ServiceWithPage }) {
  const others = servicePages.filter((s) => s.page.slug !== service.page.slug);
  if (others.length === 0) return null;

  return (
    <Section id="other-services" title="Другие работы">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {others.map((s, i) => (
          <li key={s.page.slug} data-reveal style={revealDelay(i * 100)}>
            <Link
              href={servicePath(s)}
              className="group flex h-full flex-col rounded-2xl border border-steel-200 bg-white p-6 transition-colors hover:border-signal-400"
            >
              <h3 className="font-display text-lg font-extrabold text-steel-900">
                {s.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-600">
                {s.text}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-steel-900">
                {s.page.linkText}
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 text-signal-600 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
