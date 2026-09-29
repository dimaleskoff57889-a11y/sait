import { Phone, MessageCircle } from "lucide-react";
import { site, has } from "@/content/site";
import { MessengerButtons } from "./MessengerButtons";

/**
 * Связь только прямыми кнопками (телефон, WhatsApp, Telegram, MAX), БЕЗ формы заявки.
 * Форма = сбор персональных данных = политика обработки ПДн, согласие, 152-ФЗ.
 * Для визитки это лишняя юридическая нагрузка, а заявка ещё и рискует
 * умереть в почте, которую никто не проверяет.
 */
export function ContactButtons({ size = "md" }: { size?: "md" | "lg" }) {
  const { phoneDisplay, phoneRaw, whatsapp, telegram, max } = site.contacts;
  const pad = size === "lg" ? "px-6 py-3.5 text-base" : "px-5 py-3 text-sm";
  // Крупная кнопка — главный призыв: трубка периодически «звонит», вокруг расходится волна
  const lively = size === "lg";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`tel:${phoneRaw}`}
        className={`inline-flex items-center gap-2 rounded-xl bg-signal-500 font-semibold text-steel-950 transition hover:-translate-y-0.5 hover:bg-signal-400 ${pad} ${lively ? "cta-ping" : ""}`}
      >
        <Phone className={`h-4.5 w-4.5 ${lively ? "phone-ring" : ""}`} aria-hidden />
        {phoneDisplay}
      </a>

      {has(whatsapp) ? (
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 rounded-xl bg-steel-800 font-semibold text-white transition hover:bg-steel-700 ${pad}`}
        >
          <MessageCircle className="h-4.5 w-4.5" aria-hidden />
          WhatsApp
        </a>
      ) : null}

      <MessengerButtons
        phoneRaw={phoneRaw}
        phoneDisplay={phoneDisplay}
        telegram={telegram}
        max={max}
        size={size}
      />

      {has(site.contacts.messengersNote) ? (
        <p className="basis-full text-sm text-steel-400">{site.contacts.messengersNote}</p>
      ) : null}
    </div>
  );
}
