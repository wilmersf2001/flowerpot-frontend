import { InstructorsPage } from "@/features/tenant/instructors";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Instructores" };

export default function Page() {
  return <InstructorsPage />;
}
