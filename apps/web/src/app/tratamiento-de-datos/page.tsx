import type { Metadata } from "next";
import { DATA_PROCESSING_DOC, JsonLd, LegalPage } from "@/features/marketing";
import { breadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Tratamiento de datos",
  description: DATA_PROCESSING_DOC.metaDescription,
  alternates: { canonical: "/tratamiento-de-datos" },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Tratamiento de datos", path: "/tratamiento-de-datos" },
        ])}
      />
      <LegalPage doc={DATA_PROCESSING_DOC} />
    </>
  );
}
