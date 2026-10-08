import { DocumentTemplatesPage } from "@/features/tenant/documents";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentos y plantillas" };

export default function Page() {
  return <DocumentTemplatesPage />;
}
