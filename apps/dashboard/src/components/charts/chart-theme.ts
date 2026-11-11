/**
 * Tema compartido de los gráficos.
 *
 * Todo gráfico acepta `colors` por props; esta paleta es solo el valor por
 * defecto. Los tokens neutros (texto, grilla, tooltip) salen de las variables
 * CSS del tema, así que respetan modo claro/oscuro sin lógica extra.
 */

/** Paleta categórica por defecto (series distinguibles entre sí). */
export const DEFAULT_CHART_COLORS = [
  "#10b981", // emerald
  "#0ea5e9", // sky
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ef4444", // red
  "#64748b", // slate
] as const;

/** Color de la serie `index`, rotando si hay más series que colores. */
export function pickColor(colors: readonly string[], index: number): string {
  return colors[index % colors.length] ?? DEFAULT_CHART_COLORS[0];
}

export const CHART_TOKENS = {
  text: "var(--muted-foreground)",
  grid: "var(--border)",
} as const;

export const DEFAULT_CHART_HEIGHT = 220;
