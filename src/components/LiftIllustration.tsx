/**
 * Схема грузового шахтного подъёмника в стиле чертежа — для первого экрана,
 * пока нет фото с объектов.
 *
 * Анимация (классы в globals.css):
 *  - при загрузке чертёж «прорисовывается»: линии .lift-draw тянутся,
 *    детали .lift-fade проявляются по очереди (задержка — CSS-переменная --d);
 *  - через 2,2 с платформа начинает ходить между этажами (.lift-cabin),
 *    лампа на шкафу управления горит во время хода (.lift-led).
 * При prefers-reduced-motion всё сразу нарисовано и стоит на месте.
 *
 * Координаты в единицах viewBox 420×520:
 *   пол 1 этажа — y=466, перекрытие 2 этажа — y=246, ход платформы — 220.
 */

import type { CSSProperties } from "react";

const C = {
  line: "#7d92a8", // steel-400
  bright: "#a8b8c8", // steel-300
  dim: "#5c748c", // steel-500
  fill: "#2b3746", // steel-800
  deep: "#1d2734", // steel-900
  signal: "#f59e0b", // signal-500
};

const label = {
  fill: C.line,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.1em",
} as const;

/** Задержка появления слоя, мс */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Линия, которая «прорисовывается»: path, а не line — pathLength у path поддерживают все браузеры */
function DrawPath({
  path,
  delay,
  stroke = C.line,
  width = 1.5,
  dash,
}: {
  path: string;
  delay: number;
  stroke?: string;
  width?: number;
  dash?: boolean;
}) {
  if (dash) {
    // Пунктир нельзя совместить с прорисовкой через dasharray — просто проявляем
    return (
      <path
        d={path}
        className="lift-fade"
        style={d(delay)}
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeDasharray="3 3"
      />
    );
  }
  return (
    <path
      d={path}
      pathLength={1}
      className="lift-draw"
      style={d(delay)}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
    />
  );
}

export function LiftIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 520"
      className={className}
      role="img"
      aria-label="Схема грузового шахтного подъёмника: шахта, направляющие, привод, шкаф управления и платформа с грузом"
    >
      <defs>
        <pattern id="lift-mesh" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M8 0H0V8" fill="none" stroke={C.dim} strokeOpacity="0.28" strokeWidth="0.6" />
        </pattern>
        <pattern
          id="lift-hatch"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="7" stroke={C.dim} strokeOpacity="0.7" strokeWidth="1.2" />
        </pattern>
        <pattern
          id="lift-hazard"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <rect width="12" height="12" fill={C.deep} />
          <rect width="6" height="12" fill={C.signal} />
        </pattern>
        {/* Трос виден только ниже барабана — выше его срезает этот клип */}
        <clipPath id="lift-below-drum">
          <rect x="0" y="87" width="420" height="433" />
        </clipPath>
      </defs>

      {/* 1. Перекрытие 2 этажа и пол 1 этажа */}
      <g className="lift-fade" style={d(150)}>
        <rect x="0" y="246" width="130" height="14" fill="url(#lift-hatch)" />
        <rect x="290" y="246" width="130" height="14" fill="url(#lift-hatch)" />
        <rect x="0" y="466" width="420" height="18" fill="url(#lift-hatch)" />
        <text x="16" y="236" {...label}>2 ЭТАЖ</text>
        <text x="16" y="456" {...label}>1 ЭТАЖ</text>
      </g>
      <DrawPath path="M0 466H420" delay={0} />
      <DrawPath path="M0 246H130" delay={100} />
      <DrawPath path="M420 246H290" delay={100} />

      {/* 2. Шахта: сетчатое ограждение, стойки, верхняя балка, связи */}
      <g className="lift-fade" style={d(350)}>
        <rect x="138" y="42" width="144" height="424" fill="url(#lift-mesh)" />
        <rect x="130" y="34" width="8" height="432" fill={C.fill} stroke={C.line} strokeWidth="1.2" />
        <rect x="282" y="34" width="8" height="432" fill={C.fill} stroke={C.line} strokeWidth="1.2" />
        <rect x="130" y="34" width="160" height="8" fill={C.fill} stroke={C.line} strokeWidth="1.2" />
      </g>
      {[110, 180, 320, 390].map((y, i) => (
        <DrawPath
          key={y}
          path={`M138 ${y}H282`}
          delay={550 + i * 60}
          stroke={C.dim}
          width={1}
        />
      ))}

      {/* 3. Направляющие с кронштейнами */}
      <g className="lift-fade" style={d(700)}>
        <rect x="150" y="96" width="4" height="370" fill={C.bright} fillOpacity="0.85" />
        <rect x="266" y="96" width="4" height="370" fill={C.bright} fillOpacity="0.85" />
        {[130, 200, 270, 340, 410].map((y) => (
          <g key={y} fill={C.line}>
            <rect x="138" y={y} width="12" height="3" />
            <rect x="270" y={y} width="12" height="3" />
          </g>
        ))}
      </g>

      {/* 4. Привод: рама, двигатель с рёбрами, редуктор, барабан */}
      <g className="lift-fade" style={d(900)}>
        <rect x="138" y="90" width="144" height="6" fill={C.fill} stroke={C.line} />
        <rect x="152" y="58" width="34" height="30" rx="3" fill={C.fill} stroke={C.bright} strokeWidth="1.2" />
        {[158, 164, 170, 176, 182].map((x) => (
          <line key={x} x1={x} y1="62" x2={x} y2="84" stroke={C.line} strokeOpacity="0.8" />
        ))}
        <rect x="186" y="64" width="11" height="20" fill={C.fill} stroke={C.bright} strokeWidth="1.2" />
        <circle cx="211" cy="74" r="13" fill={C.fill} stroke={C.bright} strokeWidth="1.2" />
        <circle cx="211" cy="74" r="4" fill={C.line} />
        <line x1="197" y1="74" x2="186" y2="74" stroke={C.bright} strokeWidth="1.2" />
      </g>

      {/* 5. Шкаф управления — электрическая часть, с лампой хода */}
      <g className="lift-fade" style={d(1050)}>
        <rect x="234" y="52" width="32" height="38" rx="2" fill={C.fill} stroke={C.bright} strokeWidth="1.2" />
        <line x1="240" y1="62" x2="260" y2="62" stroke={C.line} />
        <line x1="240" y1="68" x2="254" y2="68" stroke={C.line} />
        <circle className="lift-led" cx="258" cy="82" r="3" fill={C.signal} />
      </g>

      {/* 6. Платформа с грузом. Внешняя группа держит клип троса неподвижным
          и проявляется, внутренняя — ездит. */}
      <g clipPath="url(#lift-below-drum)" className="lift-fade" style={d(1250)}>
        <g className="lift-cabin">
          {/* Тросы от барабана к траверсе */}
          <line x1="208" y1="-80" x2="208" y2="356" stroke={C.bright} strokeWidth="1.4" />
          <line x1="214" y1="-80" x2="214" y2="356" stroke={C.bright} strokeWidth="1.4" />
          <rect x="204" y="354" width="14" height="8" fill={C.fill} stroke={C.bright} />

          {/* Каркас: траверса, стойки, башмаки на направляющих */}
          <rect x="164" y="370" width="92" height="86" fill={C.deep} fillOpacity="0.88" />
          <rect x="158" y="362" width="104" height="8" fill={C.fill} stroke={C.bright} strokeWidth="1.2" />
          <rect x="158" y="370" width="6" height="86" fill={C.fill} stroke={C.bright} />
          <rect x="256" y="370" width="6" height="86" fill={C.fill} stroke={C.bright} />
          {[366, 446].map((y) => (
            <g key={y} fill={C.bright}>
              <rect x="154" y={y} width="4" height="10" />
              <rect x="262" y={y} width="4" height="10" />
            </g>
          ))}

          {/* Груз на поддоне */}
          <rect x="174" y="444" width="72" height="4" fill={C.line} />
          {[178, 205, 232].map((x) => (
            <rect key={x} x={x} y="448" width="10" height="8" fill={C.line} fillOpacity="0.7" />
          ))}
          <rect x="178" y="410" width="32" height="34" fill={C.fill} stroke={C.bright} />
          <line x1="194" y1="410" x2="194" y2="424" stroke={C.line} />
          <rect x="212" y="416" width="30" height="28" fill={C.fill} stroke={C.bright} />
          <line x1="227" y1="416" x2="227" y2="428" stroke={C.line} />
          <rect x="186" y="380" width="36" height="30" fill={C.fill} stroke={C.bright} />
          <line x1="204" y1="380" x2="204" y2="392" stroke={C.line} />

          {/* Пол платформы — сигнальная штриховка */}
          <rect x="156" y="456" width="108" height="10" fill="url(#lift-hazard)" />
          <rect x="156" y="456" width="108" height="10" fill="none" stroke={C.signal} />
        </g>
      </g>

      {/* 7. Выноски: подписи слева выровнены по краю шахты, как на чертеже */}
      <g className="lift-fade" style={d(1450)}>
        <text x="118" y="70" textAnchor="end" {...label}>ПРИВОД</text>
        <circle cx="150" cy="72" r="2" fill={C.line} />
        <text x="298" y="62" {...label}>ШКАФ</text>
        <text x="298" y="75" {...label}>УПРАВЛЕНИЯ</text>
        <text x="118" y="196" textAnchor="end" {...label}>НАПРАВЛЯЮЩИЕ</text>
        <circle cx="148" cy="196" r="2" fill={C.line} />
      </g>
      <DrawPath path="M124 66L150 72" delay={1400} stroke={C.dim} width={1} />
      <DrawPath path="M296 66L268 70" delay={1400} stroke={C.dim} width={1} />
      <DrawPath path="M124 192L148 196" delay={1400} stroke={C.dim} width={1} />

      {/* 8. Размер: ход платформы между этажами */}
      <DrawPath path="M292 246H340" delay={1600} stroke={C.dim} width={1} dash />
      <DrawPath path="M292 466H340" delay={1600} stroke={C.dim} width={1} dash />
      <DrawPath path="M330 460V252" delay={1650} stroke={C.signal} />
      <g className="lift-fade" style={d(1950)}>
        <path d="M330 247l-4 8h8z" fill={C.signal} />
        <path d="M330 465l-4-8h8z" fill={C.signal} />
        <text x="0" y="0" transform="translate(348 356) rotate(-90)" textAnchor="middle" {...label}>
          ХОД ПЛАТФОРМЫ
        </text>
      </g>
    </svg>
  );
}
