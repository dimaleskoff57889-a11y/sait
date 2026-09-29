"use client";

import { useRef, useState } from "react";
import type { WorkObject } from "@/content/site";
import { PhotoDeck, type DeckController, type DeckItem } from "./PhotoDeck";

/**
 * «Объекты»: одна стопка фото, одно фото = один объект. Какое фото сверху —
 * такой объект и описан справа: вид работ, название, описание. Текст
 * сменяется с анимацией (.object-swap в globals.css). Полоски под текстом —
 * все объекты по порядку, по клику стопка показывает нужное фото.
 */
export function ObjectsShowcase({
  objects,
  draft,
}: {
  objects: WorkObject[];
  draft: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const deck = useRef<DeckController>(null);

  // Фото важнее логотипа; нет ни того, ни другого — название крупно
  const items: DeckItem[] = objects.map((o) => ({
    src: o.photo ? `/photos/${o.photo}` : undefined,
    caption: o.name,
    logos: o.logos?.map((file) => `/logos/objects/${file}`),
    title: o.name,
    placeholder: draft ? undefined : o.name,
  }));

  return (
    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-20">
      <PhotoDeck
        items={items}
        tone="dark"
        captions={false}
        label="Фото объектов"
        onChange={setCurrent}
        controllerRef={deck}
      />

      <div>
        {/* Описания всех объектов лежат в одной ячейке сетки друг на друге, видно только
            текущее. Так высота блока — по самому длинному описанию и не прыгает при
            листании (иначе полоски и всё ниже дёргались бы). У текущего key меняется —
            блок пересоздаётся и заново проигрывает появление (.object-swap). */}
        <div className="grid" aria-live="polite">
          {objects.map((o, i) => {
            const isCurrent = i === current;
            return (
              <div
                key={isCurrent ? `current-${i}` : i}
                aria-hidden={!isCurrent}
                className={`col-start-1 row-start-1 ${isCurrent ? "object-swap" : "invisible"}`}
              >
                <p className="text-sm font-semibold tracking-widest text-signal-400 uppercase">
                  {o.work}
                </p>
                <h3 className="mt-3 font-display text-2xl font-extrabold text-white sm:text-3xl">
                  {o.name}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-steel-300 sm:text-lg">
                  {o.text}
                </p>
                {o.scope && o.scope.length > 0 ? (
                  <ul className="mt-5 grid gap-y-2.5">
                    {o.scope.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-base leading-snug text-steel-200 sm:text-lg"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-signal-500"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {o.year ? (
                  <p className="mt-3 text-sm text-steel-400">{o.year}</p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {objects.map((o, i) => (
            <button
              key={o.name}
              type="button"
              onClick={() => deck.current?.show(i)}
              aria-label={o.name}
              aria-current={i === current ? "true" : undefined}
              className="group flex h-6 items-center"
            >
              <span
                className={`block h-1.5 w-8 rounded-full transition-colors duration-300 ${
                  i === current
                    ? "bg-signal-500"
                    : "bg-steel-700 group-hover:bg-steel-500"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
