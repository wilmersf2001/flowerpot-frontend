import { Badge } from "@repo/ui/badge";
import type { PanelTarget } from "@/lib/domain";
import { BranchSwitcher } from "@/components/branch";
import { LogoutButton } from "@/components/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Barra superior: visible siempre (en móvil es la única forma de ver el panel y
 * cerrar sesión, porque el sidebar se oculta bajo `md`).
 */
export function Topbar({ panel }: { panel: PanelTarget }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 md:px-6">
      <div className="flex items-center gap-2">
        <span className="display-heading text-base text-primary md:hidden">
          Flowerpot
        </span>
        {panel.kind === "tenant" ? (
          <>
            <Badge tone="success">Gimnasio · {panel.slug}</Badge>
            <BranchSwitcher />
          </>
        ) : (
          <Badge tone="neutral">SaaS</Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="w-32">
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
