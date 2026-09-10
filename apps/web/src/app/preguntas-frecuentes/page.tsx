import type { Metadata } from "next";
import { FaqPage, JsonLd } from "@/features/marketing";
import { FAQ_FLAT } from "@/features/marketing/lib/faq.content";
import { breadcrumbSchema, faqPageSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Respuestas sobre Flowerpot: cómo se separan los datos de cada gimnasio, seguridad, precios, migración desde Excel, soporte 24/7 e integración con torniquetes y Yape.",
  alternates: { canonical: "/preguntas-frecuentes" },
  openGraph: {
    title: "Preguntas frecuentes | Flowerpot",
    description:
      "Seguridad, precios, migración y soporte: lo que suelen preguntarnos antes de empezar con Flowerpot.",
    url: "/preguntas-frecuentes",
    // Definir `openGraph` reemplaza el del layout: hay que repetir la imagen.
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Preguntas frecuentes | Flowerpot",
    description:
      "Seguridad, precios, migración y soporte: lo que suelen preguntarnos antes de empezar con Flowerpot.",
    images: ["/opengraph-image"],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          faqPageSchema(FAQ_FLAT),
          breadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Preguntas frecuentes", path: "/preguntas-frecuentes" },
          ]),
        ]}
      />
      <FaqPage />
    </>
  );
}
