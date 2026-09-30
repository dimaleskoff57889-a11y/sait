import { site } from "@/content/site";
import { CountUp } from "./CountUp";
import { revealDelay } from "./reveal";

export function Stats() {
  const items = site.stats.filter((s) => s.value.trim() !== "");
  if (items.length === 0) return null;

  return (
    <div className="border-b border-steel-200 bg-white">
      {/* На телефоне: первая цифра по центру во всю ширину, две другие — рядом
          под ней; с sm — все три в ряд, как раньше */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-4 gap-y-5 px-4 py-8 text-center sm:grid-cols-3 sm:gap-8 sm:px-6 sm:py-10 sm:text-left">
        {items.map((s, i) => (
          <div
            key={s.label}
            data-reveal
            style={revealDelay(i * 100)}
            className={
              i === 0 && items.length % 2 === 1
                ? "col-span-2 sm:col-span-1"
                : undefined
            }
          >
            <div className="font-display text-3xl font-extrabold text-steel-900">
              {s.countUp ? <CountUp value={s.value} /> : s.value}
            </div>
            <div className="mt-1 text-sm text-steel-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
