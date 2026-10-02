import type { Metadata } from "next";
import { site, has, type Service, type ServicePage } from "./site";

/**
 * Всё для поисковиков в одном месте (30.09): мета-теги страниц и разметка
 * schema.org (JSON-LD). Данные — только из site.ts, поэтому после правки
 * контента разметка обновится сама.
 *
 * Проверить разметку: https://webmaster.yandex.ru/tools/microtest/ (Яндекс) и
 * https://search.google.com/test/rich-results (Google).
 */

export type ServiceWithPage = Service & { page: ServicePage };

/** Услуги, у которых есть своя страница, — в порядке блока «Что делаю» */
export const servicePages: ServiceWithPage[] = (site.services as Service[]).filter(
  (s): s is ServiceWithPage => s.page !== undefined,
);

export const servicePath = (s: ServiceWithPage) => `/${s.page.slug}/`;

/** Абсолютный адрес: для разметки и IndexNow нужны полные ссылки */
export const absolute = (path: string) => `${site.url}${path}`;

/** Как сайт называется в выдаче: подпись из шапки, пока её нет — домен */
export const siteName = has(site.legal.shortName)
  ? site.legal.shortName
  : site.url.replace(/^https?:\/\//, "");

/** Кто оказывает услуги — ИП с ФИО (или подпись из шапки, когда появится) */
const businessName = has(site.legal.shortName)
  ? site.legal.shortName
  : [site.legal.form, site.legal.fullName].filter(has).join(" ");

/**
 * Мета-теги страницы: заголовок, описание, канонический адрес (у каждой
 * страницы свой — иначе поисковик считает страницы копиями главной) и превью
 * ссылки в мессенджерах.
 */
export function pageMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      locale: "ru_RU",
      siteName,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image" },
  };
}

const BUSINESS_ID = absolute("/#business");
const WEBSITE_ID = absolute("/#website");

/**
 * Мастер как местная организация: чем занимается, где работает, как связаться,
 * какие работы оказывает. Адреса офиса нет — только город и зона выезда.
 * Часы в разметку не пишем: дни недели папа не называл, только «с 8 до 20».
 */
export function businessSchema() {
  return {
    "@type": "LocalBusiness",
    "@id": BUSINESS_ID,
    name: businessName,
    description: site.seo.description,
    url: absolute("/"),
    telephone: site.contacts.phoneRaw,
    image: absolute("/og.png"),
    logo: absolute("/icon2.png"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Москва",
      addressCountry: "RU",
    },
    areaServed: [
      { "@type": "City", name: "Москва" },
      { "@type": "AdministrativeArea", name: "Московская область" },
    ],
    founder: {
      "@type": "Person",
      name: site.legal.fullName,
      jobTitle: "Мастер по грузовым подъёмникам",
    },
    knowsAbout: site.equipment.map((e) => e.full),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Работы с грузовыми подъёмниками",
      itemListElement: (site.services as Service[]).map((s) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.page?.h1 ?? s.title,
          description: s.text,
          ...(s.page ? { url: absolute(`/${s.page.slug}/`) } : {}),
        },
      })),
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: site.contacts.phoneRaw,
      contactType: "customer service",
      areaServed: "RU",
      availableLanguage: "ru",
    },
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absolute("/"),
    name: siteName,
    inLanguage: "ru-RU",
    publisher: { "@id": BUSINESS_ID },
  };
}

/** Страница услуги — ссылается на мастера из разметки главной */
export function serviceSchema(s: ServiceWithPage) {
  return {
    "@type": "Service",
    "@id": absolute(`${servicePath(s)}#service`),
    name: s.page.h1,
    serviceType: s.title,
    description: s.page.seoDescription,
    url: absolute(servicePath(s)),
    provider: { "@id": BUSINESS_ID },
    areaServed: [
      { "@type": "City", name: "Москва" },
      { "@type": "AdministrativeArea", name: "Московская область" },
    ],
  };
}

/** Хлебные крошки: последний пункт — текущая страница */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

/** Несколько сущностей одной разметкой (@graph) */
export const graph = (...nodes: object[]) => ({
  "@context": "https://schema.org",
  "@graph": nodes,
});
