"use client";

import { useLayoutEffect } from "react";

/**
 * Появление блоков при прокрутке: элементам с data-reveal ставит атрибут
 * data-shown, когда они входят в экран, — один раз, без повторов.
 * Именно атрибут, а не класс: React при смене className переписывает классы
 * целиком и стёр бы пометку — блок снова исчез бы (так пропадал заголовок).
 *
 * Класс js-reveal на <html> ставится только здесь, после загрузки скрипта:
 * без JS контент не прячется. То, что уже на экране в момент загрузки,
 * помечается видимым ДО постановки класса — поэтому ничего не мигает.
 */
export function RevealObserver() {
  useLayoutEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const viewport = window.innerHeight;
    const pending: HTMLElement[] = [];

    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewport && rect.bottom > 0) el.setAttribute("data-shown", "");
      else pending.push(el);
    }

    document.documentElement.classList.add("js-reveal");

    if (!("IntersectionObserver" in window)) {
      pending.forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    pending.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return null;
}
