import { TenantsPage } from "@/features/tenants";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gimnasios" };

export default function Page() {
  return <TenantsPage />;
}
