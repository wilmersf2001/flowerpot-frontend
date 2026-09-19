import { EquipmentInventoryPage } from "@/features/tenant/equipment-inventory";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Equipos" };

export default function Page() {
  return <EquipmentInventoryPage />;
}
