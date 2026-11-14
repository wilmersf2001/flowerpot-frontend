import { SiteSettingsPage } from "@/features/central/site-settings";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sitio web" };

export default function Page() {
  return <SiteSettingsPage />;
}
