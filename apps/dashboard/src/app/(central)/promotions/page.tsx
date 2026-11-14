import { PromotionsPage } from "@/features/central/promotions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Promociones" };

export default function Page() {
  return <PromotionsPage />;
}
