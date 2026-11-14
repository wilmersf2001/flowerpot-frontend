import type { Metadata } from "next";
import { JsonLd, LegalPage, TERMS_DOC } from "@/features/marketing";
import { breadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: TERMS_DOC.metaDescription,
  alternates: { canonical: "/terminos" },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Términos y condiciones", path: "/terminos" },
        ])}
      />
      <LegalPage doc={TERMS_DOC} />
    </>
  );
}
