import { AppShell } from "@/components/app-shell";
import { currentPanel } from "@/lib/panel";

/**
 * Panel central del SaaS. Se sirve en `admin.<ROOT_DOMAIN>`; `proxy.ts` resuelve
 * el panel desde el subdominio e inyecta las cabeceras que lee `currentPanel()`.
 */
export default async function CentralLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const panel = await currentPanel();
  return <AppShell panel={panel}>{children}</AppShell>;
}
