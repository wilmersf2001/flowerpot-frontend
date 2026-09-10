import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { themeInitScript } from "@/components/theme/theme-provider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Titulares de marca (wordmark, H1 de pantalla): misma Archivo de la landing.
// El cuerpo del panel se queda en Geist por legibilidad en tablas/formularios.
const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: { default: "Flowerpot", template: "%s · Flowerpot" },
  description: "Panel de gestión de Flowerpot.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-PE"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
