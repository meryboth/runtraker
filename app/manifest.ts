import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "runtrack. — tu diario de corridas",
    short_name: "runtrack.",
    description: "Anotá si corriste, dónde, la distancia y el tiempo, y mirá tu año en un tablero verde.",
    start_url: `${base}/`,
    scope: `${base}/`,
    display: "standalone",
    background_color: "#f5f2ea",
    theme_color: "#f5f2ea",
    lang: "es",
    icons: [{ src: `${base}/icon.svg`, sizes: "any", type: "image/svg+xml" }],
  };
}
