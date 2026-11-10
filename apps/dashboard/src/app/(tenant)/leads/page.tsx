import { LeadsPage } from "@/features/tenant/leads";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leads" };

export default function Page() {
  return <LeadsPage />;
}
