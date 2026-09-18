import { ClassesPage } from "@/features/tenant/classes";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Clases" };

export default function Page() {
  return <ClassesPage />;
}
