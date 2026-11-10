import { DevicesPage } from "@/features/central/devices";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lectores" };

export default function Page() {
  return <DevicesPage />;
}
