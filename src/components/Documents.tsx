import { ShieldCheck, FileCheck2 } from "lucide-react";
import { site, has } from "@/content/site";
import { Section } from "./Section";

export function Documents() {
  if (!has(site.documents) && !site.insurance) return null;

  return (
    <Section
      id="documents"
      title="Допуски и документы"
      lead="Работаю официально, по договору. Документы предоставляю по запросу."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {site.documents.map((d) => (
          <div
            key={d.title}
            className="rounded-2xl border border-steel-200 bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-steel-100">
                <FileCheck2 className="h-5 w-5 text-steel-600" aria-hidden />
              </div>
              <h3 className="min-w-0 flex-1 text-sm font-semibold text-steel-900">
                {d.title}
              </h3>
            </div>
            {d.issuer ? (
              <p className="mt-2 text-sm text-steel-500">{d.issuer}</p>
            ) : null}
          </div>
        ))}

        {site.insurance ? (
          <div className="rounded-2xl border border-steel-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-steel-100">
                <ShieldCheck className="h-5 w-5 text-steel-600" aria-hidden />
              </div>
              <h3 className="min-w-0 flex-1 text-sm font-semibold text-steel-900">
                Страхование ответственности
              </h3>
            </div>
            <p className="mt-2 text-sm text-steel-500">
              Ответственность перед заказчиком застрахована.
            </p>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
