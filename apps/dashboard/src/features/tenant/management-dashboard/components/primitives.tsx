"use client";

import { Badge } from "@repo/ui/badge";
import { cn } from "@repo/ui/lib/utils";
import { StatusBadge, type StatusMap } from "@/features/_shared";
import {
  ALERT_STYLES,
  TREND_STYLES,
} from "../lib/management.constants";
import type { AlertLevel, Trend } from "../lib/management.types";

export const pct = (n: number | null | undefined, digits = 1) =>
  typeof n === "number" && Number.isFinite(n) ? `${n.toFixed(digits)}%` : "—";

export function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border p-4", className)}>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

export function AlertBanner({
  level,
  title,
  message,
  children,
}: {
  level: AlertLevel;
  title?: string;
  message: string;
  children?: React.ReactNode;
}) {
  const s = ALERT_STYLES[level];
  return (
    <div role="alert" className={cn("rounded-xl border p-4 text-sm", s.box)}>
      <p className="font-medium">
        <span aria-hidden className="mr-1.5">
          {s.icon}
        </span>
        {title ? `${title}: ` : null}
        {message}
      </p>
      {children}
    </div>
  );
}

export function TrendBadge({
  trend,
  percent,
  inverse = false,
}: {
  trend: Trend;
  percent: number;
  /** Para métricas donde subir es malo (gastos, churn). */
  inverse?: boolean;
}) {
  const effective: Trend =
    inverse && trend !== "stable" ? (trend === "up" ? "down" : "up") : trend;
  const s = TREND_STYLES[effective];
  return (
    <span className={cn("text-xs font-medium tabular-nums", s.text)}>
      {TREND_STYLES[trend].arrow} {Math.abs(percent).toFixed(1)}%
    </span>
  );
}

export function KpiCard({
  label,
  value,
  hint,
  trend,
  changePercent,
  inverse,
  status,
  statusMap,
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: Trend;
  changePercent?: number;
  inverse?: boolean;
  status?: string;
  statusMap?: StatusMap;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{label}</p>
        {status && statusMap ? <StatusBadge value={status} map={statusMap} /> : null}
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {trend && changePercent != null ? (
          <TrendBadge trend={trend} percent={changePercent} inverse={inverse} />
        ) : null}
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
    </div>
  );
}

export function KpiGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{children}</div>;
}

export function ProgressBar({
  value,
  color = "bg-emerald-500",
  className,
}: {
  value: number;
  color?: string;
  className?: string;
}) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={Math.round(w)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={cn("h-full rounded-full", color)} style={{ width: `${w}%` }} />
    </div>
  );
}

export interface BarItem {
  label: string;
  value: number;
  /** Texto a la derecha (si se omite, el valor). */
  display?: string;
  color?: string;
}

/** Barras horizontales: etiqueta, barra proporcional al máximo y valor. */
export function BarList({
  items,
  format = (n: number) => String(n),
  barClass = "bg-sky-500",
}: {
  items: BarItem[];
  format?: (n: number) => string;
  barClass?: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  if (items.length === 0) return <Empty />;
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((i) => (
        <li key={i.label} className="text-sm">
          <div className="mb-1 flex justify-between gap-2">
            <span className="truncate">{i.label}</span>
            <span className="tabular-nums text-muted-foreground">
              {i.display ?? format(i.value)}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", i.color ?? barClass)}
              style={{ width: `${(i.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Empty({ text = "Sin datos para este período." }: { text?: string }) {
  return <p className="py-4 text-center text-sm text-muted-foreground">{text}</p>;
}

export function PanelState({
  isPending,
  error,
  children,
}: {
  isPending: boolean;
  error: unknown;
  children: React.ReactNode;
}) {
  if (isPending) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Cargando panel…</p>;
  }
  if (error) {
    const msg = error instanceof Error ? error.message : "No se pudo cargar el panel.";
    return <AlertBanner level="danger" message={msg} />;
  }
  return <>{children}</>;
}

export function Insight({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-3 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{children}</p>
  );
}

export function ContactActions({ phone, email }: { phone?: string; email?: string }) {
  return (
    <div className="flex gap-1.5">
      {phone ? (
        <a href={`tel:${phone}`}>
          <Badge tone="primary" variant="outline">
            Llamar
          </Badge>
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`}>
          <Badge tone="neutral" variant="outline">
            Email
          </Badge>
        </a>
      ) : null}
    </div>
  );
}
