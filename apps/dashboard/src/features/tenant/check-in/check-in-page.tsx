"use client";

import { useState } from "react";
import { CircleAlert, CircleCheck, CircleX, Smartphone } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { Badge } from "@repo/ui/badge";
import { cn } from "@repo/ui/lib/utils";
import { useSelectedBranch } from "@/components/branch";
import { ResourceHeader, formatDate } from "@/features/_shared";
import { BiometricScansPanel } from "@/features/tenant/biometric-scans";
import { useCheckIn } from "./lib/check-in.hooks";
import type { CheckInOutcome } from "./lib/check-in.types";
import { QrCameraScanner } from "./qr-camera-scanner";

/** Cuántos intentos recientes se muestran debajo del resultado. */
const HISTORY_SIZE = 5;

type Tone = "success" | "warning" | "danger";

/** "Ya entró hoy" no es un error: el socio puede pasar, solo no se duplica. */
function toneOf(status: CheckInOutcome["status"]): Tone {
  if (status === "success") return "success";
  if (status === "already_checked_in") return "warning";
  return "danger";
}

const TONE_STYLES: Record<Tone, string> = {
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-100",
  warning:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-100",
  danger: "border-destructive/40 bg-destructive/5 text-destructive dark:bg-destructive/15",
};

const TONE_ICONS = { success: CircleCheck, warning: CircleAlert, danger: CircleX };

const TONE_LABELS: Record<Tone, string> = {
  success: "Puede pasar",
  warning: "Ya entró hoy",
  danger: "No puede pasar",
};

/**
 * Recepción. En el celular (puntero táctil) se muestra el lector de QR con la
 * cámara: si el código es válido, queda registrada la asistencia. En el
 * escritorio no hay escáner: solo el seguimiento de las marcaciones del lector
 * biométrico.
 */
export function CheckInPage() {
  const { selectedBranch, selectedBranchId } = useSelectedBranch();
  const checkIn = useCheckIn();
  const [history, setHistory] = useState<CheckInOutcome[]>([]);
  const last = history[0] ?? null;

  function record(outcome: Omit<CheckInOutcome, "key" | "at">) {
    const entry = { ...outcome, key: crypto.randomUUID(), at: new Date() };
    setHistory((prev) => [entry, ...prev].slice(0, HISTORY_SIZE));
  }

  async function handleScan(code: string) {
    if (checkIn.isPending) return;

    try {
      const { message, data } = await checkIn.mutateAsync(code);
      record({ code, status: data.status, message, data });
    } catch (err) {
      record({
        code,
        status: "error",
        message:
          err instanceof ApiError
            ? err.isNetworkError
              ? "No se pudo conectar con el servidor. Vuelve a intentarlo."
              : err.message
            : "No se pudo registrar la entrada.",
        data: null,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Check-in"
        description={
          selectedBranch
            ? `Control de acceso en recepción · ${selectedBranch.name}`
            : "Control de acceso en recepción."
        }
      />

      {/* Solo dispositivos táctiles: el escritorio no registra entradas. */}
      <section className="hidden flex-col gap-4 pointer-coarse:flex">
        <div className="rounded-2xl border bg-card p-4">
          <QrCameraScanner
            onScan={handleScan}
            paused={checkIn.isPending}
            disabled={!selectedBranchId}
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {selectedBranchId
              ? checkIn.isPending
                ? "Verificando…"
                : "Apunta al QR del socio: la entrada se registra sola."
              : "Selecciona una sede en la barra superior para registrar entradas."}
          </p>
        </div>

        {last ? <OutcomeCard outcome={last} /> : null}

        {history.length > 1 ? (
          <ul className="flex flex-col divide-y rounded-xl border bg-card">
            {history.slice(1).map((entry) => {
              const tone = toneOf(entry.status);
              return (
                <li key={entry.key} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="tabular-nums text-muted-foreground">
                    {entry.at.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {entry.data?.member?.full_name ?? entry.code}
                  </span>
                  <Badge tone={tone} variant="soft">
                    {TONE_LABELS[tone]}
                  </Badge>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <p className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground pointer-coarse:hidden">
        <Smartphone className="size-4 shrink-0" />
        Para registrar entradas con el QR, abre esta pantalla desde un celular.
      </p>

      <BiometricScansPanel />
    </div>
  );
}

function OutcomeCard({ outcome }: { outcome: CheckInOutcome }) {
  const tone = toneOf(outcome.status);
  const Icon = TONE_ICONS[tone];
  const membership = outcome.data?.membership;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-start gap-4 rounded-2xl border p-5", TONE_STYLES[tone])}
    >
      <Icon className="mt-0.5 size-8 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {TONE_LABELS[tone]}
        </span>
        <p className="text-lg font-semibold">{outcome.message}</p>
        {membership && tone !== "danger" ? (
          <p className="text-sm opacity-90">
            {membership.plan_name} · vence el {formatDate(membership.ends_at)} ·{" "}
            {membership.days_remaining} {membership.days_remaining === 1 ? "día" : "días"} restantes
          </p>
        ) : null}
        {!outcome.data?.member ? (
          <p className="break-all text-xs opacity-80">Código leído: {outcome.code}</p>
        ) : null}
      </div>
    </div>
  );
}
