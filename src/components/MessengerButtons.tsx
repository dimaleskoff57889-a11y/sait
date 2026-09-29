"use client";

import { useEffect, useRef, useState } from "react";
import { MaxIcon, TelegramPlane } from "./MessengerIcons";

/**
 * Круглые кнопки мессенджеров справа от номера.
 *
 * Telegram: ника нет — ссылка на чат по номеру (t.me/+7…). Сработает, если в
 * Telegram у папы разрешено находить его по номеру (Конфиденциальность →
 * Номер телефона → «Кто может найти меня по номеру» → «Все»). Появится ник —
 * вписать в site.contacts.telegram, ссылка переключится сама.
 * Самолётик периодически «улетает» и возвращается (.tg-fly в globals.css).
 *
 * MAX: пока нет ссылки на профиль — кнопка копирует номер и подсказывает
 * найти папу в MAX по нему. Появится ссылка — вписать в site.contacts.max.
 * Значок — MaxIcon (нарисован по иконке приложения, см. MessengerIcons.tsx),
 * от кнопки расходятся пульсирующие кольца (.max-pulse).
 */
export function MessengerButtons({
  phoneRaw,
  phoneDisplay,
  telegram,
  max,
  size,
}: {
  phoneRaw: string;
  phoneDisplay: string;
  telegram: string;
  max: string;
  size: "md" | "lg";
}) {
  const [hint, setHint] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const box = size === "lg" ? "h-[52px] w-[52px]" : "h-11 w-11";
  const telegramUrl = telegram.trim() ? `https://t.me/${telegram.trim()}` : `https://t.me/${phoneRaw}`;

  async function copyForMax() {
    let copied = false;
    try {
      await navigator.clipboard.writeText(phoneRaw);
      copied = true;
    } catch {
      // Нет доступа к буферу обмена — просто показываем номер
    }
    setHint(copied ? "Номер скопирован — найдите меня в MAX" : `Найдите меня в MAX: ${phoneDisplay}`);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHint(null), 3000);
  }

  const maxInner = (
    <>
      <span aria-hidden className="max-pulse absolute inset-0 rounded-xl border-2 border-[#7a5cff]/70" />
      <span aria-hidden className="max-pulse max-pulse-2 absolute inset-0 rounded-xl border-2 border-[#7a5cff]/70" />
      <MaxIcon className="relative h-full w-full" />
    </>
  );
  const maxClass = `relative flex ${box} items-center justify-center rounded-xl transition hover:-translate-y-0.5`;

  return (
    <div className="flex items-center gap-3">
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Написать в Telegram"
        title="Написать в Telegram"
        className={`flex ${box} items-center justify-center overflow-hidden rounded-xl bg-[#229ED9] text-white transition hover:-translate-y-0.5 hover:bg-[#1b8cc2]`}
      >
        <TelegramPlane className="tg-fly h-6 w-6 -translate-x-px" />
      </a>

      <div className="relative">
        {max.trim() ? (
          <a
            href={max.trim()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Написать в MAX"
            title="Написать в MAX"
            className={maxClass}
          >
            {maxInner}
          </a>
        ) : (
          <button
            type="button"
            onClick={copyForMax}
            aria-label="Написать в MAX: скопировать номер"
            title="Скопировать номер для MAX"
            className={maxClass}
          >
            {maxInner}
          </button>
        )}
        <span
          role="status"
          className={`pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 rounded-lg bg-steel-950 px-3 py-2 text-xs whitespace-nowrap text-white shadow-lg ring-1 ring-steel-700 transition-opacity ${
            hint ? "opacity-100" : "opacity-0"
          }`}
        >
          {hint}
        </span>
      </div>
    </div>
  );
}
