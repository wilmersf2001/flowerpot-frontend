import { SubscriptionsPage } from "@/features/central/subscriptions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Suscripciones" };

export default function Page() {
  return <SubscriptionsPage />;
}
