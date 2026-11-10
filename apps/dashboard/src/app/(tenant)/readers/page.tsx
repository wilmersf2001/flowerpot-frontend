import { DevicesPage } from "@/features/tenant/devices";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lectores" };

export default function Page() {
  return <DevicesPage />;
}
