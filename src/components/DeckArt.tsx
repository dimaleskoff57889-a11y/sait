/**
 * Заглушки-рисунки для стопки «О мастере», пока нет настоящих фото:
 * светлая «миллиметровка» и штриховой рисунок в духе чертежа с первого экрана.
 * Светлые — чтобы перелив в тёмную полосу с подписью был виден (30.09).
 * Каждый рисунок — под свою подпись (см. PLACEHOLDERS в About.tsx).
 */

export type DeckArtKind = "brigade" | "lift" | "install" | "cabinet";

const C = {
  line: "#5c748c", // steel-500
  dim: "#a8b8c8", // steel-300
  fill: "#fff",
  deep: "#1d2734", // steel-900
  signal: "#f59e0b", // signal-500
};

/** Сетка-миллиметровка фоном — CSS, чтобы не плодить одинаковые id паттернов */
const gridStyle = {
  backgroundColor: "#f4f6f8", // steel-50
  backgroundImage:
    "linear-gradient(to right, rgb(125 146 168 / 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgb(125 146 168 / 0.14) 1px, transparent 1px)",
  backgroundSize: "16px 16px",
};

/** Область рисунка по каждому виду — без пустых полей, чтобы рисунок был крупнее */
const VIEW_BOX: Record<DeckArtKind, string> = {
  brigade: "6 70 188 150",
  lift: "30 26 150 200",
  install: "18 30 164 190",
  cabinet: "40 22 124 206",
};

export function DeckArt({ kind }: { kind: DeckArtKind }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={gridStyle}
    >
      <svg viewBox={VIEW_BOX[kind]} className="h-full w-full p-5" aria-hidden>
        {kind === "brigade" ? <Brigade /> : null}
        {kind === "lift" ? <Lift /> : null}
        {kind === "install" ? <Install /> : null}
        {kind === "cabinet" ? <Cabinet /> : null}
      </svg>
    </div>
  );
}

/** Бригада: три каски, передняя — сигнальная */
function Brigade() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {/* Задние каски — контуром */}
      {[52, 148].map((cx) => (
        <g key={cx} fill="none" stroke={C.line} strokeWidth="3">
          <path d={`M${cx - 30} 128a30 30 0 0 1 60 0`} />
          <path d={`M${cx - 38} 128h76`} />
          <path d={`M${cx} 98v-6`} />
        </g>
      ))}
      {/* Передняя каска */}
      <path d="M60 170a40 40 0 0 1 80 0z" fill={C.signal} />
      <rect x="48" y="166" width="104" height="10" rx="5" fill={C.signal} />
      <path d="M100 130v36" stroke={C.deep} strokeWidth="5" />
      <path
        d="M76 150q24-12 48 0"
        fill="none"
        stroke={C.deep}
        strokeWidth="3"
        opacity="0.45"
      />
      {/* Земля */}
      <path
        d="M30 200h140"
        stroke={C.dim}
        strokeWidth="2"
        strokeDasharray="6 6"
      />
    </g>
  );
}

/** Готовый подъёмник: шахта, направляющие, платформа с грузом, стрелка хода */
function Lift() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect
        x="58"
        y="34"
        width="84"
        height="178"
        rx="3"
        stroke={C.line}
        strokeWidth="3"
      />
      <path d="M58 58h84" stroke={C.line} strokeWidth="3" />
      <rect
        x="84"
        y="42"
        width="32"
        height="10"
        rx="2"
        stroke={C.line}
        strokeWidth="2.5"
      />
      <path d="M70 58v154M130 58v154" stroke={C.dim} strokeWidth="2.5" />
      <path d="M100 58v62" stroke={C.line} strokeWidth="2" />
      {/* Платформа с коробками */}
      <rect
        x="84"
        y="102"
        width="20"
        height="18"
        stroke={C.line}
        strokeWidth="2.5"
      />
      <rect
        x="104"
        y="108"
        width="16"
        height="12"
        stroke={C.line}
        strokeWidth="2.5"
      />
      <rect x="64" y="120" width="72" height="8" rx="1.5" fill={C.signal} />
      {/* Стрелка хода */}
      <path d="M162 150V88" stroke={C.signal} strokeWidth="3" />
      <path d="M154 98l8-12 8 12" stroke={C.signal} strokeWidth="3" />
      <path
        d="M40 212h120"
        stroke={C.dim}
        strokeWidth="2"
        strokeDasharray="6 6"
      />
    </g>
  );
}

/** Монтаж: балка, таль на цепи, на крюке поднимают секцию шахты */
function Install() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Балка-двутавр */}
      <path
        d="M26 40h148M26 52h148M100 40v12"
        stroke={C.line}
        strokeWidth="3"
      />
      <rect
        x="86"
        y="52"
        width="28"
        height="12"
        rx="2"
        stroke={C.line}
        strokeWidth="2.5"
      />
      {/* Цепь */}
      <path
        d="M100 64v44"
        stroke={C.line}
        strokeWidth="2.5"
        strokeDasharray="4 3"
      />
      {/* Крюк */}
      <path
        d="M100 108v10a10 10 0 1 1-10 10"
        stroke={C.signal}
        strokeWidth="4"
      />
      {/* Стропы и секция шахты */}
      <path d="M92 130l-22 26M108 130l22 26" stroke={C.dim} strokeWidth="2" />
      <rect
        x="64"
        y="156"
        width="72"
        height="56"
        stroke={C.line}
        strokeWidth="3"
      />
      <path d="M64 156l72 56M136 156l-72 56" stroke={C.dim} strokeWidth="2" />
      {/* Разводной ключ */}
      <g transform="translate(34 196) rotate(-40)">
        <rect x="-4" y="0" width="8" height="30" rx="3" fill={C.signal} />
        <path d="M-9 -2a9 9 0 1 1 18 0l-4 3h-10z" fill={C.signal} />
      </g>
    </g>
  );
}

/** Шкаф управления: дверца, лампы (одна мигает во время «хода»), кнопки, кабель */
function Cabinet() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <rect
        x="52"
        y="30"
        width="96"
        height="164"
        rx="6"
        fill={C.fill}
        stroke={C.line}
        strokeWidth="3"
      />
      <path d="M100 30v164" stroke={C.dim} strokeWidth="2" />
      {/* Экранчик и лампы */}
      <rect
        x="62"
        y="44"
        width="30"
        height="18"
        rx="2"
        fill="none"
        stroke={C.line}
        strokeWidth="2"
      />
      <path d="M67 53h8" stroke={C.signal} strokeWidth="2.5" />
      <circle
        cx="116"
        cy="50"
        r="5"
        fill="none"
        stroke={C.line}
        strokeWidth="2"
      />
      <circle className="lift-led" cx="132" cy="50" r="5" fill={C.signal} />
      {/* Кнопки */}
      <circle
        cx="116"
        cy="76"
        r="6"
        fill="none"
        stroke={C.line}
        strokeWidth="2"
      />
      <circle
        cx="132"
        cy="76"
        r="6"
        fill="none"
        stroke={C.line}
        strokeWidth="2"
      />
      {/* Решётка вентиляции */}
      {[150, 158, 166, 174].map((y) => (
        <path
          key={y}
          d={`M62 ${y}h28M110 ${y}h28`}
          stroke={C.dim}
          strokeWidth="2"
        />
      ))}
      {/* Ручка */}
      <rect x="104" y="104" width="5" height="22" rx="2" fill={C.line} />
      {/* Кабель вниз */}
      <path
        d="M100 194v18q0 10 10 10h40"
        fill="none"
        stroke={C.signal}
        strokeWidth="3"
      />
    </g>
  );
}
