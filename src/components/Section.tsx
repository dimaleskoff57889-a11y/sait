export function Section({
  id,
  title,
  lead,
  dark = false,
  muted = false,
  children,
}: {
  id?: string;
  title?: string;
  lead?: string;
  dark?: boolean;
  /** Светло-серый фон — чтобы соседние белые блоки не сливались в один */
  muted?: boolean;
  children: React.ReactNode;
}) {
  const tone = dark
    ? "bg-steel-900 text-steel-100"
    : muted
      ? "bg-steel-50 text-steel-900"
      : "bg-white text-steel-900";

  return (
    <section id={id} className={`scroll-mt-16 ${tone}`}>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        {title ? (
          <div data-reveal className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
            {lead ? (
              <p className={`mt-3 text-base ${dark ? "text-steel-300" : "text-steel-500"}`}>
                {lead}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
