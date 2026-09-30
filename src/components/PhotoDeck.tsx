"use client";

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
} from "react";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";
import { DeckArt, type DeckArtKind } from "./DeckArt";

/**
 * Карточка стопки. Что показывается — по приоритету: фото (src) → логотипы
 * (logos) → рисунок-заглушка (art) → название крупным шрифтом (title) →
 * заглушка «фото появится здесь».
 */
export type DeckItem = {
  src?: string;
  /** Какую часть фото держать в кадре при обрезке (CSS object-position), например "center top" */
  focus?: string;
  caption?: string;
  /** Логотипы — на белой плашке по центру карточки, друг под другом */
  logos?: string[];
  /** Короткая метка на карточке с логотипом — например, вид работ */
  tag?: string;
  /** Рисунок-заглушка в стиле чертежа (DeckArt) — пока нет фото */
  art?: DeckArtKind;
  /** Название — если нет ни фото, ни логотипа */
  title?: string;
  /** Текст на заглушке вместо «фото появится здесь» */
  placeholder?: string;
};

/** Управление стопкой снаружи: например, показать нужное фото по клику на полоску */
export type DeckController = { show: (index: number) => void };

/** Сколько карточек видно в стопке под верхней */
const VISIBLE_DEPTH = 3;
/** Сдвиг и поворот карточек в стопке — уголки торчат в разные стороны, как у пачки напечатанных фото */
const SHIFT_X = [0, -12, 14, -6];
const TILT = [0, -6, 5, -2.5];
/** Насколько нужно сдвинуть фото, чтобы оно улетело, px */
const SWIPE_THRESHOLD = 70;
/** Длительность вылета карточки, мс */
const FLY_MS = 320;

/** Направление вылета — единичный вектор (x вправо, y вниз) */
type Direction = { x: number; y: number };
const RIGHT: Direction = { x: 1, y: 0 };

/**
 * Стопка фотографий. Верхнее фото смахивается пальцем или мышью в любую
 * сторону — вправо, влево, вверх, вниз или наискосок (а ещё кликом,
 * стрелками, клавишами ← →): улетает туда, куда его бросили, и
 * подкладывается в самый низ стопки, остальные поднимаются на шаг.
 *
 * onChange сообщает индекс верхнего фото — так в «Объектах» справа меняются
 * название и описание объекта. controllerRef позволяет показать нужное фото.
 *
 * ⚠️ Чтобы фото можно было смахнуть вверх/вниз на телефоне, у верхней
 * карточки touch-action: none — начать прокрутку страницы пальцем прямо
 * на фото нельзя, только рядом.
 *
 * Порядок хранится как массив индексов: order[0] — верхняя карточка.
 * Карточки не пересоздаются при перестановке (key = индекс фото), поэтому
 * CSS-переходы доигрывают движение до нового места в стопке.
 */
export function PhotoDeck({
  items,
  label = "Фотографии",
  tone = "light",
  captions = true,
  aspect = "aspect-[4/5]",
  onChange,
  controllerRef,
}: {
  items: DeckItem[];
  label?: string;
  /** Цвет стрелок и подписей под стопкой: на светлом или тёмном фоне */
  tone?: "light" | "dark";
  /** Подпись под фото (полоска как у полароида) */
  captions?: boolean;
  /**
   * Пропорции листа (класс Tailwind). В «О мастере» лист выше — под вертикальные
   * фото с телефона: снимок помещается целиком, от верха до пола, без обрезки
   */
  aspect?: string;
  onChange?: (index: number) => void;
  controllerRef?: Ref<DeckController>;
}) {
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [leaving, setLeaving] = useState<({ id: number } & Direction) | null>(
    null,
  );
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const reduced = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    return () => window.clearTimeout(timer.current);
  }, []);

  const current = order[0];
  // Сообщаем наверх, какое фото теперь сверху. Во время вылета — уже следующее,
  // чтобы текст рядом менялся одновременно с движением, а не после.
  const shown = leaving ? order[1] : current;
  useEffect(() => {
    onChange?.(shown);
  }, [shown, onChange]);

  useImperativeHandle(controllerRef, () => ({
    show(index: number) {
      if (index < 0 || index >= items.length) return;
      window.clearTimeout(timer.current);
      setLeaving(null);
      setDrag(null);
      // Стопка по кругу, начиная с нужного фото
      setOrder(items.map((_, i) => (index + i) % items.length));
    },
  }));

  const canFlip = items.length > 1 && !leaving;

  /** Верхнее фото улетает в направлении dir и уходит в конец стопки */
  function next(dir: Direction = RIGHT) {
    setDrag(null);
    if (!canFlip) return;
    if (reduced.current) {
      setOrder((o) => [...o.slice(1), o[0]]);
      return;
    }
    setLeaving({ id: order[0], ...dir });
    timer.current = window.setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]]);
      setLeaving(null);
    }, FLY_MS);
  }

  /** Нижнее фото возвращается наверх */
  function previous() {
    if (!canFlip) return;
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (leaving || items.length < 2) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointer.current = { x: e.clientX, y: e.clientY };
    setDrag({ dx: 0, dy: 0 });
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!pointer.current) return;
    setDrag({
      dx: e.clientX - pointer.current.x,
      dy: e.clientY - pointer.current.y,
    });
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!pointer.current) return;
    const dx = e.clientX - pointer.current.x;
    const dy = e.clientY - pointer.current.y;
    pointer.current = null;
    const distance = Math.hypot(dx, dy);
    if (distance >= SWIPE_THRESHOLD)
      next({ x: dx / distance, y: dy / distance });
    else if (distance < 6)
      next(RIGHT); // простой клик/тап — тоже листает
    else setDrag(null); // не дотянули — фото возвращается на место
  }

  function onPointerCancel() {
    pointer.current = null;
    setDrag(null);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next(RIGHT);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      previous();
    }
  }

  // Пока верхняя карточка улетает, остальные уже поднимаются на её место
  const stack = leaving ? order.filter((id) => id !== leaving.id) : order;

  function cardStyle(id: number) {
    if (leaving?.id === id) {
      return {
        transform: `translate(${leaving.x * 135}%, ${leaving.y * 135}%) rotate(${leaving.x * 16 + leaving.y * 6}deg)`,
        transition: `transform ${FLY_MS}ms cubic-bezier(0.4, 0, 0.9, 0.5)`,
        zIndex: 60,
        opacity: 1,
      };
    }
    const depth = stack.indexOf(id);
    if (depth === 0 && drag) {
      return {
        transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(${drag.dx / 14}deg)`,
        transition: "none",
        zIndex: 50,
        opacity: 1,
      };
    }
    const level = Math.min(depth, VISIBLE_DEPTH);
    return {
      transform: `translate(${SHIFT_X[level]}px, ${level * 10}px) scale(${1 - level * 0.04}) rotate(${TILT[level]}deg)`,
      transition:
        "transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms ease",
      zIndex: 50 - depth,
      opacity: depth > VISIBLE_DEPTH ? 0 : 1,
    };
  }

  if (items.length === 0) return null;

  const dark = tone === "dark";
  const arrowClass = `flex h-10 w-10 items-center justify-center rounded-full border transition ${
    dark
      ? "border-steel-600 text-steel-300 hover:border-signal-500 hover:text-signal-400"
      : "border-steel-200 text-steel-600 hover:border-signal-500 hover:text-signal-600"
  }`;

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div
        role="group"
        aria-roledescription="стопка фотографий"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        // isolate — свой контекст наложения: z-index карточек (50–60) действует только
        // внутри стопки и не перекрывает шапку сайта (у неё z-50).
        // z-10 — а сама стопка выше соседнего текста: смахнутое фото летит поверх
        // описания объекта, а не под ним (но ниже шапки и «пульта лифта»)
        className={`relative isolate z-10 ${aspect} w-full rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-signal-500 focus-visible:ring-offset-4`}
      >
        {items.map((item, id) => {
          const isTop = id === current && !leaving;
          return (
            <div
              key={id}
              aria-hidden={!isTop}
              style={cardStyle(id)}
              onPointerDown={isTop ? onPointerDown : undefined}
              onPointerMove={isTop ? onPointerMove : undefined}
              onPointerUp={isTop ? onPointerUp : undefined}
              onPointerCancel={isTop ? onPointerCancel : undefined}
              // Без белой рамки: фото/логотип/рисунок занимает весь лист. С подписью
              // лист делится на две части, как карточки «Узнайте свой подъёмник»:
              // сверху изображение, снизу тёмная полоса с подписью, между ними перелив
              className={`absolute inset-0 flex flex-col overflow-hidden rounded-2xl bg-steel-500 shadow-xl ring-1 shadow-steel-950/20 ring-steel-200 select-none will-change-transform ${
                isTop ? "cursor-grab touch-none active:cursor-grabbing" : ""
              }`}
            >
              <div className="relative min-h-0 flex-1 overflow-hidden">
                {item.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt={item.caption ?? ""}
                    draggable={false}
                    className="h-full w-full object-cover"
                    style={
                      item.focus ? { objectPosition: item.focus } : undefined
                    }
                  />
                ) : item.logos && item.logos.length > 0 ? (
                  <LogoCard
                    logos={item.logos}
                    alt={item.caption ?? ""}
                    number={id + 1}
                    total={items.length}
                  />
                ) : item.art ? (
                  <DeckArt kind={item.art} />
                ) : item.title ? (
                  <TitleCard title={item.title} />
                ) : (
                  <Placeholder index={id} text={item.placeholder} />
                )}
              </div>
              {captions ? (
                // Подпись — под фото, а не на нём: фото кончается ровно по границе,
                // граница — тонкая светящаяся линия, ниже мягкая синяя полоса
                <div className="relative bg-steel-500">
                  <span
                    aria-hidden
                    className="deck-divider absolute inset-x-0 top-0 h-[3px]"
                  />
                  <p className="truncate px-4 pt-4 pb-3.5 text-center font-display text-sm font-extrabold text-white">
                    {item.caption}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {items.length > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={previous}
            aria-label="Предыдущее фото"
            className={arrowClass}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </button>
          <p
            aria-live="polite"
            className={`min-w-14 text-center text-sm tabular-nums ${dark ? "text-steel-400" : "text-steel-500"}`}
          >
            {shown + 1} / {items.length}
          </p>
          <button
            type="button"
            onClick={() => next(RIGHT)}
            aria-label="Следующее фото"
            className={arrowClass}
          >
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Карточка с логотипом: логотип лежит прямо на светлой «миллиметровке» в рамке
 * из уголков-засечек, как на чертеже; номер объекта сверху, бегущая сигнальная
 * лента снизу. Вид работ здесь не пишем — он и так справа от стопки.
 * Логотипы должны быть на прозрачном фоне (у «Москворецкого» белый фон убран).
 */
function LogoCard({
  logos,
  alt,
  number,
  total,
}: {
  logos: string[];
  alt: string;
  number: number;
  total: number;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const corner = "absolute h-5 w-5 border-steel-400";
  return (
    <div
      className="relative flex h-full w-full flex-col bg-steel-50"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgb(125 146 168 / 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgb(125 146 168 / 0.14) 1px, transparent 1px)",
        backgroundSize: "18px 18px",
      }}
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <span className="text-xs font-bold tracking-widest text-steel-400 tabular-nums">
          {pad(number)} / {pad(total)}
        </span>
        <span aria-hidden className="h-2 w-2 rotate-45 bg-signal-500" />
      </div>

      <div className="flex flex-1 items-center justify-center px-3 py-3">
        <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 py-8">
          <span
            aria-hidden
            className={`${corner} top-0 left-0 border-t-2 border-l-2`}
          />
          <span
            aria-hidden
            className={`${corner} top-0 right-0 border-t-2 border-r-2`}
          />
          <span
            aria-hidden
            className={`${corner} bottom-0 left-0 border-b-2 border-l-2`}
          />
          <span
            aria-hidden
            className={`${corner} right-0 bottom-0 border-r-2 border-b-2`}
          />
          {logos.map((logo, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={logo}
              src={logo}
              alt={i === 0 ? alt : ""}
              draggable={false}
              // Высота задана жёстко: у некоторых SVG «родной» размер крошечный (значок
              // «Лужников» — 16×16), а широкие логотипы ужмёт max-w-full + object-contain
              className={`w-auto max-w-full object-contain ${logos.length > 1 ? "h-16" : "h-40"}`}
            />
          ))}
        </div>
      </div>

      <div aria-hidden className="hazard-march h-2 w-full" />
    </div>
  );
}

/** Название крупным шрифтом — когда нет ни фото, ни логотипа */
function TitleCard({ title }: { title: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-white to-steel-100 px-8 text-center">
      <span aria-hidden className="h-1 w-10 rounded-full bg-signal-500" />
      <span className="text-xl leading-snug font-bold text-steel-800">
        {title}
      </span>
    </div>
  );
}

/** Заглушка на месте будущего фото: разные тона, чтобы стопка читалась */
function Placeholder({ index, text }: { index: number; text?: string }) {
  const dark = index % 2 === 0;
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center ${
        dark
          ? "bg-gradient-to-br from-steel-800 to-steel-950 text-steel-300"
          : "bg-gradient-to-br from-steel-100 to-steel-200 text-steel-500"
      }`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
          dark
            ? "bg-signal-500/15 text-signal-400"
            : "bg-white/70 text-steel-600"
        }`}
      >
        <Camera className="h-7 w-7" aria-hidden />
      </div>
      <span className="text-xs font-semibold tracking-widest uppercase">
        {text ?? "фото появится здесь"}
      </span>
    </div>
  );
}
