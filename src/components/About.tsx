import { site, has } from "@/content/site";
import { Section } from "./Section";
import { PhotoDeck, type DeckItem } from "./PhotoDeck";

/**
 * Заглушки для стопки фото, пока настоящих нет. Подписи подсказывают,
 * какие фото сюда просить (см. раздел «Фото» в SITE.md). Показываются
 * только в черновике: на готовом сайте «фото появится здесь» выглядело бы
 * как недоделка — там без фото стопка просто не выводится.
 */
const PLACEHOLDERS: DeckItem[] = [
  { caption: "Бригада за работой" },
  { caption: "Готовый подъёмник" },
  { caption: "Монтаж на объекте" },
  { caption: "Шкаф управления" },
];

export function About() {
  if (!has(site.about.text) && !has(site.story)) return null;

  // Портрет — первым в стопке, за ним фото из галереи
  const photos: DeckItem[] = [
    ...(has(site.about.photo) ? [{ src: `/photos/${site.about.photo}`, caption: site.legal.fullName }] : []),
    ...site.gallery.map((g) => ({ src: `/photos/${g.file}`, caption: g.caption })),
  ];
  const deck = photos.length > 0 ? photos : site.draft ? PLACEHOLDERS : [];

  return (
    <Section id="about" title="О мастере">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div data-reveal>
          {has(site.about.text) ? (
            <p className="text-base leading-relaxed text-steel-700 sm:text-lg">{site.about.text}</p>
          ) : null}

          {has(site.story) ? (
            <blockquote className="mt-8 border-l-4 border-signal-500 bg-steel-50 px-5 py-4">
              <p className="text-base leading-relaxed text-steel-700">{site.story}</p>
            </blockquote>
          ) : null}
        </div>

        {deck.length > 0 ? (
          <div data-reveal>
            <PhotoDeck items={deck} />
          </div>
        ) : null}
      </div>
    </Section>
  );
}
