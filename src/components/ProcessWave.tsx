"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { Step } from "@/content/site";
import { revealDelay } from "./reveal";

/** Сколько волна идёт от одного этапа до следующего в цикле, мс */
const STEP_MS = 2000;
/** Пауза перед стартом волны, мс */
const START_MS = 600;
/** От последнего этапа до галочки, мс */
const DONE_MS = 1000;
/** Сколько держится галочка, прежде чем всё погаснет и волна пойдёт снова, мс */
const HOLD_MS = 2600;
/** Волна до этапа под курсором — быстрее, чтобы отклик был сразу, мс */
const HOVER_MS = 700;
/** Через сколько после ухода курсора цикл продолжится, мс */
const RESUME_MS = 900;

/** Линия в своих координатах: вдоль — 0…100, поперёк — от базовой линии */
const H = { base: 20, amp: 11 }; // ряд: viewBox 100×30, горб вверх
const V = { base: 10, amp: 11 }; // столбик: viewBox 30×100, горб вправо
const SAMPLES = 60;
/** Ширина горба в долях длины линии */
const WIDTH = 13;

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

  // Цикл волны и реакция на курсор
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: number | undefined;
    let running = false;
    let current = -1;

    const go = (next: number) => {
      current = next;
      setStage(next);
      setWave(
        next >= 0 && next < last ? { line: next, ms: STEP_MS - 250 } : null,
      );
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
              ? STEP_MS
              : next === last
                ? DONE_MS
                : HOLD_MS;
        schedule(wait);
      }, ms);
    };

    const stop = () => {
      running = false;
      window.clearTimeout(timer);
      current = -1;
      setStage(-1);
      setWave(null);
    };

    hover.current = {
      enter: (i) => {
        window.clearTimeout(timer);
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
            setWave({ line: current, ms: STEP_MS - 250 });
            schedule(STEP_MS);
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
    <ol
      ref={listRef}
      className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-6"
    >
      {steps.map((step, i) => {
        const lit = stage >= i;
        const isCheck = done && i === last;
        // Разные имена анимации — чтобы «подпрыгнуть» ещё раз, когда номер сменяется галочкой
        const bounce = isCheck ? "proc-pop" : stage === i ? "proc-rise" : "";
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
                  return (
                    <svg
                      key={o}
                      aria-hidden
                      viewBox={vertical ? "0 0 30 100" : "0 0 100 30"}
                      preserveAspectRatio="none"
                      className={`step-line absolute overflow-visible ${
                        vertical
                          ? "top-12 -bottom-8 left-2.5 w-[30px] lg:hidden"
                          : "top-0 -right-6 left-12 hidden h-[30px] lg:block"
                      }`}
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
                                  (waveStops.current[i] ??= [])[o * 2 + 1] = el;
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
              <span
                className={`transition duration-300 ${isCheck ? "scale-50 opacity-0" : "scale-100 opacity-100"}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <Check
                aria-hidden
                strokeWidth={3}
                className={`absolute h-5 w-5 transition duration-300 ${isCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
              />
            </div>
            <div className="lg:mt-5">
              <h3 className="text-base font-semibold text-steel-900">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-steel-500">
                {step.text}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
