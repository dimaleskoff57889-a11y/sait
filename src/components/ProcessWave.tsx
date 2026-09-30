"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
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
/** Сколько цикл ждёт после свайпа карусели на телефоне, мс */
const READ_MS = 6000;
/** Через сколько после ухода курсора цикл продолжится, мс */
const RESUME_MS = 900;

/** Линия в своих координатах: вдоль — 0…100, горб вверх от базовой линии (viewBox 100×30) */
const H = { base: 20, amp: 18 }; // ряд: viewBox 100×30, горб вверх
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

function wavePath(c: number) {
  let d = "";
  for (let k = 0; k <= SAMPLES; k++) {
    const x = (k / SAMPLES) * 100;
    const y = H.base - H.amp * bend(x, c);
    d += `${k === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

const FLAT_H = `M0 ${H.base}L100 ${H.base}`;
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
 * без перерисовки React. Волна — только на широком экране (шаги в ряд). На
 * телефоне вместо неё карусель карточек (StepsCarousel): листается свайпом и
 * сама — в такт циклу; свайп ставит цикл на паузу (READ_MS) и продолжает его
 * с выбранного этапа (владелец, 30.09).
 */
export function ProcessWave({ steps }: { steps: Step[] }) {
  // В id градиента годятся только буквы, цифры, «-» и «_» (useId даёт и другие знаки)
  const uid = `pw${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(-1);
  const [wave, setWave] = useState<Wave | null>(null);
  const last = steps.length - 1;

  /** Путь и точки раздела цвета у бегущей волны, по линиям */
  const wavePaths = useRef<(SVGPathElement | null)[][]>([]);
  const waveStops = useRef<(SVGStopElement | null)[][]>([]);
  /** Наведение курсора — функции живут в эффекте, где идёт цикл */
  const hover = useRef<{
    enter: (i: number) => void;
    /** Сразу показать этап i (свайп карусели на телефоне) */
    jump: (i: number) => void;
    /** Продолжить цикл через ms с текущего этапа */
    leave: (ms?: number) => void;
  } | null>(null);

  /** Без анимаций (prefers-reduced-motion) сцена сразу показывает готовый подъёмник */
  const [still, setStill] = useState(false);

  // Цикл волны и реакция на курсор
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
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
      jump: (i) => {
        window.clearTimeout(timer);
        window.clearTimeout(waveTimer);
        current = i;
        setStage(i);
        setWave(null);
      },
      leave: (ms = RESUME_MS) => {
        if (!running) return;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          // С этапа под курсором волна идёт дальше — к следующему
          if (current >= 0 && current < last) {
            setWave({ line: current, ms: WAVE_MS });
            schedule(WAVE_MS);
          } else schedule(0);
        }, ms);
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
    observer.observe(root);

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
      [0].forEach((o) => {
        wavePaths.current[wave.line]?.[o]?.setAttribute("d", wavePath(c));
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
    // Широкий экран: этапы в ряд с волной, сцена сборки под ними (ноутбук) или
    // справа (большой экран). Телефон: волны нет — карточки этапов листаются
    // свайпом, под ними сцена того этапа, что открыт в карточке
    <div
      ref={rootRef}
      className="grid grid-cols-1 gap-6 lg:gap-10 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-center"
    >
      <ol className="hidden gap-6 lg:grid lg:grid-cols-5">
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
              {/* Линия до следующего этапа (список виден только на широком экране) */}
              {i < last
                ? [0].map((o) => {
                    const gradient = `${uid}-${i}-${o}`;
                    // Обёртка задаёт размер линии от номера до номера. Сам svg с left+right
                    // не растянулся бы: у svg своя ширина по viewBox (~100px), и
                    // браузер берёт её, игнорируя right, — линия не доходила до этапа
                    return (
                      <div
                        key={o}
                        aria-hidden
                        className="step-line absolute top-0 -right-6 left-12 h-[30px]"
                      >
                        <svg
                          viewBox="0 0 100 30"
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
                                  x2="100"
                                  y2="0"
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
                                d={FLAT_H}
                                fill="none"
                                stroke={`url(#${gradient})`}
                                strokeWidth="2"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                              />
                            </>
                          ) : (
                            <path
                              d={FLAT_H}
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
              </div>
            </li>
          );
        })}
      </ol>
      <StepsCarousel
        steps={steps}
        stage={stage}
        onPick={(i) => {
          hover.current?.jump(i);
          // Дать прочитать выбранный этап, потом цикл пойдёт дальше с него
          hover.current?.leave(READ_MS);
        }}
      />
      <AssemblyScene stage={still ? last + 1 : stage} />
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

/**
 * Карусель этапов для телефона: одна карточка на экран, свайп влево-вправо
 * (обычная прокрутка с привязкой — scroll-snap, без своих жестов). Сама
 * перелистывается к этапу, до которого дошёл цикл; когда листают руками,
 * после остановки сообщает выбранный этап (onPick). Программная прокрутка
 * останавливается на том же этапе — поэтому ложного onPick нет.
 */
function StepsCarousel({
  steps,
  stage,
  onPick,
}: {
  steps: Step[];
  stage: number;
  onPick: (i: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const last = steps.length - 1;
  const shown = Math.min(Math.max(stage, 0), last);
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const pickRef = useRef(onPick);
  pickRef.current = onPick;

  // Цикл дошёл до этапа — перелистнуть к нему
  useEffect(() => {
    const track = trackRef.current;
    const card = track?.children[shown] as HTMLElement | undefined;
    if (!track || !card) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    track.scrollTo({
      left: card.offsetLeft,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [shown]);

  // Листают руками — после остановки: какая карточка ближе всего к началу
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let settle: number | undefined;
    const onScroll = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        const cards = Array.from(track.children) as HTMLElement[];
        let best = 0;
        cards.forEach((c, i) => {
          if (
            Math.abs(c.offsetLeft - track.scrollLeft) <
            Math.abs(cards[best].offsetLeft - track.scrollLeft)
          )
            best = i;
        });
        if (best !== shownRef.current) pickRef.current(best);
      }, 140);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
    };
  }, []);

  const pick = (i: number) => {
    const card = trackRef.current?.children[i] as HTMLElement | undefined;
    if (card)
      trackRef.current?.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    onPick(i);
  };

  return (
    <div className="lg:hidden">
      <div
        ref={trackRef}
        className="no-scrollbar relative flex snap-x snap-mandatory gap-3 overflow-x-auto"
        aria-label="Этапы работы"
      >
        {steps.map((step, i) => (
          <article
            key={step.title}
            aria-current={i === shown ? "step" : undefined}
            className="flex w-full shrink-0 snap-start flex-col"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-colors duration-300 ${
                  stage >= i
                    ? "bg-signal-500 text-steel-950"
                    : "bg-steel-900 text-signal-400"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-xs font-semibold tracking-widest text-steel-500 tabular-nums">
                {i + 1} / {steps.length}
              </span>
              {/* «Готово!» — в строке с номером, а не под текстом: иначе под неё
                  оставалось место во всех карточках и точки уезжали вниз */}
              {i === last ? (
                <DoneBadge
                  show={stage > last}
                  className="relative ml-auto flex"
                />
              ) : (
                // Стрелка-подсказка «листай дальше» — только украшение, листают свайпом
                <span
                  aria-hidden
                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-steel-200 text-signal-500"
                >
                  <ArrowRight className="swipe-hint h-4 w-4" />
                </span>
              )}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-steel-900">
              {step.title}
            </h3>
            <p className="mt-1.5 text-base leading-relaxed text-steel-500">
              {step.text}
            </p>
          </article>
        ))}
      </div>

      {/* Точки: какой этап открыт; нажатие — перейти к нему */}
      <div className="mt-3 flex justify-center gap-2">
        {steps.map((step, i) => (
          <button
            key={step.title}
            type="button"
            onClick={() => pick(i)}
            aria-label={`Этап ${i + 1}: ${step.title}`}
            aria-current={i === shown ? "step" : undefined}
            className="flex h-6 items-center"
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                i === shown ? "w-8 bg-signal-500" : "w-4 bg-steel-200"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
