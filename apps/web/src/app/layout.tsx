import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";
import { Providers } from "./providers";
import "./globals.css";

// UI y texto corrido: Geist (neutral, legible, ya lo usa el dashboard).
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Titulares: Archivo — grotesca variable con corte industrial. En la landing
// se usa con weights altos (700–900) y `stretch` reducido para el aire
// "hierro / gimnasio" de la dirección Iron & Lime. Nada de serif.
const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Evita que los navegadores conviertan números/direcciones en enlaces raros.
  formatDetection: { telephone: false, address: false, email: false },
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // La imagen sale de `app/opengraph-image.tsx` (Next la añade sola).
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  // TODO(Search Console): pegar el token cuando se dé de alta el dominio.
  // verification: { google: "..." },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  // Grafito casi negro del tema "Iron & Lime" (apps/web globals.css).
  themeColor: "#17190f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-PE"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
