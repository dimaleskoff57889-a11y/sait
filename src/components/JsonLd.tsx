/**
 * Разметка schema.org для поисковиков (JSON-LD) — невидимый блок в странице.
 * «<» экранируем: иначе текст вида «</script>» внутри данных закрыл бы тег.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
