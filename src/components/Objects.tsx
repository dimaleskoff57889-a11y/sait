import { site, has } from "@/content/site";
import { Section } from "./Section";
import { ObjectsShowcase } from "./ObjectsShowcase";

/**
 * Самый ценный блок сайта: доказательство, что человек действительно работал.
 * Одна стопка фото — по фото на объект; справа описание текущего объекта
 * (см. ObjectsShowcase). Пока список объектов пуст — секция не выводится.
 */
export function Objects() {
  if (!has(site.objects)) return null;

  return (
    <Section
      id="objects"
      dark
      title="Объекты"
      lead="Несколько объектов из более чем 500, где я работал с 2009 года."
    >
      <div data-reveal>
        <ObjectsShowcase objects={site.objects} draft={site.draft} />
      </div>
    </Section>
  );
}
