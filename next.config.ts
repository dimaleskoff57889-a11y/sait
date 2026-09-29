import type { NextConfig } from "next";

// Статический экспорт: на выходе папка out/ с чистой статикой.
// Её можно положить куда угодно — на хостинг Timeweb, на твой VDS за Caddy,
// на любой другой сервер. Никакого Node на проде не нужно.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
