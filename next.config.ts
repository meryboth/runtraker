import type { NextConfig } from "next";

/**
 * GitHub Pages sirve el sitio en /<repo>/, así que en el build de producción
 * se exporta estático con ese prefijo. En desarrollo queda en "/".
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Permite compilar en otra carpeta sin pisar la del servidor de desarrollo.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "export",
  basePath: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
