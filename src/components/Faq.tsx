import { Plus } from "lucide-react";
import { has, type Faq as FaqItem } from "@/content/site";
import { Section } from "./Section";

/**
 * «Частые вопросы» (SEO, 30.09): вопросы раскрываются по нажатию — обычные
 * <details>, работают и без JS. Ответы лежат в странице и закрытыми, поэтому
 * поисковики их видят; та же пара «вопрос — ответ» уходит в разметку FAQPage
 * (src/content/seo.ts).
 */
export function Faq({
  items,
  title = "Частые вопросы",
  lead,
  muted = false,
}: {
  items: FaqItem[];
  title?: string;
  lead?: string;
  muted?: boolean;
}) {
  if (!has(items)) return null;

  return (
    <Section id="faq" title={title} lead={lead} muted={muted}>
      <div data-reveal className="max-w-3xl border-t border-steel-200">
        {items.map((item) => (
          <details key={item.q} className="group border-b border-steel-200">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-5 py-5 text-left [&::-webkit-details-marker]:hidden">
              <h3 className="pt-1 text-base font-semibold text-steel-900 sm:text-lg">
                {item.q}
              </h3>
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-steel-900 text-signal-400 transition-transform duration-300 group-open:rotate-45 group-hover:bg-steel-800"
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </span>
            </summary>
            <p className="-mt-1 pr-2 pb-6 text-base leading-relaxed text-steel-600 sm:pr-14">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
