import { CheckInPage } from "@/features/tenant/check-in";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Check-in" };

export default function Page() {
  return <CheckInPage />;
}
