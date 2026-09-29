import { site, has } from "@/content/site";
import { Section } from "./Section";

export function About() {
  if (!has(site.about.text) && !has(site.story)) return null;

  return (
    <Section id="about" title="О мастере">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {has(site.about.text) ? (
            <p className="text-base leading-relaxed text-steel-700">{site.about.text}</p>
          ) : null}

          {has(site.story) ? (
            <blockquote className="mt-8 border-l-4 border-signal-500 bg-steel-50 px-5 py-4">
              <p className="text-base leading-relaxed text-steel-700">{site.story}</p>
            </blockquote>
          ) : null}
        </div>

        {has(site.about.photo) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/photos/${site.about.photo}`}
            alt={site.legal.fullName || site.legal.shortName || "Мастер"}
            className="h-80 w-full rounded-2xl object-cover"
          />
        ) : null}
      </div>
    </Section>
  );
}
