"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export type Floor = { id: string; label: string };

/**
 * Навигация по разделам в виде пульта лифта — справа, только на широком
 * экране (где по бокам от контента есть поле). Верх страницы — верхний этаж:
 * листаешь вниз — «едешь» вниз. Текущий этаж горит, на табло — номер и
 * стрелка направления, пока идёт прокрутка. Кнопки — обычные якорные ссылки.
 */
export function FloorIndicator({ floors }: { floors: Floor[] }) {
  const [present, setPresent] = useState<Floor[]>([]);
  const [active, setActive] = useState("");
  const [direction, setDirection] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const list = floors.filter((f) => document.getElementById(f.id));
    setPresent(list);

    // Активен раздел, который пересекает линию чуть выше середины экрана
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    list.forEach((f) => observer.observe(document.getElementById(f.id)!));

    let lastY = window.scrollY;
    let timer: number | undefined;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 2) setDirection(y > lastY ? "down" : "up");
      lastY = y;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setDirection(null), 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [floors]);

  if (present.length === 0) return null;

  const floorNumber = (index: number) => present.length - index;
  const activeIndex = present.findIndex((f) => f.id === active);

  return (
    <nav
      aria-label="Разделы сайта"
      className="fixed top-1/2 right-3 z-40 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-2xl border border-steel-700 bg-steel-900/85 p-2 shadow-xl shadow-steel-950/30 backdrop-blur xl:flex"
    >
      {/* Табло: номер этажа и стрелка хода */}
      <div
        aria-hidden
        className="flex h-12 w-9 flex-col items-center justify-center rounded-lg bg-steel-950 text-signal-400"
      >
        <ChevronUp
          className={`h-3.5 w-3.5 transition-opacity ${direction === "up" ? "opacity-100" : "opacity-0"}`}
        />
        <span className="text-sm leading-4 font-bold tabular-nums">
          {activeIndex >= 0 ? floorNumber(activeIndex) : ""}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-opacity ${direction === "down" ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {present.map((floor, i) => {
        const isActive = floor.id === active;
        return (
          <a
            key={floor.id}
            href={`#${floor.id}`}
            aria-label={floor.label}
            aria-current={isActive ? "location" : undefined}
            className={`group relative flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
              isActive
                ? "border-signal-400 bg-signal-500 text-steel-950 shadow-[0_0_14px_rgb(245_158_11/0.55)]"
                : "border-steel-600 text-steel-300 hover:border-steel-400 hover:text-white"
            }`}
          >
            {floorNumber(i)}
            <span className="pointer-events-none absolute right-full mr-3 rounded-md bg-steel-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-lg transition group-hover:opacity-100">
              {floor.label}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
