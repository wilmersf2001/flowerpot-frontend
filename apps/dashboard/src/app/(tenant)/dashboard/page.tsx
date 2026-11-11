import { ManagementDashboardPage } from "@/features/tenant/management-dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard de gerencia" };

export default function Page() {
  return <ManagementDashboardPage />;
}
