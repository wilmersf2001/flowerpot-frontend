import { AttendancePage } from "@/features/tenant/attendance";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Asistencia" };

export default function Page() {
  return <AttendancePage />;
}
