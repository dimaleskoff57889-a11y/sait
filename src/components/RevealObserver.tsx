"use client";

import { useLayoutEffect } from "react";

/**
 * Появление блоков при прокрутке: элементам с data-reveal добавляет класс
 * is-visible, когда они входят в экран, — один раз, без повторов.
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
      if (rect.top < viewport && rect.bottom > 0) el.classList.add("is-visible");
      else pending.push(el);
    }

    document.documentElement.classList.add("js-reveal");

    if (!("IntersectionObserver" in window)) {
      pending.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
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
