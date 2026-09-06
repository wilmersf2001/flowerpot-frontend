import type { PanelKind } from "@/lib/session";
import { NAV_BY_PANEL } from "./nav.config";
import { SidebarNav } from "./sidebar-nav";

const PANEL_LABEL: Record<PanelKind, string> = {
  central: "Administración central",
  tenant: "Panel del gimnasio",
};

export function Sidebar({
  panel,
  subtitle,
}: {
  panel: PanelKind;
  /** Texto bajo la marca; por defecto el nombre del panel. */
  subtitle?: string;
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar p-4 text-sidebar-foreground md:flex">
      <div className="mb-6 px-2">
        <span className="text-sm font-bold tracking-tight">Flowerpot</span>
        <p className="text-xs text-muted-foreground">
          {subtitle ?? PANEL_LABEL[panel]}
        </p>
      </div>
      <SidebarNav items={NAV_BY_PANEL[panel]} />
    </aside>
  );
}
