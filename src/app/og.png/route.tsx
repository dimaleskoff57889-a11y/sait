import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/**
 * Картинка-превью ссылки (1200×630) для Telegram, MAX, WhatsApp и соцсетей.
 * Собирается один раз при сборке и лежит в out/og.png. Тексты берутся из
 * site.ts, поэтому после правки контента превью обновится само.
 *
 * В мета-теги превью попадает только когда заполнен site.url: мессенджерам
 * нужен абсолютный адрес картинки (см. layout.tsx).
 */
export const dynamic = "force-static";

const fontDir = join(process.cwd(), "node_modules/@fontsource/golos-text/files");

async function font(subset: "cyrillic" | "latin", weight: 400 | 700) {
  return readFile(join(fontDir, `golos-text-${subset}-${weight}-normal.woff`));
}

export async function GET() {
  const [since, objects, warranty] = site.stats;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1d2734",
          // Цифры и знаки лежат в латинском наборе шрифта, буквы — в кириллическом.
          // Два имени со списком, иначе цифры брались из шрифта не той толщины.
          fontFamily: "GolosLatin, GolosCyrillic",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", padding: "56px 72px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* Знак «Шахта» — тот же, что в LogoMark.tsx */}
            <svg width="60" height="60" viewBox="0 0 64 64">
              <rect x="12" y="9" width="40" height="46" rx="5" fill="none" stroke="#cdd7e0" strokeWidth="4.5" />
              <path d="M32 17l-8 9h16z" fill="#cdd7e0" />
              <rect x="21" y="36" width="22" height="7" rx="1.5" fill="#f59e0b" />
            </svg>
            <div style={{ display: "flex", color: "#f59e0b", fontSize: 30, fontWeight: 700 }}>
              {`${site.geo.main} · ${since.value.toLowerCase()}`}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              maxWidth: 980,
              color: "#ffffff",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {site.hero.title}
          </div>
          <div style={{ display: "flex", marginTop: 28, color: "#a8b8c8", fontSize: 32 }}>
            {`${objects.value} ${objects.label} · ${warranty.value} ${warranty.label}`}
          </div>
        </div>

        <div style={{ display: "flex", padding: "0 72px 72px" }}>
          <div
            style={{
              display: "flex",
              padding: "18px 34px",
              borderRadius: 18,
              background: "#f59e0b",
              color: "#131b25",
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            {site.contacts.phoneDisplay}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 16,
            display: "flex",
            backgroundImage:
              "repeating-linear-gradient(-45deg, #f59e0b 0 14px, #131b25 14px 28px)",
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "GolosLatin", data: await font("latin", 400), weight: 400, style: "normal" },
        { name: "GolosLatin", data: await font("latin", 700), weight: 700, style: "normal" },
        { name: "GolosCyrillic", data: await font("cyrillic", 400), weight: 400, style: "normal" },
        { name: "GolosCyrillic", data: await font("cyrillic", 700), weight: 700, style: "normal" },
      ],
    },
  );
}
