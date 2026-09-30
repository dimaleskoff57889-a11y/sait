import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Services } from "@/components/Services";
import { EquipmentSection } from "@/components/EquipmentGuide";
import { Objects } from "@/components/Objects";
import { About } from "@/components/About";
import { Process } from "@/components/Process";
import { Faq } from "@/components/Faq";
import { Contacts } from "@/components/Contacts";
import { Footer } from "@/components/Footer";
import { PartnersTicker } from "@/components/PartnersTicker";
import { RevealObserver } from "@/components/RevealObserver";
import { AnimationPauser } from "@/components/AnimationPauser";
import { FloorIndicator, type Floor } from "@/components/FloorIndicator";
import { JsonLd } from "@/components/JsonLd";
import { site, has } from "@/content/site";
import {
  businessSchema,
  faqSchema,
  graph,
  pageMetadata,
  websiteSchema,
} from "@/content/seo";

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: site.seo.title,
  description: site.seo.description,
});

/** Этажи «пульта лифта» — в порядке блоков на странице, сверху вниз */
const FLOORS: Floor[] = [
  { id: "top", label: "Главная" },
  { id: "services", label: "Что делаю" },
  { id: "equipment", label: "Подъёмники" },
  { id: "objects", label: "Объекты" },
  { id: "about", label: "О мастере" },
  { id: "process", label: "Как работаю" },
  { id: "faq", label: "Вопросы" },
  { id: "contacts", label: "Связаться" },
];

/**
 * Порядок блоков подобран под то, как заказчик читает визитку подрядчика:
 * кто ты и как связаться → что делаешь → чем докажешь → кто ты как человек
 * → как работаю → что обычно спрашивают → связаться ещё раз.
 *
 * Блоки без содержимого исчезают сами (см. has() в src/content/site.ts),
 * поэтому страница не разваливается, пока ответов от папы нет.
 */
export default function Page() {
  return (
    <>
      <JsonLd
        data={graph(
          websiteSchema(),
          businessSchema(),
          ...(has(site.faq) ? [faqSchema(site.faq)] : []),
        )}
      />
      <Header home />
      <main>
        <Hero />
        <Stats />
        <PartnersTicker />
        <Services />
        <EquipmentSection />
        <Objects />
        <About />
        <Process />
        <Faq items={site.faq} muted />
        <Contacts />
      </main>
      <Footer />
      <FloorIndicator floors={FLOORS} />
      <RevealObserver />
      <AnimationPauser />
    </>
  );
}
