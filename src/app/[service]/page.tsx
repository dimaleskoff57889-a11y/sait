import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Stats } from "@/components/Stats";
import { EquipmentSection } from "@/components/EquipmentGuide";
import { Process } from "@/components/Process";
import { Contacts } from "@/components/Contacts";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { AnimationPauser } from "@/components/AnimationPauser";
import { JsonLd } from "@/components/JsonLd";
import { FloorIndicator, type Floor } from "@/components/FloorIndicator";
import {
  OtherServices,
  ServiceHero,
  ServiceIncludes,
  ServiceObjects,
  ServiceSigns,
} from "@/components/ServicePage";
import {
  breadcrumbSchema,
  businessSchema,
  graph,
  pageMetadata,
  servicePages,
  servicePath,
  serviceSchema,
} from "@/content/seo";

/**
 * Страницы услуг: topmontaz.ru/montazh-gruzovyh-podemnikov/ и т. д. (SEO, 30.09).
 * Какие страницы есть — решает site.services[].page; при сборке каждая
 * превращается в отдельный HTML-файл, других адресов этот маршрут не отдаёт.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return servicePages.map((s) => ({ service: s.page.slug }));
}

/**
 * Этажи «пульта лифта» — как на главной, в порядке блоков страницы.
 * Блока может не быть (у монтажа нет «Когда пора звонить») — пульт его пропустит.
 */
const FLOORS: Floor[] = [
  { id: "top", label: "Начало" },
  { id: "signs", label: "Когда звонить" },
  { id: "includes", label: "Что входит" },
  { id: "equipment", label: "Подъёмники" },
  { id: "objects", label: "Объекты" },
  { id: "process", label: "Как работаю" },
  { id: "other-services", label: "Другие работы" },
  { id: "contacts", label: "Связаться" },
];

type Props = { params: Promise<{ service: string }> };

const find = (slug: string) => servicePages.find((s) => s.page.slug === slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = find((await params).service);
  if (!service) return {};
  return pageMetadata({
    path: servicePath(service),
    title: service.page.seoTitle,
    description: service.page.seoDescription,
  });
}

export default async function ServiceRoute({ params }: Props) {
  const service = find((await params).service);
  if (!service) notFound();

  return (
    <>
      <JsonLd
        data={graph(
          businessSchema(),
          serviceSchema(service),
          breadcrumbSchema([
            { name: "Главная", path: "/" },
            { name: service.title, path: servicePath(service) },
          ]),
        )}
      />
      <Header />
      <main>
        <ServiceHero service={service} />
        <Stats />
        <ServiceSigns service={service} />
        <ServiceIncludes service={service} />
        <EquipmentSection />
        <ServiceObjects service={service} />
        <Process />
        <OtherServices service={service} />
        <Contacts />
      </main>
      <Footer />
      <FloorIndicator floors={FLOORS} />
      <RevealObserver />
      <AnimationPauser />
    </>
  );
}
