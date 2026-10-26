import { ClassesPage } from "@/features/tenant/classes";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Clases" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <ClassesPage defaultTab={tab} />;
}
