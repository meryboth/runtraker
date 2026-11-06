import type { Metadata, Viewport } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = "https://meryboth.github.io/runtraker/";
const DESCRIPTION =
  "Un diario de corridas: anotá si corriste, dónde, la distancia y el tiempo, y mirá tu año en un tablero.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "runtrack — tu diario de corridas",
    template: "%s · runtrack",
  },
  description: DESCRIPTION,
  applicationName: "runtrack",
  authors: [{ name: "meryboth", url: "https://github.com/meryboth" }],
  keywords: ["running", "correr", "diario", "tracker", "hábitos", "corridas"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: SITE_URL,
    siteName: "runtrack",
    title: "runtrack — tu diario de corridas",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "runtrack — tu diario de corridas",
    description: DESCRIPTION,
  },
  appleWebApp: { capable: true, title: "runtrack", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ecebe8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={sans.variable}>
      <body>{children}</body>
    </html>
  );
}
