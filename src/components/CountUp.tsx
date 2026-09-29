"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Число «набегает» от нуля, когда попадает на экран: "500+" → 0+ … 500+.
 * Без JS и при prefers-reduced-motion сразу показывает итоговое значение.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState(value);

  useEffect(() => {
    const match = value.match(/^(\D*)(\d+)(.*)$/);
    const el = ref.current;
    if (!match || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const [, prefix, digits, suffix] = match;
    const target = Number(digits);
    let frame = 0;

    const run = () => {
      const started = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setText(`${prefix}${Math.round(target * eased)}${suffix}`);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    setText(`${prefix}0${suffix}`);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.6 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {text}
    </span>
  );
}
