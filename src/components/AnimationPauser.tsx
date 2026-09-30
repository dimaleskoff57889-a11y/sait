"use client";

import { useEffect } from "react";

/**
 * Ставит на паузу бесконечные CSS-анимации блоков, которых сейчас не видно:
 * вешает data-paused на блок страницы, ушедший за экран (с запасом 150 px),
 * а стили в globals.css останавливают всё внутри него. Бегущая строка,
 * чертёж на первом экране, сигнальные ленты, кольца у кнопок не тратят
 * процессор, пока их не видно, — страница листается плавнее.
 *
 * Атрибут, а не класс: React его не трогает при перерисовке.
 */
export function AnimationPauser() {
  useEffect(() => {
    const blocks = Array.from(
      document.querySelectorAll<HTMLElement>("main > *"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute("data-paused", !entry.isIntersecting);
        }
      },
      { rootMargin: "150px 0px" },
    );
    blocks.forEach((block) => observer.observe(block));
    return () => observer.disconnect();
  }, []);

  return null;
}
