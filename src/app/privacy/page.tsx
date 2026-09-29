import type { Metadata } from "next";
import Link from "next/link";
import { site, has } from "@/content/site";
import { DraftBanner } from "@/components/DraftBanner";

export const metadata: Metadata = {
  title: ["Политика обработки персональных данных", site.legal.shortName].filter(has).join(" — "),
  robots: site.draft ? { index: false, follow: false } : undefined,
};

/**
 * Скромная отдельная страница, как и договаривались.
 *
 * ВНИМАНИЕ: текст ниже — РЫБА, типовая структура политики.
 * Он не проверен юристом и содержит ЗАГЛУШКИ на месте фактов.
 * Перед публикацией: заполнить реквизиты, согласовать формулировки,
 * убрать всё, что не соответствует реальности (например, раздел про cookie,
 * если счётчиков на сайте не будет).
 */
export default function PrivacyPage() {
  const { form, fullName, inn, ogrnip } = site.legal;

  return (
    <>
      <DraftBanner />
      <div className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <Link href="/" className="text-sm text-steel-500 hover:text-steel-900">
            ← На главную
          </Link>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-steel-900 sm:text-3xl">
            Политика обработки персональных данных
          </h1>
          <p className="mt-2 text-sm text-steel-400">
            Редакция от {/* ЗАГЛУШКА: дата утверждения */}__.__.____
          </p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-steel-700">
            <section>
              <h2 className="text-base font-semibold text-steel-900">1. Общие положения</h2>
              <p className="mt-2">
                {/* ЗАГЛУШКА */}
                Настоящая Политика определяет порядок обработки персональных данных
                и меры по обеспечению их безопасности, принимаемые Оператором.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-steel-900">2. Оператор</h2>
              <ul className="mt-2 space-y-1">
                <li>{has(fullName) ? [form, fullName].filter(has).join(" ") : "__________"}</li>
                <li>ИНН: {has(inn) ? inn : "__________"}</li>
                <li>ОГРНИП: {has(ogrnip) ? ogrnip : "__________"}</li>
                {/* ЗАГЛУШКА: адрес. Обсудить отдельно — у ИП это адрес регистрации. */}
                <li>Адрес: __________</li>
                <li>
                  Адрес для обращений:{" "}
                  {has(site.contacts.email) ? site.contacts.email : "__________"}
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-steel-900">
                3. Обрабатываемые данные и цели обработки
              </h2>
              <p className="mt-2">
                {/* ЗАГЛУШКА — зависит от того, что в итоге окажется на сайте:
                    форма заявки, счётчик аналитики, ничего из этого. */}
                __________
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-steel-900">
                4. Правовые основания обработки
              </h2>
              <p className="mt-2">{/* ЗАГЛУШКА */}__________</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-steel-900">
                5. Порядок обработки и передача третьим лицам
              </h2>
              <p className="mt-2">{/* ЗАГЛУШКА */}__________</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-steel-900">6. Сроки хранения</h2>
              <p className="mt-2">{/* ЗАГЛУШКА */}__________</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-steel-900">
                7. Права субъекта персональных данных
              </h2>
              <p className="mt-2">{/* ЗАГЛУШКА */}__________</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-steel-900">
                8. Меры по обеспечению безопасности
              </h2>
              <p className="mt-2">{/* ЗАГЛУШКА */}__________</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-steel-900">
                9. Изменения Политики
              </h2>
              <p className="mt-2">{/* ЗАГЛУШКА */}__________</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
