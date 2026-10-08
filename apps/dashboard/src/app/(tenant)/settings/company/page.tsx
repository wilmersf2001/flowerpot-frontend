import { CompanyProfilePage } from "@/features/tenant/company-profile";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Empresa y marca" };

export default function Page() {
  return <CompanyProfilePage />;
}
