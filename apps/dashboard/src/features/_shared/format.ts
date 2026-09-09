/**
 * Formateadores de presentación compartidos por los módulos del dashboard.
 * Funciones puras: sin estado, sin React, sin llamadas de red.
 */

/** Marcador para valores ausentes o inválidos. */
export const EM_DASH = "—";

/** `YYYY-MM-DD` opcionalmente seguido de hora: `2026-09-01` o `2026-09-01 21:00:19`. */
const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})(?:[T ]|$)/;

/**
 * Interpreta un valor como fecha de calendario sin zona horaria.
 * Para strings `YYYY-MM-DD[...]` toma solo la parte de fecha y la fija a
 * mediodía UTC, de modo que ningún desplazamiento de zona la cambie de día.
 * El resto (Date, ISO con offset) se delega a `new Date`.
 */
function toCalendarDate(value: string | Date): Date {
  if (typeof value === "string") {
    const m = DATE_ONLY_RE.exec(value);
    if (m) {
      const [, y, mo, d] = m;
      return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 12));
    }
  }
  return value instanceof Date ? value : new Date(value);
}

/**
 * Formatea una fecha (string ISO o `Date`) a `es-PE` legible.
 * Las fechas `YYYY-MM-DD` se tratan como fecha de calendario (sin zona).
 * Devuelve `—` si el valor no es una fecha válida.
 */
export function formatDate(
  value: unknown,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  if (typeof value !== "string" && !(value instanceof Date)) return EM_DASH;
  const date = toCalendarDate(value);
  if (Number.isNaN(date.getTime())) return EM_DASH;
  return DATE_ONLY_RE.test(typeof value === "string" ? value : "")
    ? date.toLocaleDateString("es-PE", { ...options, timeZone: "UTC" })
    : date.toLocaleDateString("es-PE", options);
}

/**
 * ISO / date-time / `Date` -> `YYYY-MM-DD` para un `<input type="date">`.
 * Devuelve `""` (campo vacío) si el valor no es una fecha válida.
 */
export function toDateInputValue(value: unknown): string {
  if (typeof value !== "string" && !(value instanceof Date)) return "";
  const date = toCalendarDate(value);
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
