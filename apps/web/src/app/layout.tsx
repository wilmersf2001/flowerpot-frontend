import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "Flowerpot — Software de gestión para gimnasios",
    template: "%s | Flowerpot",
  },
  description:
    "Administra socios, membresías, pagos y asistencia de tu gimnasio en Perú. Multi-sede, datos cifrados y soporte 24/7.",
  metadataBase: new URL("https://flowerpot.pe"),
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
