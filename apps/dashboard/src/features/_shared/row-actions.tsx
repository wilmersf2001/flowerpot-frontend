"use client";

import { Fragment } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";

/** Una acción del menú de fila. Describe *qué* hace, no *cómo* se pinta. */
export interface RowAction {
  label: string;
  /** Handler al elegir la acción (p. ej. abrir diálogo, descargar…). */
  onSelect: () => void;
  /** Icono de `lucide-react`; se renderiza a `size-4` a la izquierda. */
  icon?: LucideIcon;
  variant?: "default" | "destructive";
  disabled?: boolean;
  /** Inserta un separador antes de este ítem (se ignora si es el primero). */
  separatorBefore?: boolean;
}

/** Entradas condicionales: `row.canEdit && { ... }` se descarta si es falsy. */
type RowActionEntry = RowAction | false | null | undefined;

/**
 * Menú "⋯" de acciones por fila para `DataTable`. Centraliza el `DropdownMenu`,
 * su disparador y los imports de `@repo/ui/dropdown-menu` para que cada módulo
 * solo declare la lista de acciones:
 *
 * ```tsx
 * rowActions={(row) => (
 *   <RowActions
 *     label={`Acciones de ${row.id}`}
 *     actions={[
 *       { label: "Editar", icon: Pencil, onSelect: () => onEdit(row) },
 *       { label: "Descargar PDF", icon: FileDown, onSelect: () => onPdf(row) },
 *       {
 *         label: "Eliminar",
 *         icon: Trash2,
 *         variant: "destructive",
 *         separatorBefore: true,
 *         onSelect: () => onDelete(row),
 *       },
 *     ]}
 *   />
 * )}
 * ```
 *
 * Presentación: hasta `inlineThreshold` acciones (por defecto 3) —y siempre que
 * todas tengan `icon`— se pintan como botones-icono sueltos con tooltip nativo
 * (`title`). A partir de ahí, o si a alguna le falta el icono, se colapsan en el
 * menú "⋯" con icono + texto.
 */
export function RowActions({
  label,
  actions,
  align = "end",
  inlineThreshold = 3,
}: {
  /** Texto accesible del disparador, p. ej. `Acciones de ${row.id}`. */
  label: string;
  actions: RowActionEntry[];
  align?: "start" | "center" | "end";
  /** Nº máximo de acciones que se muestran como iconos sueltos (default 3). */
  inlineThreshold?: number;
}) {
  const visible = actions.filter((a): a is RowAction => Boolean(a));
  if (visible.length === 0) return null;

  // Modo inline: pocas acciones y todas con icono → botones-icono con tooltip.
  const canInline =
    visible.length <= inlineThreshold && visible.every((a) => a.icon);

  if (canInline) {
    return (
      <div className="flex items-center justify-end gap-1">
        {visible.map((action) => {
          const Icon = action.icon!;
          return (
            <Button
              key={action.label}
              variant="ghost"
              size="icon"
              disabled={action.disabled}
              onClick={action.onSelect}
              title={action.label}
              aria-label={action.label}
              className={
                action.variant === "destructive"
                  ? "text-destructive hover:text-destructive"
                  : undefined
              }
            >
              <Icon className="size-4" />
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {visible.map((action, i) => {
          const Icon = action.icon;
          return (
            <Fragment key={action.label}>
              {action.separatorBefore && i > 0 ? <DropdownMenuSeparator /> : null}
              <DropdownMenuItem
                variant={action.variant}
                disabled={action.disabled}
                onClick={action.onSelect}
              >
                {Icon ? <Icon className="size-4" /> : null}
                {action.label}
              </DropdownMenuItem>
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
