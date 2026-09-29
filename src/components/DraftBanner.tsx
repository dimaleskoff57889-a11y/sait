import { AlertTriangle } from "lucide-react";
import { site } from "@/content/site";

/**
 * Полоса «черновик». Существует ради одного конкретного сценария:
 * сайт уже живёт по ссылке, папа радуется и отправляет её заказчику —
 * а там пока выдуманный телефон и выдуманные услуги.
 * Снимается переключением site.draft в false.
 */
export function DraftBanner() {
  if (!site.draft) return null;

  return (
    <div className="hazard-stripe">
      <div className="bg-steel-950/85">
        <p className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2 text-xs font-semibold text-signal-300 sm:px-6">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          Черновик. Тексты, телефон и услуги на странице — временные, не настоящие.
        </p>
      </div>
    </div>
  );
}
