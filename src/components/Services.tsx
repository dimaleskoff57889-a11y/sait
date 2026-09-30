import { site, has } from "@/content/site";
import { Section } from "./Section";
import { ServicesShaft } from "./ServicesShaft";

export function Services() {
  if (!has(site.services)) return null;

  return (
    <Section
      id="services"
      title="Что делаю"
      muted
      centered
      // На телефоне слева от заголовка идёт шахта — центр заголовка над этажами, правее неё
      titleClassName="max-lg:pl-20"
    >
      {/* На телефоне этажи ближе к заголовку — отступ под заголовком там слишком велик */}
      <div className="-mt-8 lg:mt-0">
        <ServicesShaft
          floors={site.services.map(({ title, text, page }) => ({
            title,
            text,
            // Ссылка на страницу услуги — со словом услуги в тексте (SEO, 30.09)
            link: page ? { href: `/${page.slug}/`, text: page.linkText } : undefined,
          }))}
        />
      </div>

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
