import { UsersPage } from "@/features/tenant/users";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Usuarios" };

export default function Page() {
  return <UsersPage />;
}
