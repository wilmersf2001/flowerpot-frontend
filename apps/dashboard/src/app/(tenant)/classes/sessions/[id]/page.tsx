import { ClassEnrollmentsPage } from "@/features/tenant/class-enrollments";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inscritos de la sesión" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClassEnrollmentsPage sessionId={id} />;
}
