"use client";

import { useMemo } from "react";
import { useHasPermission } from "@/features/tenant/auth";
import type { PanelTarget } from "@/lib/domain";
import { NAV_BY_PANEL, type NavItem } from "./nav.config";
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
  const hasPermission = useHasPermission();
  // El panel central no tiene sistema de permisos; solo el tenant se filtra.
  const items = useMemo(() => {
    const all = NAV_BY_PANEL[panel.kind];
    if (panel.kind === "central") return all;
    return all.filter((item: NavItem) => hasPermission(item.permission));
  }, [panel.kind, hasPermission]);

  return (
    <div className="flex min-h-svh">
      <Sidebar panel={panel.kind} items={items} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar panel={panel} />
        {/* Navegación en móvil: el sidebar está oculto bajo `md`. */}
        <div className="border-b px-4 py-2 md:hidden">
          <SidebarNav items={items} orientation="horizontal" />
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
