import { site } from "@/content/site";

export function Stats() {
  const items = site.stats.filter((s) => s.value.trim() !== "");
  if (items.length === 0) return null;

  return (
    <div className="border-b border-steel-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        {items.map((s) => (
          <div key={s.label}>
            <div className="text-3xl font-bold tracking-tight text-steel-900">{s.value}</div>
            <div className="mt-1 text-sm text-steel-500">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
