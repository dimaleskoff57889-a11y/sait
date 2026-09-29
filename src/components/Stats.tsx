import { site } from "@/content/site";
import { CountUp } from "./CountUp";
import { revealDelay } from "./reveal";

export function Stats() {
  const items = site.stats.filter((s) => s.value.trim() !== "");
  if (items.length === 0) return null;

  return (
    <div className="border-b border-steel-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 px-4 py-8 sm:grid-cols-3 sm:gap-8 sm:px-6 sm:py-10">
        {items.map((s, i) => (
          <div key={s.label} data-reveal style={revealDelay(i * 100)}>
            <div className="text-3xl font-bold tracking-tight text-steel-900">
              {s.countUp ? <CountUp value={s.value} /> : s.value}
            </div>
            <div className="mt-1 text-sm text-steel-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
