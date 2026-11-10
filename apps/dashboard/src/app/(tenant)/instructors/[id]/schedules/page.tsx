import { InstructorSchedulesPage } from "@/features/tenant/instructor-schedules";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Horarios del instructor" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InstructorSchedulesPage instructorId={id} />;
}
