"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Settings } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useHasPermission } from "@/features/tenant/auth";
import { HOME_ROUTE } from "@/lib/routes";
import { SETTINGS_NAV } from "./settings.config";

/**
 * Marco de la zona de Configuración. Es deliberadamente distinto del resto del
 * panel: lleva su cabecera, un botón para volver al trabajo diario y una
 * sub-navegación propia, para que no se confunda con un módulo operativo.
 */
export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasPermission = useHasPermission();
  const items = SETTINGS_NAV.filter((item) => hasPermission(item.permission));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings className="size-5" aria-hidden />
          </span>
          <div>
            <p className="display-label text-[10px] text-muted-foreground">
              Sistema
            </p>
            <p className="text-sm font-semibold leading-tight">Configuración</p>
          </div>
        </div>
        <Link
          href={HOME_ROUTE.tenant}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver al panel
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav
          aria-label="Secciones de configuración"
          className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
        >
          {items.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-40 flex-col rounded-lg border border-transparent px-3 py-2 transition-colors lg:min-w-0",
                  active
                    ? "border-border bg-card shadow-sm"
                    : "hover:bg-muted/60",
                )}
              >
                <span
                  className={cn(
                    "text-sm",
                    active ? "font-semibold" : "font-medium text-foreground/80",
                  )}
                >
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
