import { GymSettingsPage } from "@/features/gym-settings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Configuración" };

export default function Page() {
  return <GymSettingsPage />;
}
