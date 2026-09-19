import { SalesPage } from "@/features/tenant/sales";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ventas" };

export default function Page() {
  return <SalesPage />;
}
