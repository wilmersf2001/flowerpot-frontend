"use client";

import { BellRing, Check, Fingerprint, type LucideIcon } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { toast } from "@repo/ui/toast";
import { EM_DASH, StatusBadge, formatDateTime } from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import {
  BIOMETRIC_SCANS_PERMISSION,
  BIOMETRIC_STATUS_MAP,
} from "./lib/biometric-scans.constants";
import {
  useAcknowledgeBiometricScan,
  useBiometricScans,
  usePendingBiometricAlerts,
} from "./lib/biometric-scans.hooks";
import type { BiometricScanRow } from "./lib/biometric-scans.types";

const TIME = { timeStyle: "short" } as const;

function whoOf(scan: BiometricScanRow): string {
  if (scan.member) return scan.member.full_name;
  return scan.pin ? `PIN ${scan.pin}` : EM_DASH;
}

function initialsOf(scan: BiometricScanRow): string {
  if (!scan.member) return "?";
  return scan.member.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

/** Color del avatar y del borde según cómo terminó la marcación. */
function accentOf(status: string): "success" | "warning" | "danger" {
  if (status === "success") return "success";
  if (status === "already_checked_in") return "warning";
  return "danger";
}

const AVATAR_STYLES = {
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  danger: "bg-destructive/10 text-destructive",
} as const;

function Avatar({ scan }: { scan: BiometricScanRow }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold",
        AVATAR_STYLES[accentOf(scan.status)],
      )}
    >
      {initialsOf(scan)}
    </span>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: keyof typeof AVATAR_STYLES;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-3xl font-semibold tabular-nums",
          tone === "success" && "text-emerald-600 dark:text-emerald-400",
          tone === "warning" && "text-amber-600 dark:text-amber-400",
          tone === "danger" && "text-destructive",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
  hint,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Icon className="size-4" />
        {children}
      </h2>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

/**
 * Marcaciones del lector biométrico: resumen del día, avisos pendientes para
 * recepción (con "Atendido") y la bitácora. Se oculta sin el permiso de ver hoy.
 */
export function BiometricScansPanel() {
  const allowed = useHasPermission()(BIOMETRIC_SCANS_PERMISSION);
  const pending = usePendingBiometricAlerts(allowed);
  const log = useBiometricScans({}, allowed);
  const acknowledge = useAcknowledgeBiometricScan();

  if (!allowed) return null;

  const alerts = pending.data?.data ?? [];
  const scans = log.data?.data ?? [];

  const entered = scans.filter((scan) => scan.status === "success").length;
  const repeated = scans.filter((scan) => scan.status === "already_checked_in").length;
  const rejected = scans.length - entered - repeated;

  function handleAcknowledge(scan: BiometricScanRow) {
    acknowledge.mutate(scan.id, {
      onSuccess: () => toast.success("Aviso marcado como atendido."),
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : "No se pudo marcar el aviso."),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Entradas hoy" value={entered} tone="success" />
        <Stat label="Ya habían entrado" value={repeated} tone="warning" />
        <Stat label="Rechazadas" value={rejected} tone="danger" />
      </div>

      {alerts.length > 0 ? (
        <section aria-live="polite" className="flex flex-col gap-3">
          <SectionTitle icon={BellRing} hint="Requieren atención de recepción">
            Avisos sin atender ({pending.data?.total ?? alerts.length})
          </SectionTitle>
          <ul className="flex flex-col gap-2">
            {alerts.map((scan) => (
              <li
                key={scan.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-l-4 border-l-amber-500 bg-amber-500/5 px-4 py-3 text-sm"
              >
                <Avatar scan={scan} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{whoOf(scan)}</span>
                  <span className="truncate text-muted-foreground">{scan.message}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-muted-foreground">
                    {formatDateTime(scan.scanned_at, TIME)}
                  </span>
                  <StatusBadge value={scan.status} map={BIOMETRIC_STATUS_MAP} />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={acknowledge.isPending && acknowledge.variables === scan.id}
                    onClick={() => handleAcknowledge(scan)}
                  >
                    <Check className="size-4" />
                    Atendido
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <SectionTitle icon={Fingerprint} hint="Se actualiza automáticamente">
          Marcaciones del lector
        </SectionTitle>
        {log.isError ? (
          <p className="text-sm text-destructive">
            No se pudo cargar la bitácora.{" "}
            <button
              type="button"
              className="underline underline-offset-2"
              onClick={() => log.refetch()}
            >
              Reintentar
            </button>
          </p>
        ) : scans.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            {log.isPending ? "Cargando…" : "Aún no hay marcaciones del lector hoy."}
          </p>
        ) : (
          <ul className="divide-y overflow-hidden rounded-xl border bg-card">
            {scans.map((scan) => (
              <li key={scan.id} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <Avatar scan={scan} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{whoOf(scan)}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {scan.device?.name ?? "Lector biométrico"}
                    {scan.is_alert && scan.acknowledged_at
                      ? ` · Atendido ${formatDateTime(scan.acknowledged_at, TIME)}`
                      : ""}
                  </span>
                </div>
                <StatusBadge value={scan.status} map={BIOMETRIC_STATUS_MAP} />
                <span className="w-14 text-right tabular-nums text-muted-foreground">
                  {formatDateTime(scan.scanned_at, TIME)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
