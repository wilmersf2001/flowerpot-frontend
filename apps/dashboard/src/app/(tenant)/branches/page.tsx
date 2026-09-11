import { BranchesPage } from "@/features/tenant/branches";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sedes" };

export default function Page() {
  return <BranchesPage />;
}
