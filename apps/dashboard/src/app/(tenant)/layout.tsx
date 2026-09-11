import { AppShell } from "@/components/app-shell";
import { BranchProvider } from "@/components/branch";
import { currentPanel } from "@/lib/panel";

/**
 * Panel de un gimnasio. Se sirve en `{slug}.<ROOT_DOMAIN>`; `proxy.ts` resuelve
 * el slug desde el subdominio e inyecta las cabeceras que lee `currentPanel()`.
 */
export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const panel = await currentPanel();
  return (
    <BranchProvider>
      <AppShell panel={panel}>{children}</AppShell>
    </BranchProvider>
  );
}
