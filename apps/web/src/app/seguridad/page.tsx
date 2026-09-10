import type { Metadata } from "next";
import { JsonLd, SecurityPage } from "@/features/marketing";
import { breadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Seguridad y aislamiento de datos",
  description:
    "Cómo Flowerpot protege la información de tu gimnasio: cada gimnasio aislado en su propio espacio (multi-tenant), cifrado en tránsito y en reposo, respaldos diarios, roles por sede y datos que son 100% tuyos.",
  alternates: { canonical: "/seguridad" },
  openGraph: {
    title: "Seguridad y aislamiento de datos | Flowerpot",
    description:
      "Cada gimnasio en su propio espacio cerrado, cifrado y respaldado. Te lo explicamos sin tecnicismos.",
    url: "/seguridad",
    // Definir `openGraph` reemplaza el del layout: hay que repetir la imagen.
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seguridad y aislamiento de datos | Flowerpot",
    description:
      "Cada gimnasio en su propio espacio cerrado, cifrado y respaldado. Te lo explicamos sin tecnicismos.",
    images: ["/opengraph-image"],
  },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Seguridad", path: "/seguridad" },
        ])}
      />
      <SecurityPage />
    </>
  );
}
