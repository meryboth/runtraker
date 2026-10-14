import type { Metadata, Viewport } from "next";
import { Caveat, Shantell_Sans } from "next/font/google";
import "./globals.css";

const hand = Shantell_Sans({
  subsets: ["latin"],
  axes: ["BNCE", "INFM"],
  variable: "--font-hand",
  display: "swap",
});

const note = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-note",
  display: "swap",
});

const SITE_URL = "https://meryboth.github.io/runtraker/";
const DESCRIPTION =
  "Un diario de corridas hecho a mano: anotá si corriste, dónde, la distancia y el tiempo, y mirá tu año en un tablero verde.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "runtrack. — tu diario de corridas",
    template: "%s · runtrack.",
  },
  description: DESCRIPTION,
  applicationName: "runtrack.",
  authors: [{ name: "meryboth", url: "https://github.com/meryboth" }],
  keywords: ["running", "correr", "diario", "tracker", "hábitos", "corridas"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "runtrack.",
    title: "runtrack. — tu diario de corridas",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "runtrack. — tu diario de corridas",
    description: DESCRIPTION,
  },
  appleWebApp: { capable: true, title: "runtrack.", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f2ea",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${hand.variable} ${note.variable}`}>
      <body>{children}</body>
    </html>
  );
}
