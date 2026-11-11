import type { StatusMap } from "@/features/_shared";
import type { AlertLevel, Trend } from "./management.types";

export const MANAGEMENT_ENDPOINT = "/analytics/dashboard/management";

/** Permiso del catálogo que habilita el dashboard de gerencia. */
export const MANAGEMENT_PERMISSION = "analytics.view_management";

/** El backend cachea 5 min; no tiene sentido refrescar antes en el cliente. */
export const MANAGEMENT_STALE_MS = 5 * 60_000;

export const ALERT_STYLES: Record<AlertLevel, { box: string; icon: string }> = {
  success: {
    box: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    icon: "✅",
  },
  info: {
    box: "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
    icon: "ℹ️",
  },
  warning: {
    box: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
    icon: "⚠️",
  },
  danger: {
    box: "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
    icon: "🔴",
  },
};

export const TREND_STYLES: Record<Trend, { text: string; arrow: string }> = {
  up: { text: "text-emerald-600 dark:text-emerald-400", arrow: "▲" },
  down: { text: "text-red-600 dark:text-red-400", arrow: "▼" },
  stable: { text: "text-muted-foreground", arrow: "▬" },
};

export const HEALTH_STATUS_MAP: StatusMap = {
  critical: { label: "Crítico", tone: "danger" },
  warning: { label: "Advertencia", tone: "warning" },
  healthy: { label: "Saludable", tone: "success" },
  good: { label: "Bueno", tone: "info" },
  excellent: { label: "Excelente", tone: "success" },
};

export const RISK_MAP: StatusMap = {
  low: { label: "Bajo", tone: "success" },
  medium: { label: "Medio", tone: "warning" },
  high: { label: "Alto", tone: "danger" },
};

/** Semáforo de ocupación (clases Tailwind de fondo + etiqueta). */
export function occupancyStyle(percent: number): { bg: string; label: string } {
  if (percent >= 90) return { bg: "bg-red-600 text-white", label: "Saturado" };
  if (percent >= 70) return { bg: "bg-orange-500 text-white", label: "Alto" };
  if (percent >= 50) return { bg: "bg-amber-400 text-black", label: "Medio" };
  if (percent >= 30) return { bg: "bg-emerald-600 text-white", label: "Óptimo" };
  return { bg: "bg-sky-600 text-white", label: "Bajo" };
}

export const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;
