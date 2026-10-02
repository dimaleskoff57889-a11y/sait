"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Floor = { title: string; text: string };

/** Толщина перекрытия, px — совпадает с h-3 у .floor-slab */
const SLAB = 12;

/**
 * «Что делаю» — разрез здания: слева шахта (сверху привод, снизу приямок),
 * справа этажи, одна услуга — один этаж. Кабина едет к тому этажу, который
 * сейчас посередине экрана, и встаёт на его перекрытие; чем дальше ехать,
 * тем дольше ход. Кнопка вызова у этажа мигает, пока кабина едет, и горит,
 * когда приехала; нажатие — прокрутка к этажу.
 *
 * Прокрутку не перехватываем: страница листается как обычно, кабина лишь
 * догоняет. Навели курсор на этаж — кабина едет к нему и этаж загорается;
 * убрали курсор с этажей — кабина возвращается к этажу посередине экрана.
 * Без JS видны все этажи целиком, кабины нет.
 */
export function ServicesShaft({ floors }: { floors: Floor[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  /**
   * На телефоне шахта начинается от самого верха раздела и идёт рядом с
   * заголовком (владелец, 30.09): насколько её поднять — меряем, px
   */
  const [rise, setRise] = useState(0);
  const floorRefs = useRef<(HTMLLIElement | null)[]>([]);

  /**
   * Верх перекрытия каждого этажа от верха шахты, px. Кабину ставим низом на
   * эту отметку: translateY(отметка − 100%), где 100% — её собственная высота.
   * Высоту кабины сами не меряем: если замерить её раньше, чем она
   * отрисовалась (0 px), кабина проваливалась ниже перекрытия на свой рост.
   */
  const [stops, setStops] = useState<number[]>([]);
  const [active, setActive] = useState(0);
  const [arrived, setArrived] = useState(true);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const [duration, setDuration] = useState(0);

  // Где кабина стоит на каждом этаже: на верху перекрытия под этажом
  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    const root = rootRef.current;
    const section = root?.closest("section");

    const measure = () => {
      if (root && section) {
        setRise(
          Math.round(
            root.getBoundingClientRect().top -
              section.getBoundingClientRect().top,
          ),
        );
      }
      const top = body.getBoundingClientRect().top;
      setStops(
        floorRefs.current.map((li) =>
          li ? li.getBoundingClientRect().bottom - SLAB - top : 0,
        ),
      );
    };
    measure();
    // Этажи меняют высоту, когда догружаются шрифты и меняется ширина окна
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    // Заголовок над шахтой меняет высоту при загрузке шрифта — от этого зависит подъём
    if (section) observer.observe(section);
    floorRefs.current.forEach((li) => li && observer.observe(li));
    document.fonts?.ready.then(measure);
    window.addEventListener("load", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("load", measure);
    };
  }, []);

  /** Наведение на этаж: кабина едет к нему; ушли с этажей — обратно к этажу посередине экрана */
  const hover = useRef<{
    enter: (i: number) => void;
    leave: () => void;
  } | null>(null);

  // Какой этаж посередине экрана — туда и едем; этаж под курсором важнее
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let current = 0;
    let timer: number | undefined;
    /** Этаж посередине экрана и этаж под курсором (null — курсора нет) */
    let centered = 0;
    let hovered: number | null = null;
    let leaveTimer: number | undefined;

    const go = (to: number) => {
      if (to === current) return;
      const ms = reduce ? 0 : 550 + 350 * Math.abs(to - current);
      setDirection(to > current ? "down" : "up");
      setDuration(ms);
      setActive(to);
      setArrived(false);
      current = to;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setArrived(true);
        setDirection(null);
      }, ms);
    };

    hover.current = {
      enter: (i) => {
        window.clearTimeout(leaveTimer);
        hovered = i;
        go(i);
      },
      // Небольшая пауза: при переходе курсора между этажами кабина не дёргается назад
      leave: () => {
        window.clearTimeout(leaveTimer);
        leaveTimer = window.setTimeout(() => {
          hovered = null;
          go(centered);
        }, 250);
      },
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          centered = Number((entry.target as HTMLElement).dataset.floor);
          if (hovered === null) go(centered);
        }
      },
      { rootMargin: "-49% 0px -50% 0px" },
    );
    floorRefs.current.forEach((li) => li && observer.observe(li));

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.clearTimeout(leaveTimer);
      hover.current = null;
    };
  }, []);

  const ready = stops.length === floors.length;
  const moving = !arrived;

  return (
    <div ref={rootRef} className="relative">
      {/* Шахта — чистая графика, для скринридеров достаточно списка этажей */}
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 flex w-16 flex-col max-lg:top-(--shaft-top) lg:w-44"
        style={{ "--shaft-top": `${-rise}px` } as React.CSSProperties}
      >
        <div className="h-10 shrink-0 lg:h-24">
          <MachineRoom moving={moving} />
        </div>

        <div ref={bodyRef} className="relative flex-1 overflow-hidden">
          {/* Сетка-ограждение, направляющие и буферы приямка; кабина и трос — поверх.
              Сетка кончается на полу приямка (bottom-3), а не уходит под его штриховку */}
          <div className="shaft-mesh absolute inset-x-0 top-0 bottom-3">
            <span className="absolute inset-y-0 left-[calc(14%-5px)] w-[3px] bg-steel-400/70" />
            <span className="absolute inset-y-0 right-[calc(14%-5px)] w-[3px] bg-steel-400/70" />

            {/* Приямок: буферы и дно */}
            <svg
              viewBox="0 0 80 32"
              className="absolute inset-x-[22%] bottom-0 h-5 lg:h-9"
              preserveAspectRatio="xMidYMax meet"
            >
              {[20, 60].map((x) => (
                <g
                  key={x}
                  fill="none"
                  stroke="#7d92a8"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                >
                  <path d={`M${x - 9} 4h18`} />
                  <path d={`M${x} 4l-8 5 16 5-16 5 16 5-8 5v3`} />
                </g>
              ))}
            </svg>
          </div>
          {/* Пол приямка — под сеткой, во всю ширину шахты */}
          <span className="floor-slab absolute inset-x-0 bottom-0 h-3" />

          {/* Кабина. Трос — полоска вверх от кабины, выше шахты её срезает overflow */}
          <div
            className="shaft-cabin absolute inset-x-[14%] top-0"
            style={{
              transform: `translateY(calc(${ready ? stops[active] : 0}px - 100%))`,
              transitionDuration: `${duration}ms`,
              opacity: ready ? 1 : 0,
            }}
          >
            <span className="absolute bottom-full left-1/2 h-[300vh] w-0.5 -translate-x-1/2 bg-steel-500" />
            <Cabin />
            {/* Дверь шахты у этажа, где стоит кабина: загорается по приезде. Стена
                шахты — в 14% ширины шахты от кабины, а кабина шириной 72%: 14/72 ≈ 19,4% */}
            <span
              className="absolute inset-y-0 right-[calc(-19.4%-2px)] w-[3px] bg-signal-500 transition-opacity duration-300"
              style={{ opacity: ready && arrived ? 1 : 0 }}
            />
            {/* Табло в кабине: стрелка хода или номер этажа */}
            <span className="absolute top-[18%] right-[20%] hidden h-6 min-w-7 items-center justify-center rounded bg-steel-950 px-1 text-[11px] font-bold text-signal-400 tabular-nums lg:flex">
              {direction === "up" ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : direction === "down" ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                String(active + 1).padStart(2, "0")
              )}
            </span>
          </div>
        </div>
      </div>

      {/* На телефоне привод шахты — рядом с заголовком, поэтому сверху места под него не нужно */}
      <ol className="pt-0 pb-10 pl-20 lg:pt-24 lg:pb-16 lg:pl-56">
        {floors.map((floor, i) => {
          const isActive = ready && i === active;
          const lit = !ready || isActive;
          return (
            <li
              key={floor.title}
              ref={(el) => {
                floorRefs.current[i] = el;
              }}
              data-floor={i}
              onMouseEnter={() => hover.current?.enter(i)}
              onMouseLeave={() => hover.current?.leave()}
              className="relative flex items-end pt-8 pb-7 lg:min-h-[190px] lg:pt-10 lg:pb-8"
            >
              {/* Перекрытие под этажом — доходит до стены шахты */}
              <span
                aria-hidden
                className="floor-slab absolute right-0 bottom-0 -left-4 h-3 lg:-left-12"
              />

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:gap-8">
                <div className="flex shrink-0 items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      floorRefs.current[i]?.scrollIntoView({ block: "center" })
                    }
                    aria-label={`Вызвать лифт: ${floor.title}`}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                      isActive
                        ? arrived
                          ? "border-signal-500 bg-signal-500 shadow-[0_0_16px_rgb(245_158_11/0.6)]"
                          : "call-blink border-signal-500 bg-white"
                        : "border-steel-300 bg-white hover:border-steel-500"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                        isActive
                          ? arrived
                            ? "bg-steel-950"
                            : "bg-signal-500"
                          : "bg-steel-300"
                      }`}
                    />
                  </button>
                  {/* Номер этажа — украшение, дикторам не нужен */}
                  <span
                    aria-hidden
                    className="floor-num font-display text-4xl leading-none font-extrabold sm:text-5xl lg:text-7xl"
                    data-lit={lit ? "" : undefined}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div
                  className={`max-w-xl transition-opacity duration-500 ${lit ? "opacity-100" : "opacity-40"}`}
                >
                  <h3 className="font-display text-xl font-extrabold text-steel-900 lg:text-2xl">
                    {floor.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-steel-600">
                    {floor.text}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Машинное помещение над шахтой: балка, двигатель с барабаном, шкаф управления
 * (лампа горит, пока кабина едет). Низ барабана — верх шахты, трос идёт из него.
 */
function MachineRoom({ moving }: { moving: boolean }) {
  return (
    <svg
      viewBox="0 0 176 96"
      className="h-full w-full"
      preserveAspectRatio="xMidYMax meet"
    >
      <rect
        x="0"
        y="4"
        width="176"
        height="8"
        fill="#cdd7e0"
        stroke="#7d92a8"
        strokeWidth="1.5"
      />
      <path d="M1 12V96M175 12V96" stroke="#cdd7e0" strokeWidth="2" />
      {/* Двигатель с рёбрами, муфта */}
      <rect
        x="12"
        y="44"
        width="44"
        height="34"
        rx="3"
        fill="#fff"
        stroke="#5c748c"
        strokeWidth="2"
      />
      {[21, 29, 37, 45].map((x) => (
        <path key={x} d={`M${x} 50V72`} stroke="#a8b8c8" strokeWidth="1.5" />
      ))}
      <path d="M14 84h40" stroke="#7d92a8" strokeWidth="3" />
      <rect x="56" y="55" width="12" height="12" fill="#5c748c" />
      {/* Барабан */}
      <circle
        cx="88"
        cy="76"
        r="20"
        fill="#fff"
        stroke="#5c748c"
        strokeWidth="2"
      />
      <circle
        cx="88"
        cy="76"
        r="12"
        fill="none"
        stroke="#a8b8c8"
        strokeWidth="1.5"
      />
      <circle cx="88" cy="76" r="4" fill="#5c748c" />
      {/* Шкаф управления */}
      <rect
        x="120"
        y="22"
        width="44"
        height="60"
        rx="3"
        fill="#fff"
        stroke="#5c748c"
        strokeWidth="2"
      />
      <rect
        x="127"
        y="30"
        width="18"
        height="10"
        rx="1.5"
        fill="none"
        stroke="#a8b8c8"
        strokeWidth="1.5"
      />
      <circle cx="154" cy="35" r="4" fill={moving ? "#f59e0b" : "#cdd7e0"} />
      {[52, 60, 68].map((y) => (
        <path key={y} d={`M128 ${y}h28`} stroke="#a8b8c8" strokeWidth="1.5" />
      ))}
      <path d="M142 82v8H108" fill="none" stroke="#f59e0b" strokeWidth="2" />
    </svg>
  );
}

/** Кабина: рама, груз на поддоне, пол в сигнальную полоску, башмаки на направляющих */
function Cabin() {
  return (
    <svg viewBox="0 0 120 104" className="block h-auto w-full">
      <defs>
        <pattern
          id="cabin-hazard"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="10" height="10" fill="#1d2734" />
          <rect width="5" height="10" fill="#f59e0b" />
        </pattern>
      </defs>
      <rect x="8" y="0" width="104" height="92" fill="#f4f6f8" />
      <rect x="8" y="0" width="104" height="8" fill="#3a4b5d" />
      <rect x="8" y="0" width="6" height="92" fill="#3a4b5d" />
      <rect x="106" y="0" width="6" height="92" fill="#3a4b5d" />
      {/* Башмаки */}
      {[4, 80].map((y) => (
        <g key={y} fill="#475d73">
          <rect x="2" y={y} width="6" height="10" />
          <rect x="112" y={y} width="6" height="10" />
        </g>
      ))}
      {/* Груз */}
      <g fill="#e7ecf1" stroke="#5c748c" strokeWidth="2">
        <rect x="26" y="48" width="34" height="44" />
        <rect x="62" y="62" width="30" height="30" />
      </g>
      <path
        d="M43 48V92M26 62h34M77 62v30"
        stroke="#a8b8c8"
        strokeWidth="1.5"
      />
      <rect x="4" y="92" width="112" height="12" fill="url(#cabin-hazard)" />
    </svg>
  );
}
