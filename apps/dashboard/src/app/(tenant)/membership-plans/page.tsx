import { MembershipPlansPage } from "@/features/tenant/membership-plans";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Planes de membresía" };

export default function Page() {
  return <MembershipPlansPage />;
}
