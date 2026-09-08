import { Badge, type BadgeTone, type BadgeVariant, type BadgeSize } from "@repo/ui/badge";

/** Estilo de un valor concreto dentro de un mapa de estados. */
export interface StatusStyle {
  /** Texto a mostrar. Si se omite, se usa el propio valor en crudo. */
  label?: string;
  tone?: BadgeTone;
  variant?: BadgeVariant;
}

/**
 * Mapa valor → estilo. Las claves se comparan con `String(value)`, así que
 * cubre booleanos (`"true"` / `"false"`), números y strings por igual.
 *
 * ```ts
 * export const ACTIVE_MAP: StatusMap = {
 *   true:  { label: "Activo",   tone: "success" },
 *   false: { label: "Inactivo", tone: "neutral" },
 * };
 *
 * const SUBSCRIPTION_MAP: StatusMap = {
 *   active:   { label: "Activa",    tone: "success" },
 *   trialing: { label: "Prueba",    tone: "info" },
 *   past_due: { label: "Vencida",   tone: "warning" },
 *   canceled: { label: "Cancelada", tone: "danger" },
 * };
 * ```
 */
export type StatusMap = Record<string, StatusStyle>;

/**
 * Badge dirigido por un mapa de dominio: recibe un `value` (bool, número o
 * string) y un `map`, y pinta el `Badge` de `@repo/ui` con el tono y la
 * etiqueta configurados. Sirve igual para un `is_active` de 2 estados que para
 * un `status` de 5. Si el valor no está en el mapa, cae a `tone="neutral"` y
 * muestra el valor en crudo (o `fallbackLabel`).
 */
export function StatusBadge({
  value,
  map,
  size = "sm",
  variant,
  fallbackLabel,
  className,
}: {
  value: string | number | boolean | null | undefined;
  map: StatusMap;
  size?: BadgeSize;
  /** Fuerza el relleno para todos los estados (por defecto, el del mapa). */
  variant?: BadgeVariant;
  /** Etiqueta cuando `value` no está en el mapa. Por defecto, `String(value)`. */
  fallbackLabel?: string;
  className?: string;
}) {
  const key = String(value);
  const style = map[key];
  const label = style?.label ?? fallbackLabel ?? key;

  return (
    <Badge
      tone={style?.tone ?? "neutral"}
      variant={variant ?? style?.variant ?? "soft"}
      size={size}
      className={className}
    >
      {label}
    </Badge>
  );
}

/** Mapa reutilizable para cualquier flag booleano de "activo / inactivo". */
export const ACTIVE_MAP: StatusMap = {
  true: { label: "Activo", tone: "success" },
  false: { label: "Inactivo", tone: "neutral" },
};
