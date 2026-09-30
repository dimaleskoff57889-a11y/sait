import type { CSSProperties } from "react";
import { FileSignature, Phone, Ruler, ShieldCheck, Wrench } from "lucide-react";

/**
 * Сцена рядом с «Как работаю»: подъёмник собирается по этапам вместе с волной
 * (идея владельца 30.09). stage — тот же, что у волны в ProcessWave:
 *  −1 — пусто (сброс перед новым кругом);
 *   0 «Звонок» — переписка заказчика с мастером, по две реплики (CHAT);
 *   1 «Объём и стоимость» — пунктирный контур будущего подъёмника и замер
 *     с цифрами (MEASURE): двухэтажный шахтный, как в переписке;
 *   2 «Договор» — в договоре по очереди отмечаются работы, сроки, стоимость и
 *     оплата, потом расписываются заказчик и мастер;
 *   3 «Работы» — сборка по порядку: стойки, балка, раскосы, направляющие,
 *     таль, кабина по направляющим, пульт;
 *   4 «Гарантия» — пробный ход кабины вверх-вниз, после него с размаху падает
 *     печать «Гарантия · 1 год», сцена вздрагивает от удара;
 *   5 (N) — готово: лампа на пульте и печать зелёные.
 * Слева — плитки этапов: загораются по мере хода волны, текущая покачивается.
 *
 * Вся анимация — CSS-переходы по атрибуту data-on (см. .scene-* в
 * globals.css): элемент включается, когда волна дошла до своего этапа,
 * задержки внутри «Работ» задают порядок сборки. На сброс всё гаснет разом.
 *
 * Координаты чертежа — viewBox 200×250, земля y=232.
 */

const TILES = [Phone, Ruler, FileSignature, Wrench, ShieldCheck];

/**
 * Переписка на этапе «Звонок»: белые — заказчик, оранжевые — мастер.
 * Реплики — иллюстрация, а не обещание: без сроков и цен.
 */
const CHAT = [
  { master: false, text: "Здравствуйте! На складе встал грузовой подъёмник." },
  { master: true, text: "Здравствуйте! Какой подъёмник, сколько этажей?" },
  { master: false, text: "Шахтный, на два этажа." },
  { master: true, text: "Приеду, посмотрю на месте и оценю." },
];

/**
 * Цифры замера — правдоподобные для двухэтажного шахтного грузового
 * подъёмника с талью на 2 т (как на фото из «О мастере»): общая высота
 * конструкции с талью, отметка второго этажа, ширина шахты. Иллюстрация,
 * а не реальный объект. Чертёж: 198 единиц высоты ≈ 5,8 м.
 */
const MEASURE = {
  height: "5,8 м",
  floor: "3,6 м",
  width: "2,2 м",
  load: "до 2 т",
};
/** y отметки второго этажа: 232 − 3,6 / 5,8 × 198 */
const FLOOR_Y = 109;

/** Пункты договора — как в тексте этапа «Договор» */
const CONTRACT = ["Работы", "Сроки", "Стоимость", "Оплата"];

const C = {
  frame: "#3a4b5d", // steel-700
  panel: "#475d73", // steel-600
  line: "#5c748c", // steel-500
  soft: "#a8b8c8", // steel-300
  pale: "#cdd7e0", // steel-200
  signal: "#f59e0b",
  green: "#10b981",
};

/** Задержка появления детали при сборке, мс */
const d = (ms: number) => ({ "--scene-d": `${ms}ms` }) as CSSProperties;

export function AssemblyScene({
  stage,
  className = "",
}: {
  stage: number;
  className?: string;
}) {
  const on = (k: number) => (stage >= k ? "" : undefined);
  // Контур и размеры — только на замере
  const planning = stage === 1 ? "" : undefined;
  const testing = stage === 4;
  // Земля — с замера и дальше; на переписке и договоре фон однотонный
  const ground = stage === 1 || stage >= 3 ? "" : undefined;
  const done = stage >= 5;

  return (
    <div
      aria-hidden
      className={`relative mx-auto flex w-full max-w-[300px] gap-4 rounded-2xl border border-steel-200 bg-steel-50 p-4 ${className}`}
    >
      {/* Плитки этапов */}
      <div className="flex flex-col justify-between gap-1.5">
        {TILES.map((Icon, k) => {
          const active = stage === k;
          return (
            <div
              key={k}
              data-on={on(k)}
              className={`scene-tile flex h-10 w-10 items-center justify-center rounded-xl ${
                active
                  ? "bg-signal-500 text-steel-950"
                  : "bg-steel-900 text-signal-400"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "scene-wiggle" : ""}`} />
            </div>
          );
        })}
      </div>

      {/* Чертёж подъёмника; переписка «Звонка» и печать гарантии — поверх него.
          На гарантии сцена вздрагивает от удара печати (.scene-shake) */}
      <div
        className={`relative min-w-0 flex-1 ${testing ? "scene-shake" : ""}`}
      >
        <svg viewBox="0 0 200 250" className="block h-auto w-full">
          <defs>
            <pattern
              id="scene-hatch"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke={C.soft}
                strokeWidth="1.2"
              />
            </pattern>
            <clipPath id="scene-below-beam">
              <rect x="0" y="34" width="200" height="216" />
            </clipPath>
          </defs>

          {/* Земля */}
          <g data-on={ground} className="scene-fade">
            <rect
              x="0"
              y="232"
              width="200"
              height="12"
              fill="url(#scene-hatch)"
            />
            <path d="M0 232H200" stroke={C.line} strokeWidth="1.5" />
          </g>

          {/* 01 — пунктирный контур будущего подъёмника */}
          <rect
            data-on={planning}
            className="scene-fade"
            x="40"
            y="34"
            width="120"
            height="198"
            rx="2"
            fill="none"
            stroke={C.soft}
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />

          {/* 02 — размеры: высота и ширина со стрелками-засечками */}
          <g data-on={planning} stroke={C.signal} strokeWidth="1.5" fill="none">
            <path className="scene-draw" pathLength={1} d="M178 34V232" />
            <path
              className="scene-draw"
              pathLength={1}
              d="M172 34H184M172 232H184"
              style={d(150)}
            />
            <path
              className="scene-draw"
              pathLength={1}
              d="M40 20H160"
              style={d(300)}
            />
            <path
              className="scene-draw"
              pathLength={1}
              d="M40 14V26M160 14V26"
              style={d(450)}
            />
            {/* Отметка второго этажа: перекрытие слева и пунктир внутри контура */}
            <path
              className="scene-draw"
              pathLength={1}
              d={`M2 ${FLOOR_Y}H40`}
              style={d(700)}
            />
            <path
              d={`M40 ${FLOOR_Y}H160`}
              className="scene-fade"
              style={d(800)}
              strokeDasharray="3 4"
              strokeOpacity="0.7"
            />
          </g>
          {/* Цифры замера */}
          <g data-on={planning} fill={C.signal} fontSize="10" fontWeight="700">
            {/* Поворот — на обёртке: у .scene-fade свой CSS-transform, он затёр бы атрибут */}
            <g transform="rotate(-90 192 133)">
              <text
                className="scene-fade"
                style={d(500)}
                x="192"
                y="133"
                textAnchor="middle"
              >
                {MEASURE.height}
              </text>
            </g>
            <text
              className="scene-fade"
              style={d(700)}
              x="100"
              y="11"
              textAnchor="middle"
            >
              {MEASURE.width}
            </text>
            <text className="scene-fade" style={d(950)} x="3" y={FLOOR_Y - 5}>
              {MEASURE.floor}
            </text>
            <text
              className="scene-fade"
              style={d(1200)}
              x="100"
              y="178"
              textAnchor="middle"
              fontSize="13"
              fontWeight="800"
              fill={C.line}
            >
              {MEASURE.load}
            </text>
          </g>

          {/* 03 — договор: пункты отмечаются по очереди, потом две подписи */}
          <g data-on={stage === 2 ? "" : undefined} className="scene-pop">
            <rect
              x="30"
              y="22"
              width="140"
              height="202"
              rx="5"
              fill="#fff"
              stroke={C.line}
              strokeWidth="1.5"
            />
            <text
              x="100"
              y="48"
              textAnchor="middle"
              fontSize="13"
              fontWeight="800"
              fill={C.frame}
            >
              Договор
            </text>
            {CONTRACT.map((item, k) => {
              const y = 76 + k * 24;
              return (
                <g key={item}>
                  <text x="44" y={y} fontSize="11" fill={C.panel}>
                    {item}
                  </text>
                  <path
                    d={`M44 ${y + 7}H156`}
                    stroke={C.pale}
                    strokeWidth="1"
                  />
                  <path
                    className="scene-draw"
                    pathLength={1}
                    style={d(300 + k * 450)}
                    d={`M143 ${y - 4}l4 4 8-9`}
                    fill="none"
                    stroke={C.signal}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              );
            })}
            {/* Подписи сторон */}
            <path d="M42 196H94M106 196H158" stroke={C.soft} strokeWidth="1" />
            <text
              x="68"
              y="210"
              textAnchor="middle"
              fontSize="8.5"
              fill={C.soft}
            >
              Заказчик
            </text>
            <text
              x="132"
              y="210"
              textAnchor="middle"
              fontSize="8.5"
              fill={C.soft}
            >
              Мастер
            </text>
            <path
              className="scene-draw"
              pathLength={1}
              style={d(2200)}
              d="M46 190c5-9 9-9 10-2s5 7 9-1 7-7 9 0 5 5 12-4"
              fill="none"
              stroke={C.frame}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              className="scene-draw"
              pathLength={1}
              style={d(2800)}
              d="M110 192c3-10 8-12 9-4s2 8 7 0 6-9 8-2 4 6 13-3"
              fill="none"
              stroke={C.signal}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>

          {/* 04 — сборка. Стойки растут от земли */}
          <g data-on={on(3)}>
            <rect
              className="scene-grow-y"
              x="40"
              y="40"
              width="7"
              height="192"
              fill={C.frame}
            />
            <rect
              className="scene-grow-y"
              x="153"
              y="40"
              width="7"
              height="192"
              fill={C.frame}
            />
            {/* Верхняя балка */}
            <rect
              className="scene-grow-x"
              style={d(300)}
              x="34"
              y="34"
              width="132"
              height="8"
              fill={C.frame}
            />
            {/* Раскосы, как на фото */}
            <path
              className="scene-draw"
              pathLength={1}
              style={d(500)}
              d="M47 42L100 92L153 42M47 92L100 42L153 92"
              fill="none"
              stroke={C.panel}
              strokeWidth="2"
            />
            {/* Направляющие */}
            <path
              className="scene-draw"
              pathLength={1}
              style={d(700)}
              d="M60 42V232M140 42V232"
              fill="none"
              stroke={C.soft}
              strokeWidth="2.5"
            />
            {/* Таль на балке */}
            <g className="scene-drop" style={d(900)}>
              <rect x="72" y="14" width="56" height="20" rx="4" fill={C.line} />
              {[80, 88, 96, 104, 112, 120].map((x) => (
                <path
                  key={x}
                  d={`M${x} 17V31`}
                  stroke={C.pale}
                  strokeWidth="1.5"
                />
              ))}
              <rect
                x="128"
                y="17"
                width="10"
                height="14"
                rx="2"
                fill={C.frame}
              />
            </g>
            {/* Кабина съезжает по направляющим сверху; трос уходит вверх и срезается у балки */}
            <g clipPath="url(#scene-below-beam)">
              <g
                className={`scene-cabin ${testing ? "is-testing" : ""}`}
                style={d(1150)}
              >
                <path d="M100 148V-120" stroke={C.line} strokeWidth="1.5" />
                <rect
                  x="94"
                  y="140"
                  width="12"
                  height="8"
                  rx="2"
                  fill={C.signal}
                />
                <rect
                  x="54"
                  y="148"
                  width="92"
                  height="84"
                  rx="2"
                  fill={C.frame}
                />
                <rect x="60" y="154" width="39" height="72" fill={C.panel} />
                <rect x="101" y="154" width="39" height="72" fill={C.panel} />
                <path
                  d="M95 184V196M105 184V196"
                  stroke={C.pale}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
            </g>
            {/* Пульт вызова на стойке: лампа горит во время пробного хода, зелёная — готово */}
            <g className="scene-fade" style={d(1500)}>
              <rect
                x="163"
                y="176"
                width="12"
                height="26"
                rx="2"
                fill="#fff"
                stroke={C.line}
                strokeWidth="1.2"
              />
              <circle
                cx="169"
                cy="184"
                r="3"
                fill={done ? C.green : testing ? C.signal : C.pale}
                className="transition-[fill] duration-300"
              />
              <circle cx="169" cy="194" r="2.5" fill={C.soft} />
            </g>
          </g>
        </svg>

        {/* 05 — печать «Гарантия · 1 год»: падает после пробного хода кабины */}
        <div
          data-on={on(4)}
          className="pointer-events-none absolute inset-0 flex items-center justify-center pt-[30%]"
        >
          <div
            style={d(1900)}
            className={`scene-stamp rounded-lg border-[3px] border-current bg-white/90 px-3 py-1.5 text-center font-extrabold uppercase ${
              done ? "text-emerald-500" : "text-signal-600"
            }`}
          >
            <span className="block text-[9px] tracking-[0.25em]">Гарантия</span>
            <span className="block font-display text-xl leading-tight normal-case">
              1 год
            </span>
          </div>
        </div>

        {/* 01 — переписка: реплики выскакивают по очереди, как в мессенджере */}
        <div
          data-on={stage === 0 ? "" : undefined}
          className="absolute inset-0 flex flex-col justify-center gap-2"
        >
          {CHAT.map((line, k) => (
            <p
              key={k}
              style={d(200 + k * 1000)}
              className={`scene-bubble max-w-[86%] rounded-2xl px-2.5 py-1.5 text-[11px] leading-snug shadow-sm ${
                line.master
                  ? "origin-bottom-right self-end rounded-br-md bg-signal-500 text-steel-950"
                  : "origin-bottom-left self-start rounded-bl-md bg-white text-steel-800 ring-1 ring-steel-200"
              }`}
            >
              {line.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
