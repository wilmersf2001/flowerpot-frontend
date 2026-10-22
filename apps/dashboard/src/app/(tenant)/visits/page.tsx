import { WalkInVisitsPage } from "@/features/tenant/walk-in-visits";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Visitas" };

export default function Page() {
  return <WalkInVisitsPage />;
}
