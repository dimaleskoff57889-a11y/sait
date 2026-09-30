import { site, has } from "@/content/site";
import { Section } from "./Section";
import { PhotoDeck, type DeckItem } from "./PhotoDeck";

/**
 * Заглушки для стопки фото, пока настоящих нет: рисунки в стиле чертежа
 * (DeckArt) под каждую подпись. Подписи подсказывают, какие фото сюда
 * просить (см. раздел «Фото» в SITE.md). Показываются только в черновике —
 * на готовом сайте без фото стопка просто не выводится.
 */
const PLACEHOLDERS: DeckItem[] = [
  { caption: "Бригада за работой", art: "brigade" },
  { caption: "Готовый подъёмник", art: "lift" },
  { caption: "Монтаж на объекте", art: "install" },
  { caption: "Шкаф управления", art: "cabinet" },
];

export function About() {
  if (!has(site.about.text) && !has(site.story)) return null;

  // Портрет — первым в стопке, за ним фото из галереи
  const portrait: DeckItem[] = has(site.about.photo)
    ? [{ src: `/photos/${site.about.photo}`, caption: site.legal.fullName }]
    : [];
  const gallery: DeckItem[] = site.gallery.map((g) => ({
    src: `/photos/${g.file}`,
    caption: g.caption,
    focus: g.focus,
  }));
  // В черновике после настоящих фото идут заглушки — кроме тех, чьё фото уже
  // есть (подпись совпадает); на готовом сайте — только настоящие фото.
  // Настоящие фото первыми — их видно сразу, сверху стопки.
  const shot = new Set(gallery.map((g) => g.caption));
  const deck = site.draft
    ? [
        ...portrait,
        ...gallery,
        ...PLACEHOLDERS.filter((p) => !shot.has(p.caption)),
      ]
    : [...portrait, ...gallery];

  return (
    <Section id="about" title="О мастере">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div data-reveal>
          {has(site.about.text) ? (
            <p className="text-base leading-relaxed text-steel-700 sm:text-lg">
              {site.about.text}
            </p>
          ) : null}

          {has(site.story) ? (
            <blockquote className="mt-8 border-l-4 border-signal-500 bg-steel-50 px-5 py-4">
              <p className="text-base leading-relaxed text-steel-700">
                {site.story}
              </p>
            </blockquote>
          ) : null}
        </div>

        {deck.length > 0 ? (
          <div data-reveal>
            <PhotoDeck items={deck} aspect="aspect-[2/3]" />
          </div>
        ) : null}
      </div>
    </Section>
  );
}
