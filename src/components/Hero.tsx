import type { CSSProperties } from "react";
import { MapPin } from "lucide-react";
import { site, has } from "@/content/site";
import { ContactButtons } from "./ContactButtons";
import { LiftIllustration } from "./LiftIllustration";

/** Задержка появления элемента первого экрана, мс */
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-steel-900 text-white">
      {/* Фото объекта фоном. Пока фото нет — остаётся чистый серо-синий. */}
      {has(site.hero.photo) ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/photos/${site.hero.photo}`}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-steel-950 via-steel-900/85 to-steel-900/40" />
        </>
      ) : null}

      <div aria-hidden className="blueprint-grid absolute inset-0" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <div className="hero-in flex items-center gap-2 text-sm text-steel-300">
            <MapPin className="h-4 w-4 text-signal-500" aria-hidden />
            <span>
              {site.geo.main}
              {has(site.geo.trips) ? ` · ${site.geo.trips}` : ""}
            </span>
          </div>

          <h1
            style={delay(120)}
            className="hero-in mt-4 max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl"
          >
            {site.hero.title}
          </h1>

          <p style={delay(240)} className="hero-in mt-5 max-w-2xl text-base text-steel-300 sm:text-lg">
            {site.hero.subtitle}
          </p>

          <div style={delay(360)} className="hero-in mt-9">
            <ContactButtons size="lg" />
          </div>

          {has(site.contacts.hours) ? (
            <p style={delay(480)} className="hero-in mt-2 text-sm text-steel-400">
              Звонки {site.contacts.hours}
            </p>
          ) : null}
        </div>

        {/* Схема подъёмника — только на широком экране: на телефоне первый
            экран и так занят заголовком и кнопкой звонка. */}
        <LiftIllustration className="hidden w-full lg:block" />
      </div>

      <div className="hazard-march h-1.5 w-full" />
    </section>
  );
}
