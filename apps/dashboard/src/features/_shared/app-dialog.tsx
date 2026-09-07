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
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription>{description}</DialogDescription>
          ) : null}
        </DialogHeader>

        {children}

        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
