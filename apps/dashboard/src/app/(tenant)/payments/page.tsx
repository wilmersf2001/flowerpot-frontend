import { PaymentsPage } from "@/features/tenant/payments";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pagos" };

export default function Page() {
  return <PaymentsPage />;
}
