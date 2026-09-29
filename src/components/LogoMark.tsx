/**
 * Знак сайта — вариант «Шахта», выбран владельцем 29.09: шахта (скруглённая
 * рамка), стрелка вверх и оранжевая платформа. Рамка и стрелка берут цвет
 * из currentColor, платформа всегда сигнальная.
 *
 * Если ссылка-обёртка с классом group, при наведении платформа
 * поднимается (.logo-platform в globals.css) — как лифт.
 *
 * Тот же знак нарисован в src/app/icon.svg (иконка вкладки) и в
 * src/app/og.png/route.tsx (превью ссылки) — меняя форму, поправить и там.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect x="12" y="9" width="40" height="46" rx="5" fill="none" stroke="currentColor" strokeWidth="4.5" />
      <path d="M32 17l-8 9h16z" fill="currentColor" />
      <rect className="logo-platform" x="21" y="36" width="22" height="7" rx="1.5" fill="#f59e0b" />
    </svg>
  );
}
