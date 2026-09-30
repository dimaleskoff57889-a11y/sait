"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { Step } from "@/content/site";
import { revealDelay } from "./reveal";
import { AssemblyScene } from "./AssemblyScene";

/**
 * Сколько длится каждый этап в цикле, мс (от «номер загорелся» до следующего
 * номера). Звонок и договор дольше — в сцене сборки там переписка и подписание,
 * их нужно успеть прочитать (AssemblyScene).
 */
const STAGE_MS = [4800, 2200, 3600, 2600];
const stageMs = (i: number) => STAGE_MS[i] ?? 2200;
/** Сколько волна бежит по линии к следующему этапу — в конце этапа, мс */
const WAVE_MS = 1750;
/** Пауза перед стартом волны, мс */
const START_MS = 600;
/** От последнего этапа до «Готово!» — в сцене за это время пробный ход кабины и печать гарантии, мс */
const DONE_MS = 2700;
/** Сколько держится галочка, прежде чем всё погаснет и волна пойдёт снова, мс */
const HOLD_MS = 2600;
/** Волна до этапа под курсором — быстрее, чтобы отклик был сразу, мс */
const HOVER_MS = 700;
/** Через сколько после ухода курсора цикл продолжится, мс */
const RESUME_MS = 900;

/** Линия в своих координатах: вдоль — 0…100, поперёк — от базовой линии */
const H = { base: 20, amp: 18 }; // ряд: viewBox 100×30, горб вверх
const V = { base: 10, amp: 14 }; // столбик: viewBox 30×100, горб вправо
const SAMPLES = 60;
/** Ширина горба в долях длины линии */
const WIDTH = 15;

/**
 * Изгиб линии в точке x (0…100), когда гребень волны в точке c. Форма —
 * «мексиканская шляпа»: гребень и небольшие впадины по бокам, как у волны на
 * верёвке. Концы линии прибиты к номерам этапов (pin), у начала и конца пути
 * волна мягко нарастает и гаснет (env).
 */
function bend(x: number, c: number) {
  const d = (x - c) / WIDTH;
  const shape = (1 - 2 * d * d) * Math.exp(-d * d);
  const pin = Math.min(1, x / 5, (100 - x) / 5);
  const env = Math.min(1, c / 15, (100 - c) / 8);
  return shape * pin * Math.max(0, env);
}

function wavePath(c: number, vertical: boolean) {
  let d = "";
  for (let k = 0; k <= SAMPLES; k++) {
    const along = (k / SAMPLES) * 100;
    const off = bend(along, c);
    const [x, y] = vertical
      ? [V.base + V.amp * off, along]
      : [along, H.base - H.amp * off];
    d += `${k === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

const FLAT_H = `M0 ${H.base}L100 ${H.base}`;
const FLAT_V = `M${V.base} 0L${V.base} 100`;
const ORANGE = "#f59e0b";

type Wave = { line: number; ms: number };

/**
 * Шаги «Как работаю» с волной (идея владельца 30.09). Линия между этапами сама
 * изгибается волной: гребень бежит от этапа к следующему, за ним линия
 * становится оранжевой; дойдя, волна подбрасывает и зажигает номер. На
 * последнем этапе номер сменяется галочкой — «всё готово», — потом всё
 * гаснет, и по кругу. Навели курсор на этап — цикл встаёт, волна бежит к
 * этому этапу; убрали — цикл идёт дальше с него.
 *
 * stage: −1 — всё погашено; 0…N−1 — волна дошла до этого этапа (и в цикле
 * бежит к следующему); N — галочка. Цикл идёт, только пока шаги на экране,
 * и не идёт вовсе при prefers-reduced-motion.
 *
 * Форму линии пересчитываем каждый кадр прямо в DOM (requestAnimationFrame),
 * без перерисовки React. На широком экране шаги в ряд — волна бежит вправо;
 * на узком столбиком — вниз.
 */
export function ProcessWave({ steps }: { steps: Step[] }) {
  // В id градиента годятся только буквы, цифры, «-» и «_» (useId даёт и другие знаки)
  const uid = `pw${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const listRef = useRef<HTMLOListElement>(null);
  const [stage, setStage] = useState(-1);
  const [wave, setWave] = useState<Wave | null>(null);
  const last = steps.length - 1;

  /** Пути и точки раздела цвета у бегущей волны: [ряд, столбик] */
  const wavePaths = useRef<(SVGPathElement | null)[][]>([]);
  const waveStops = useRef<(SVGStopElement | null)[][]>([]);
  /** Наведение курсора — функции живут в эффекте, где идёт цикл */
  const hover = useRef<{
    enter: (i: number) => void;
    leave: () => void;
  } | null>(null);

  /** Без анимаций (prefers-reduced-motion) сцена сразу показывает готовый подъёмник */
  const [still, setStill] = useState(false);

  // Цикл волны и реакция на курсор
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStill(true);
      return;
    }
    // Только для разработки: ?proc=N ставит волну и сцену на этап N без цикла —
    // чтобы разглядеть каждый кадр (на готовом сайте параметр не действует)
    if (process.env.NODE_ENV !== "production") {
      const forced = new URLSearchParams(window.location.search).get("proc");
      if (forced !== null) {
        setStage(Number(forced));
        return;
      }
    }

    let timer: number | undefined;
    let waveTimer: number | undefined;
    let running = false;
    let current = -1;

    // Волна трогается к следующему этапу не сразу, а в конце текущего
    const go = (next: number) => {
      current = next;
      setStage(next);
      setWave(null);
      window.clearTimeout(waveTimer);
      if (next >= 0 && next < last) {
        waveTimer = window.setTimeout(
          () => setWave({ line: next, ms: WAVE_MS }),
          stageMs(next) - WAVE_MS,
        );
      }
    };

    // Следующий шаг цикла после текущего
    const schedule = (ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const next = current === -1 ? 0 : current > last ? -1 : current + 1;
        go(next);
        const wait =
          next === -1
            ? START_MS
            : next < last
              ? stageMs(next)
              : next === last
                ? DONE_MS
                : HOLD_MS;
        schedule(wait);
      }, ms);
    };

    const stop = () => {
      running = false;
      window.clearTimeout(timer);
      window.clearTimeout(waveTimer);
      current = -1;
      setStage(-1);
      setWave(null);
    };

    hover.current = {
      enter: (i) => {
        window.clearTimeout(timer);
        window.clearTimeout(waveTimer);
        if (i === current) return;
        if (i === 0) {
          current = 0;
          setStage(0);
          setWave(null);
          return;
        }
        // Всё до предыдущего этапа — сразу оранжевое, к наведённому бежит волна
        current = i - 1;
        setStage(i - 1);
        setWave({ line: i - 1, ms: HOVER_MS });
        timer = window.setTimeout(() => {
          current = i;
          setStage(i);
        }, HOVER_MS);
      },
      leave: () => {
        if (!running) return;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          // С этапа под курсором волна идёт дальше — к следующему
          if (current >= 0 && current < last) {
            setWave({ line: current, ms: WAVE_MS });
            schedule(WAVE_MS);
          } else schedule(0);
        }, RESUME_MS);
      },
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          schedule(START_MS);
        } else if (!entry.isIntersecting && running) {
          stop();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(list);

    return () => {
      window.clearTimeout(waveTimer);
      observer.disconnect();
      window.clearTimeout(timer);
      hover.current = null;
    };
  }, [last]);

  // Бегущая волна: каждый кадр — новая форма линии и граница оранжевого
  useEffect(() => {
    if (!wave) return;
    const start = performance.now();
    let raf = 0;
    const frame = (now: number) => {
      const p = Math.min(1, (now - start) / wave.ms);
      const c = (1 - Math.cos(Math.PI * p)) * 50; // плавный разгон и торможение
      [false, true].forEach((vertical, o) => {
        wavePaths.current[wave.line]?.[o]?.setAttribute(
          "d",
          wavePath(c, vertical),
        );
        const split = String(c / 100);
        waveStops.current[wave.line]?.[o * 2]?.setAttribute("offset", split);
        waveStops.current[wave.line]?.[o * 2 + 1]?.setAttribute(
          "offset",
          split,
        );
      });
      if (p < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [wave]);

  const done = stage > last;

  return (
    // Сцена сборки: на большом экране справа от этапов, на ноутбуке под ними,
    // на телефоне — над списком, чтобы была видна вместе с этапами
    <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-center xl:gap-10">
      <ol
        ref={listRef}
        className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-6"
      >
        {steps.map((step, i) => {
          const lit = stage >= i;
          const bounce = stage === i ? "proc-rise" : "";
          const isLast = i === last;
          const traveling = wave?.line === i && stage === i;
          const lineDone = stage > i;

          return (
            <li
              key={step.title}
              data-reveal
              style={revealDelay(i * 140)}
              onMouseEnter={() => hover.current?.enter(i)}
              onMouseLeave={() => hover.current?.leave()}
              className="group relative flex gap-4 lg:block"
            >
              {/* Линия до следующего этапа. Две версии: в ряд (широкий экран) и столбиком */}
              {i < last
                ? ([false, true] as const).map((vertical, o) => {
                    const gradient = `${uid}-${i}-${o}`;
                    // Обёртка задаёт размер линии от номера до номера. Сам svg с left+right
                    // не растянулся бы: у svg своя ширина по viewBox (~100px), и
                    // браузер берёт её, игнорируя right, — линия не доходила до этапа
                    return (
                      <div
                        key={o}
                        aria-hidden
                        className={`step-line absolute ${
                          vertical
                            ? "top-12 -bottom-8 left-2.5 w-[30px] lg:hidden"
                            : "top-0 -right-6 left-12 hidden h-[30px] lg:block"
                        }`}
                      >
                        <svg
                          viewBox={vertical ? "0 0 30 100" : "0 0 100 30"}
                          preserveAspectRatio="none"
                          className="absolute inset-0 h-full w-full overflow-visible"
                        >
                          {traveling ? (
                            <>
                              <defs>
                                <linearGradient
                                  id={gradient}
                                  gradientUnits="userSpaceOnUse"
                                  x1="0"
                                  y1="0"
                                  x2={vertical ? 0 : 100}
                                  y2={vertical ? 100 : 0}
                                >
                                  <stop offset="0" stopColor={ORANGE} />
                                  <stop
                                    ref={(el) => {
                                      (waveStops.current[i] ??= [])[o * 2] = el;
                                    }}
                                    offset="0"
                                    stopColor={ORANGE}
                                  />
                                  <stop
                                    ref={(el) => {
                                      (waveStops.current[i] ??= [])[o * 2 + 1] =
                                        el;
                                    }}
                                    offset="0"
                                    stopColor={ORANGE}
                                    stopOpacity="0.3"
                                  />
                                  <stop
                                    offset="1"
                                    stopColor={ORANGE}
                                    stopOpacity="0.3"
                                  />
                                </linearGradient>
                              </defs>
                              <path
                                ref={(el) => {
                                  (wavePaths.current[i] ??= [])[o] = el;
                                }}
                                d={vertical ? FLAT_V : FLAT_H}
                                fill="none"
                                stroke={`url(#${gradient})`}
                                strokeWidth="2"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                              />
                            </>
                          ) : (
                            <path
                              d={vertical ? FLAT_V : FLAT_H}
                              fill="none"
                              stroke={ORANGE}
                              strokeOpacity={lineDone ? 1 : 0.3}
                              strokeWidth="2"
                              vectorEffect="non-scaling-stroke"
                              className="transition-[stroke-opacity] duration-500"
                            />
                          )}
                        </svg>
                      </div>
                    );
                  })
                : null}

              <div
                className={`proc-badge relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-4 ring-white ${
                  lit
                    ? "bg-signal-500 text-steel-950"
                    : "bg-steel-900 text-signal-400 group-hover:bg-signal-500 group-hover:text-steel-950"
                } ${bounce}`}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              {/* «Готово!» — справа от последнего номера (широкий экран) */}
              {isLast ? (
                <DoneBadge
                  show={done}
                  className="absolute top-0 left-14 hidden lg:flex"
                />
              ) : null}
              <div className="lg:mt-5">
                <h3 className="text-base font-semibold text-steel-900">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-steel-500">
                  {step.text}
                </p>
                {/* На узком экране — под текстом последнего этапа, место под неё
                  занято всегда, чтобы при появлении ничего не сдвигалось */}
                {isLast ? (
                  <DoneBadge
                    show={done}
                    className="relative mt-3 flex w-fit lg:hidden"
                  />
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      <AssemblyScene
        stage={still ? last + 1 : stage}
        className="order-first lg:order-last xl:order-none"
      />
    </div>
  );
}

/** Направления искорок вокруг «Готово!»: [x, y] в px */
const SPARKS = [
  [-34, -22],
  [0, -30],
  [34, -22],
  [42, 8],
  [-42, 8],
  [0, 30],
];

/**
 * Зелёная плашка «Готово!» после последнего этапа: выскакивает с прыжком,
 * от неё разлетаются искорки. Пока волна не дошла — невидима (но место
 * занимает, чтобы ничего не прыгало).
 */
function DoneBadge({ show, className }: { show: boolean; className: string }) {
  return (
    <div
      aria-hidden={!show}
      className={`done-badge h-10 items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 ${
        show ? "is-shown" : ""
      } ${className}`}
    >
      <Check aria-hidden strokeWidth={3.2} className="h-4 w-4" />
      Готово!
      {show
        ? SPARKS.map(([x, y], k) => (
            <span
              key={k}
              aria-hidden
              className="done-spark absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full"
              style={
                {
                  "--sx": `${x}px`,
                  "--sy": `${y}px`,
                  background: k % 2 ? "#f59e0b" : "#10b981",
                } as React.CSSProperties
              }
            />
          ))
        : null}
    </div>
  );
}
