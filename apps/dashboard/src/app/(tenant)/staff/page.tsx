import { StaffPage } from "@/features/tenant/staff";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Personal" };

export default function Page() {
  return <StaffPage />;
}
