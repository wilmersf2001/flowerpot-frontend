import type { PanelKind } from "@/lib/session";
import type { NavItem } from "./nav.config";
import { SidebarNav } from "./sidebar-nav";

const PANEL_LABEL: Record<PanelKind, string> = {
  central: "Administración central",
  tenant: "Panel del gimnasio",
};

export function Sidebar({
  panel,
  items,
  subtitle,
}: {
  panel: PanelKind;
  items: NavItem[];
  /** Texto bajo la marca; por defecto el nombre del panel. */
  subtitle?: string;
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar p-4 text-sidebar-foreground md:flex">
      <div className="mb-6 px-2">
        <span className="display-heading text-lg text-primary">
          Flowerpot
        </span>
        <p className="display-label mt-1 text-[10px] text-muted-foreground">
          {subtitle ?? PANEL_LABEL[panel]}
        </p>
      </div>
      <SidebarNav items={items} />
    </aside>
  );
}
