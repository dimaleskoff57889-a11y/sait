import { AlertTriangle } from "lucide-react";
import { site } from "@/content/site";

/**
 * Полоса «черновик». Существует ради одного конкретного сценария:
 * сайт уже живёт по ссылке, папа радуется и отправляет её заказчику —
 * а там ещё нет реквизитов, фото и согласованной политики.
 * Снимается переключением site.draft в false.
 */
export function DraftBanner() {
  if (!site.draft) return null;

  return (
    <div className="hazard-stripe">
      <div className="bg-steel-950/85">
        <p className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2 text-xs font-semibold text-signal-300 sm:px-6">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          Черновик: сайт ещё дорабатывается — не отправляйте ссылку заказчикам.
        </p>
      </div>
    </div>
  );
}
