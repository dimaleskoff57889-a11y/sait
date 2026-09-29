import type { CSSProperties } from "react";

/**
 * Задержка появления при прокрутке (для data-reveal, см. RevealObserver и
 * globals.css). Нужна, чтобы карточки в ряду выплывали по очереди.
 */
export const revealDelay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;
