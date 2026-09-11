import { MembershipsPage } from "@/features/tenant/memberships";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Membresías" };

export default function Page() {
  return <MembershipsPage />;
}
