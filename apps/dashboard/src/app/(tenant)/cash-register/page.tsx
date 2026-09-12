import { CashRegisterPage } from "@/features/tenant/cash-register";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Caja" };

export default function Page() {
  return <CashRegisterPage />;
}
