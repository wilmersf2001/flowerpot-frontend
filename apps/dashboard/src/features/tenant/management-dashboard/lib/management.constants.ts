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

/** Permiso que habilita la exportación de reportes Excel. */
export const EXPORT_REPORTS_PERMISSION = "analytics.export_reports";

export const REPORTS_ENDPOINT = "/analytics/reports";

export const EXCEL_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** Los reportes tardan 1-3 s en generarse; se da margen sobre el timeout por defecto. */
export const REPORT_EXPORT_TIMEOUT_MS = 60_000;

export const REPORT_TYPES = [
  { value: "financial", label: "Financiero mensual", description: "Ingresos, gastos, anomalías y proyecciones" },
  { value: "collection", label: "Cobranza", description: "Pagos, morosidad y scoring de riesgo" },
  { value: "operations", label: "Operaciones", description: "Asistencia, horas pico, clases y equipos" },
  { value: "retention", label: "Retención", description: "Tendencias, churn y miembros en riesgo" },
  { value: "crm", label: "CRM", description: "Funnel, fuentes y razones de pérdida" },
  { value: "inventory", label: "Kardex de inventario", description: "Movimientos, ABC y alertas de stock" },
] as const;

export type ReportType = (typeof REPORT_TYPES)[number]["value"];

/** Permiso general de la exportación de reportes PDF profesionales. */
export const EXPORT_PDF_PERMISSION = "analytics.export_pdf_reports";

export const PDF_REPORTS_ENDPOINT = "/analytics/reports/pdf";

/** Los PDF con gráficos tardan hasta ~15 s (60 s el consolidado de personal). */
export const PDF_REPORT_TIMEOUT_MS = 90_000;

export const PDF_REPORT_TYPES = [
  {
    value: "executive",
    label: "Ejecutivo mensual",
    description: "KPIs, FODA y proyecciones (8-12 págs.)",
    permission: "analytics.export_executive_report",
  },
  {
    value: "audit",
    label: "Auditoría interna",
    description: "Conciliación, anomalías y controles (10-15 págs.)",
    permission: "analytics.export_audit_report",
  },
  {
    value: "staff-performance",
    label: "Desempeño de personal",
    description: "Evaluación de todo el equipo (20-50 págs.)",
    permission: "analytics.export_staff_performance",
  },
] as const;

export type PdfReportType = (typeof PDF_REPORT_TYPES)[number]["value"];
