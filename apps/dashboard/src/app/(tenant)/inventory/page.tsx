import { InventoryPage } from "@/features/tenant/inventory";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inventario" };

export default function Page() {
  return <InventoryPage />;
}
