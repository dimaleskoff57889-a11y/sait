import { MapPin, Mail, Clock } from "lucide-react";
import { site, has } from "@/content/site";
import { ContactButtons } from "./ContactButtons";

export function Contacts() {
  return (
    <section id="contacts" className="scroll-mt-16 bg-steel-900 text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        {/* На широком экране кнопки связи — в одну линию с заголовком, справа;
            на узком — под подзаголовком */}
        <div
          data-reveal
          className="grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-x-10"
        >
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl lg:col-start-1 lg:row-start-1">
            Связаться
          </h2>
          <p className="mt-3 max-w-xl text-base text-steel-300 lg:col-start-1 lg:row-start-2">
            Опишите задачу — отвечу, сориентирую по срокам и стоимости.
          </p>

          <div className="mt-8 lg:col-start-2 lg:row-start-1 lg:mt-0 lg:justify-self-end">
            <ContactButtons size="lg" />
          </div>
        </div>

        <dl className="mt-10 grid grid-cols-1 gap-6 border-t border-steel-800 pt-8 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <MapPin
              className="mt-0.5 h-5 w-5 shrink-0 text-signal-500"
              aria-hidden
            />
            <div>
              <dt className="text-sm font-semibold text-white">
                {site.geo.main}
              </dt>
              <dd className="mt-1 text-sm text-steel-400">{site.geo.extra}</dd>
            </div>
          </div>

          {has(site.contacts.hours) ? (
            <div className="flex items-start gap-3">
              <Clock
                className="mt-0.5 h-5 w-5 shrink-0 text-signal-500"
                aria-hidden
              />
              <div>
                <dt className="text-sm font-semibold text-white">
                  Время звонка
                </dt>
                <dd className="mt-1 text-sm text-steel-400">
                  {site.contacts.hours.charAt(0).toUpperCase() +
                    site.contacts.hours.slice(1)}
                </dd>
              </div>
            </div>
          ) : null}

          {has(site.contacts.email) ? (
            <div className="flex items-start gap-3">
              <Mail
                className="mt-0.5 h-5 w-5 shrink-0 text-signal-500"
                aria-hidden
              />
              <div>
                <dt className="text-sm font-semibold text-white">Почта</dt>
                <dd className="mt-1 text-sm text-steel-400">
                  <a
                    href={`mailto:${site.contacts.email}`}
                    className="hover:text-white"
                  >
                    {site.contacts.email}
                  </a>
                </dd>
              </div>
            </div>
          ) : null}
        </dl>
      </div>
    </section>
  );
}
