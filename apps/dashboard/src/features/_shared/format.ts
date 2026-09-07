/**
 * Formateadores de presentación compartidos por los módulos del dashboard.
 * Funciones puras: sin estado, sin React, sin llamadas de red.
 */

/** Marcador para valores ausentes o inválidos. */
export const EM_DASH = "—";

/**
 * Formatea una fecha (string ISO o `Date`) a `es-PE` legible.
 * Devuelve `—` si el valor no es una fecha válida.
 */
export function formatDate(
  value: unknown,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  if (typeof value !== "string" && !(value instanceof Date)) return EM_DASH;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime())
    ? EM_DASH
    : date.toLocaleDateString("es-PE", options);
}
