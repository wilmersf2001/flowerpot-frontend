import type { PanelTarget } from "@/lib/domain";
import { NAV_BY_PANEL } from "./nav.config";
import { Sidebar } from "./sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";

/**
 * Chrome común de los dos paneles: sidebar (desktop) + topbar + contenido.
 * El panel lo resuelve `currentPanel()` en cada `layout.tsx`.
 */
export function AppShell({
  panel,
  children,
}: {
  panel: PanelTarget;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <Sidebar panel={panel.kind} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar panel={panel} />
        {/* Navegación en móvil: el sidebar está oculto bajo `md`. */}
        <div className="border-b px-4 py-2 md:hidden">
          <SidebarNav items={NAV_BY_PANEL[panel.kind]} orientation="horizontal" />
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
