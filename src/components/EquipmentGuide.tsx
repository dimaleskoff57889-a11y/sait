import { site, has, type Equipment } from "@/content/site";
import { revealDelay } from "./reveal";
import { Section } from "./Section";

/**
 * «Узнайте свой подъёмник»: три вида оборудования чертежами в манере шахты
 * выше, чтобы заказчик узнал своё по картинке, даже если не знает названия.
 *
 * Анимация (globals.css, .eq-*): когда карточка появляется при прокрутке,
 * кабина или платформа один раз поднимается и опускается — чтобы и на
 * телефоне было видно, как это работает; при наведении — поднимается и ждёт.
 *
 * Отдельный раздел сразу после «Что делаю» (просьба владельца 30.09).
 *
 * Координаты в единицах viewBox 160×120: земля — y=104, верхний этаж — y=58.
 */
export function EquipmentSection() {
  if (!has(site.equipment)) return null;

  return (
    <Section
      id="equipment"
      title="Узнайте свой подъёмник"
      lead="Работаю с тремя видами грузовых подъёмников. Не знаете, как называется ваш, — найдите его по картинке."
      centered
    >
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {site.equipment.map((item, i) => (
          // Обёртка выплывает при прокрутке, карточка внутри реагирует на наведение
          <li key={item.kind} data-reveal style={revealDelay(i * 120)}>
            {/* Карточка из двух частей: сверху чертёж на белом во всю ширину, снизу
                текст на тёмно-синем; между ними плавный перелив (.eq-fade). На телефоне
                части стоят рядом — перелив идёт слева направо. */}
            <div className="group flex h-full overflow-hidden rounded-2xl border border-steel-200 bg-steel-900 transition-colors duration-300 hover:border-signal-400 sm:flex-col">
              <div className="flex w-24 shrink-0 items-center bg-white min-[375px]:w-28 sm:w-full">
                <Drawing kind={item.kind} label={item.full} />
              </div>
              <div
                aria-hidden
                className="eq-fade w-6 shrink-0 sm:h-14 sm:w-full"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center py-4 pr-3 pl-1 sm:px-5 sm:pt-0 sm:pb-5">
                <h3 className="font-display text-[15px] font-extrabold text-white hyphens-auto min-[375px]:text-base sm:text-lg">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-snug text-steel-300">
                  {item.hint}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

const C = {
  line: "#5c748c", // steel-500
  soft: "#a8b8c8", // steel-300
  pale: "#cdd7e0", // steel-200
  frame: "#3a4b5d", // steel-700
  deep: "#1d2734", // steel-900
  signal: "#f59e0b", // signal-500
  rod: "#7d92a8", // steel-400 — шток цилиндра, металл
};

function Drawing({ kind, label }: { kind: Equipment["kind"]; label: string }) {
  const hatch = `eq-hatch-${kind}`;
  const hazard = `eq-hazard-${kind}`;
  return (
    <svg
      viewBox="0 0 160 120"
      className="block h-auto w-full"
      role="img"
      aria-label={label}
    >
      <defs>
        <pattern
          id={hatch}
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke={C.soft} strokeWidth="1.2" />
        </pattern>
        <pattern
          id={hazard}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="8" height="8" fill={C.deep} />
          <rect width="4" height="8" fill={C.signal} />
        </pattern>
      </defs>

      {/* Земля */}
      <rect x="6" y="104" width="148" height="9" fill={`url(#${hatch})`} />
      <path d="M6 104H154" stroke={C.line} strokeWidth="1.5" />

      {kind === "shaft" ? (
        <Shaft hatch={hatch} hazard={hazard} clip={`eq-clip-${kind}`} />
      ) : null}
      {kind === "wall" ? <Wall hatch={hatch} hazard={hazard} /> : null}
      {kind === "hydraulic" ? <Hydraulic hazard={hazard} /> : null}
    </svg>
  );
}

type Fills = { hatch: string; hazard: string };

/** Шахтный: закрытая шахта сквозь перекрытие, привод сверху, кабина на тросе */
function Shaft({ hatch, hazard, clip }: Fills & { clip: string }) {
  return (
    <g>
      {/* Перекрытие второго этажа по обе стороны шахты */}
      {[8, 100].map((x) => (
        <g key={x}>
          <rect x={x} y="58" width="52" height="6" fill={`url(#${hatch})`} />
          <path d={`M${x} 58h52`} stroke={C.line} strokeWidth="1.5" />
        </g>
      ))}
      {/* Сетчатое ограждение шахты — как в шахте раздела «Что делаю» */}
      <pattern
        id={`${clip}-mesh`}
        width="6"
        height="8"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M0 4L3 0L6 4L3 8Z"
          fill="none"
          stroke={C.soft}
          strokeWidth="0.7"
        />
      </pattern>
      <rect x="64" y="14" width="32" height="90" fill={`url(#${clip}-mesh)`} />
      {/* Стены шахты и привод */}
      <rect
        x="60"
        y="14"
        width="4"
        height="90"
        fill={C.pale}
        stroke={C.line}
        strokeWidth="1.2"
      />
      <rect
        x="96"
        y="14"
        width="4"
        height="90"
        fill={C.pale}
        stroke={C.line}
        strokeWidth="1.2"
      />
      <rect
        x="56"
        y="8"
        width="48"
        height="6"
        fill={C.pale}
        stroke={C.line}
        strokeWidth="1.2"
      />
      <circle
        cx="80"
        cy="20"
        r="5"
        fill="#fff"
        stroke={C.line}
        strokeWidth="1.5"
      />
      {/* Трос уходит вверх от кабины и срезается у барабана — укорачивается, когда кабина едет вверх */}
      <clipPath id={clip}>
        <rect x="0" y="25" width="160" height="95" />
      </clipPath>
      {/* Кабина: стоит внизу, поднимается на второй этаж */}
      <g clipPath={`url(#${clip})`}>
        <g className="eq-move">
          <path d="M80 80V-60" stroke={C.line} strokeWidth="1.2" />
          <rect
            x="67"
            y="80"
            width="26"
            height="20"
            fill="#fff"
            stroke={C.frame}
            strokeWidth="2"
          />
          <rect
            x="71"
            y="88"
            width="10"
            height="12"
            fill={C.pale}
            stroke={C.line}
            strokeWidth="1.2"
          />
          <rect x="66" y="100" width="28" height="4" fill={`url(#${hazard})`} />
        </g>
      </g>
    </g>
  );
}

/** Пристеночный: стена здания с проёмом на втором этаже, направляющая на стене, платформа с ограждением */
function Wall({ hatch, hazard }: Fills) {
  return (
    <g>
      {/* Стена с проёмом и перекрытие внутри здания */}
      <rect
        x="100"
        y="10"
        width="10"
        height="26"
        fill={`url(#${hatch})`}
        stroke={C.line}
        strokeWidth="1.2"
      />
      <rect
        x="100"
        y="58"
        width="10"
        height="46"
        fill={`url(#${hatch})`}
        stroke={C.line}
        strokeWidth="1.2"
      />
      <rect x="110" y="58" width="44" height="6" fill={`url(#${hatch})`} />
      <path d="M100 58h54" stroke={C.line} strokeWidth="1.5" />
      {/* Направляющая с кронштейнами */}
      <rect x="93" y="12" width="4" height="92" fill={C.soft} />
      {[22, 66, 90].map((y) => (
        <rect key={y} x="97" y={y} width="3" height="4" fill={C.line} />
      ))}
      {/* Платформа: стоит у земли, поднимается к проёму */}
      <g className="eq-move">
        <rect x="87" y="76" width="7" height="28" fill={C.frame} />
        <path
          d="M46 98V80H87M46 89H87"
          fill="none"
          stroke={C.line}
          strokeWidth="1.8"
        />
        <rect
          x="56"
          y="84"
          width="18"
          height="14"
          fill="#fff"
          stroke={C.line}
          strokeWidth="1.2"
        />
        <rect x="44" y="98" width="46" height="6" fill={`url(#${hazard})`} />
      </g>
    </g>
  );
}

/** Гидравлический: ножничная платформа, её раздвигает гидроцилиндр */
function Hydraulic({ hazard }: { hazard: string }) {
  const arm = {
    stroke: C.line,
    strokeWidth: 3,
    vectorEffect: "non-scaling-stroke",
  } as const;
  return (
    <g>
      <rect x="34" y="98" width="92" height="6" fill={C.frame} />
      {/* Кронштейн цилиндра на раме */}
      <path d="M50 98L56 91L62 98Z" fill={C.frame} />
      {/* Ножницы и гидроцилиндр раздвигаются от основания. Цилиндр закреплён
          обоими концами: внизу — на раме, вверху — в шарнире ножниц; шток
          выдвигается и распирает ножницы. */}
      <g className="eq-arms">
        <path
          d="M40 98L120 74M40 74L120 98M40 74L120 50M40 50L120 74"
          fill="none"
          {...arm}
        />
        {/* Корпус цилиндра и шток */}
        <path
          d="M56 93L70.4 74.4"
          stroke={C.frame}
          strokeWidth="7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M70.4 74.4L80 62"
          stroke={C.rod}
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />
        {/* Шарниры: концы цилиндра, перекрестья и стыки ножниц */}
        {[
          [56, 93],
          [80, 62],
          [80, 86],
          [40, 74],
          [120, 74],
        ].map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="2.6"
            fill="#fff"
            stroke={C.frame}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      {/* Платформа с грузом */}
      <g className="eq-lift">
        <rect
          x="64"
          y="28"
          width="24"
          height="16"
          fill="#fff"
          stroke={C.line}
          strokeWidth="1.2"
        />
        <rect x="30" y="44" width="100" height="6" fill={`url(#${hazard})`} />
      </g>
    </g>
  );
}
