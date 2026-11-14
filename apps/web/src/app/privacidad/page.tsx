import type { Metadata } from "next";
import { JsonLd, LegalPage, PRIVACY_DOC } from "@/features/marketing";
import { breadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: PRIVACY_DOC.metaDescription,
  alternates: { canonical: "/privacidad" },
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Política de privacidad", path: "/privacidad" },
        ])}
      />
      <LegalPage doc={PRIVACY_DOC} />
    </>
  );
}
