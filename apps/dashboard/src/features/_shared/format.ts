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

/**
 * ISO / date-time / `Date` -> `YYYY-MM-DD` para un `<input type="date">`.
 * Devuelve `""` (campo vacío) si el valor no es una fecha válida.
 */
export function toDateInputValue(value: unknown): string {
  if (typeof value !== "string" && !(value instanceof Date)) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

/**
 * Texto multilínea de un `<textarea>` -> lista de líneas sin vacíos ni
 * espacios sobrantes. Inverso de `lines.join("\n")` al prellenar.
 */
export function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Texto libre -> identificador URL-safe: minúsculas, sin acentos, y cada
 * grupo de caracteres no alfanuméricos colapsado a un solo guion (sin
 * guiones al inicio ni al final). Ej.: `"Plan Pro ½"` -> `"plan-pro"`.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
