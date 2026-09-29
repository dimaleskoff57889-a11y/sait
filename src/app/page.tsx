import { DraftBanner } from "@/components/DraftBanner";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Stats } from "@/components/Stats";
import { Services } from "@/components/Services";
import { Objects } from "@/components/Objects";
import { About } from "@/components/About";
import { Documents } from "@/components/Documents";
import { Terms } from "@/components/Terms";
import { Contacts } from "@/components/Contacts";
import { Footer } from "@/components/Footer";

/**
 * Порядок блоков подобран под то, как заказчик читает визитку подрядчика:
 * кто ты и как связаться → что делаешь → чем докажешь → кто ты как человек
 * → допуски → условия → связаться ещё раз.
 *
 * Блоки без содержимого исчезают сами (см. has() в src/content/site.ts),
 * поэтому страница не разваливается, пока ответов от папы нет.
 */
export default function Page() {
  return (
    <>
      <DraftBanner />
      <Header />
      <main>
        <Hero />
        <Stats />
        <Services />
        <Objects />
        <About />
        <Documents />
        <Terms />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
