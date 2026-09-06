import { Badge } from "@repo/ui/badge";
import type { PanelTarget } from "@/lib/domain";
import { LogoutButton } from "@/components/logout-button";

/**
 * Barra superior: visible siempre (en móvil es la única forma de ver el panel y
 * cerrar sesión, porque el sidebar se oculta bajo `md`).
 */
export function Topbar({ panel }: { panel: PanelTarget }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 md:px-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold tracking-tight md:hidden">
          Flowerpot
        </span>
        {panel.kind === "tenant" ? (
          <Badge variant="success">Gimnasio · {panel.slug}</Badge>
        ) : (
          <Badge variant="secondary">SaaS</Badge>
        )}
      </div>
      <div className="w-32">
        <LogoutButton />
      </div>
    </header>
  );
}
