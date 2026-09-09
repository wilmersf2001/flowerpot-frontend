import { z } from "zod";

/**
 * Fábricas de campos Zod para los formularios del dashboard.
 *
 * Todos los `<input>` / `<select>` entregan texto, así que estos helpers
 * trabajan sobre `z.string()`. En vez de repetir `z.string().trim().min(1, "…")`
 * en cada schema, se llama `requiredText("El plan")` y el mensaje se arma solo.
 *
 * Las conversiones al cuerpo real de la API (texto -> número, fecha, etc.)
 * viven en los `to*Input` de cada módulo; aquí solo se valida la forma.
 */

/**
 * Mensaje de campo obligatorio. `gender: "f"` para etiquetas femeninas
 * ("La fecha … es obligatoria"). Por defecto, masculino.
 */
function requiredMessage(label: string, gender: "m" | "f" = "m"): string {
  return `${label} es ${gender === "f" ? "obligatoria" : "obligatorio"}.`;
}

/**
 * Texto obligatorio (recortado). `requiredText("El nombre")` o, para
 * etiquetas femeninas, `requiredText("La fecha de inicio", "f")`.
 */
export function requiredText(label: string, gender: "m" | "f" = "m") {
  return z.string().trim().min(1, requiredMessage(label, gender));
}

/**
 * Texto obligatorio con tope de longitud.
 * `boundedText("El nombre", { max: 120 })`.
 */
export function boundedText(
  label: string,
  {
    min = 1,
    max,
    gender = "m",
  }: { min?: number; max: number; gender?: "m" | "f" },
) {
  return z
    .string()
    .trim()
    .min(min, requiredMessage(label, gender))
    .max(max, `Máximo ${max} caracteres.`);
}

/**
 * Texto opcional (puede venir vacío) con tope de longitud. El mensaje de
 * `min` nunca se dispara; solo acota el máximo. `optionalText(500)`.
 */
export function optionalText(max: number) {
  return z.string().trim().max(max, `Máximo ${max} caracteres.`);
}

/**
 * Campo numérico que llega como texto: obligatorio y, por defecto, `>= 0`.
 * `numericText("El precio")` o `numericText("El precio", { min: 1 })`.
 */
export function numericText(
  label: string,
  { min = 0, max }: { min?: number; max?: number } = {},
) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage(label))
    .refine((value) => {
      const n = Number(value);
      if (!Number.isFinite(n) || n < min) return false;
      return max === undefined || n <= max;
    }, `${label} debe ser un número válido.`);
}

/**
 * Devuelve un normalizador "string libre -> miembro del enum". Si el valor no
 * está en la lista, cae al `fallback`. Útil al prellenar formularios desde una
 * fila del backend cuyo `status`/`period` podría venir con un valor inesperado.
 *
 * `const normalizeStatus = enumFallback(SUBSCRIPTION_STATUSES, "active");`
 */
export function enumFallback<T extends readonly [string, ...string[]]>(
  values: T,
  fallback: T[number],
): (value: string) => T[number] {
  const set = new Set<string>(values);
  return (value: string) => (set.has(value) ? (value as T[number]) : fallback);
}
