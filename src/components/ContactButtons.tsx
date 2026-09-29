import { Phone, MessageCircle, Send } from "lucide-react";
import { site, has } from "@/content/site";

/**
 * Связь только прямыми кнопками, БЕЗ формы заявки.
 * Форма = сбор персональных данных = политика обработки ПДн, согласие, 152-ФЗ.
 * Для визитки это лишняя юридическая нагрузка, а заявка ещё и рискует
 * умереть в почте, которую никто не проверяет.
 */
export function ContactButtons({ size = "md" }: { size?: "md" | "lg" }) {
  const { phoneDisplay, phoneRaw, whatsapp, telegram } = site.contacts;
  const pad = size === "lg" ? "px-6 py-3.5 text-base" : "px-5 py-3 text-sm";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`tel:${phoneRaw}`}
        className={`inline-flex items-center gap-2 rounded-xl bg-signal-500 font-semibold text-steel-950 transition hover:bg-signal-400 ${pad}`}
      >
        <Phone className="h-4.5 w-4.5" aria-hidden />
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

      {has(telegram) ? (
        <a
          href={`https://t.me/${telegram}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 rounded-xl bg-steel-800 font-semibold text-white transition hover:bg-steel-700 ${pad}`}
        >
          <Send className="h-4.5 w-4.5" aria-hidden />
          Telegram
        </a>
      ) : null}
    </div>
  );
}
