"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { cn } from "@repo/ui/lib/utils";

/**
 * Envoltura de `@repo/ui/dialog` para los diálogos del dashboard: arma el
 * `Dialog` + `DialogContent` + cabecera + pie en un solo componente, así los
 * módulos no repiten el mismo bloque de imports ni el mismo andamiaje.
 *
 * Controlado: el padre maneja `open`/`onOpenChange`. El contenido va como
 * `children` y las acciones como `footer` (se envuelven en `DialogFooter`).
 */
export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  className = "max-w-sm",
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Clases extra para el `DialogContent` (por defecto `max-w-sm`). */
  className?: string;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Nunca superar el alto de la ventana: el cuerpo hace scroll,
          // la cabecera y el pie quedan fijos.
          "flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden",
          className,
        )}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        <div className="-mx-6 flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {footer ? (
          <DialogFooter className="shrink-0">{footer}</DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
