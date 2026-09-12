import { ExpensesRootPage } from "@/features/tenant/expenses";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gastos" };

export default function Page() {
  return <ExpensesRootPage />;
}
