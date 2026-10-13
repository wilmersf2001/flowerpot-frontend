"use client";

import { BellRing, Check } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { Button } from "@repo/ui/button";
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

/**
 * Marcaciones del lector biométrico: avisos pendientes para recepción (con
 * "Atendido") y la bitácora del día. Se oculta sin el permiso de ver hoy.
 */
export function BiometricScansPanel() {
  const allowed = useHasPermission()(BIOMETRIC_SCANS_PERMISSION);
  const pending = usePendingBiometricAlerts(allowed);
  const log = useBiometricScans({}, allowed);
  const acknowledge = useAcknowledgeBiometricScan();

  if (!allowed) return null;

  const alerts = pending.data?.data ?? [];
  const scans = log.data?.data ?? [];

  function handleAcknowledge(scan: BiometricScanRow) {
    acknowledge.mutate(scan.id, {
      onSuccess: () => toast.success("Aviso marcado como atendido."),
      onError: (err) =>
        toast.error(
          err instanceof ApiError ? err.message : "No se pudo marcar el aviso.",
        ),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {alerts.length > 0 ? (
        <section
          aria-live="polite"
          className="flex flex-col gap-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4"
        >
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <BellRing className="size-4" />
            Avisos del lector sin atender (
            {pending.data?.total ?? alerts.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {alerts.map((scan) => (
              <li
                key={scan.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm"
              >
                <span className="w-12 tabular-nums text-muted-foreground">
                  {formatDateTime(scan.scanned_at, TIME)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{whoOf(scan)}</span>
                  <span className="truncate text-muted-foreground">
                    {scan.message}
                  </span>
                </div>
                <StatusBadge value={scan.status} map={BIOMETRIC_STATUS_MAP} />
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    acknowledge.isPending && acknowledge.variables === scan.id
                  }
                  onClick={() => handleAcknowledge(scan)}
                >
                  <Check className="size-4" />
                  Atendido
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Marcaciones del lector</h2>
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
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {log.isPending
              ? "Cargando…"
              : "Aún no hay marcaciones del lector hoy."}
          </p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {scans.map((scan) => (
              <li
                key={scan.id}
                className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm"
              >
                <span className="w-12 tabular-nums text-muted-foreground">
                  {formatDateTime(scan.scanned_at, TIME)}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {whoOf(scan)}
                  {scan.device?.name ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {scan.device.name}
                    </span>
                  ) : null}
                </span>
                <StatusBadge value={scan.status} map={BIOMETRIC_STATUS_MAP} />
                {scan.is_alert && scan.acknowledged_at ? (
                  <span className="text-xs text-muted-foreground">
                    Atendido {formatDateTime(scan.acknowledged_at, TIME)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
