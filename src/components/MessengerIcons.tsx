"use client";

import { useId } from "react";

/**
 * Значки мессенджеров для кнопок у номера.
 *
 * MAX — нарисован по скриншоту иконки приложения (29.09): градиентный
 * квадрат от синего к фиолетовому и белое «облачко» чата. Это не
 * официальный файл: если появится оригинальная иконка из пресс-кита MAX —
 * заменить этот компонент картинкой.
 *
 * Telegram — белый бумажный самолётик (свой контур, не из чужого набора
 * иконок), фон кнопки — фирменный синий Telegram.
 */

export function MaxIcon({ className = "" }: { className?: string }) {
  // useId — чтобы градиенты двух кнопок (первый экран и «Связаться») не делили один id
  const gradient = `max-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f7bff" />
          <stop offset="0.55" stopColor="#6552ff" />
          <stop offset="1" stopColor="#a547f5" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill={`url(#${gradient})`} />
      {/* Облачко чата: толстое кольцо с хвостиком внизу слева */}
      <path
        d="M24 12.5c6.6 0 11.5 4.9 11.5 11.5S30.6 35.5 24 35.5c-2 0-3.9-.5-5.6-1.4L12.5 36l1.7-5.6A11.4 11.4 0 0 1 12.5 24c0-6.6 4.9-11.5 11.5-11.5z"
        fill="none"
        stroke="#fff"
        strokeWidth="4.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TelegramPlane({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M2.6 11.2 20.4 4.3c.8-.3 1.5.2 1.3 1.2l-3 14.2c-.2 1-.8 1.2-1.6.8l-4.6-3.4-2.2 2.1c-.3.3-.5.4-.9.4l.3-4.7 8.5-7.7c.4-.3-.1-.5-.6-.2L7.1 13.2l-4.5-1.4c-1-.3-1-1 0-1.6z" fill="currentColor" />
    </svg>
  );
}
