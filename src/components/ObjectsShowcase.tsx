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
export function ObjectsShowcase({ objects, draft }: { objects: WorkObject[]; draft: boolean }) {
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
  const object = objects[current] ?? objects[0];

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
        {/* key — чтобы при смене объекта блок пересоздавался и заново проигрывал появление */}
        <div key={current} className="object-swap" aria-live="polite">
          <p className="text-xs font-semibold tracking-widest text-signal-400 uppercase">
            {object.work}
          </p>
          <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">{object.name}</h3>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-steel-300">{object.text}</p>
          {object.year ? <p className="mt-3 text-sm text-steel-400">{object.year}</p> : null}
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
                  i === current ? "bg-signal-500" : "bg-steel-700 group-hover:bg-steel-500"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
