import { MembersPage } from "@/features/tenant/members";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Socios" };

export default function Page() {
  return <MembersPage />;
}
