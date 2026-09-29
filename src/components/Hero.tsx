import { MapPin } from "lucide-react";
import { site, has } from "@/content/site";
import { ContactButtons } from "./ContactButtons";

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

      <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex items-center gap-2 text-sm text-steel-300">
          <MapPin className="h-4 w-4 text-signal-500" aria-hidden />
          <span>{site.geo.main}</span>
        </div>

        <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
          {site.hero.title}
        </h1>

        <p className="mt-5 max-w-2xl text-base text-steel-300 sm:text-lg">
          {site.hero.subtitle}
        </p>

        <div className="mt-9">
          <ContactButtons size="lg" />
        </div>

        <p className="mt-4 text-sm text-steel-400">{site.contacts.hours}</p>
      </div>

      <div className="hazard-stripe h-1.5 w-full" />
    </section>
  );
}
