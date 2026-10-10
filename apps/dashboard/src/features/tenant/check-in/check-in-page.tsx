"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CircleAlert, CircleCheck, CircleX, ScanLine } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { cn } from "@repo/ui/lib/utils";
import { useSelectedBranch } from "@/components/branch";
import { ResourceHeader, formatDate } from "@/features/_shared";
import { isDni, useCheckIn } from "./lib/check-in.hooks";
import type { CheckInOutcome } from "./lib/check-in.types";

/** Cuántos intentos recientes se muestran debajo del resultado. */
const HISTORY_SIZE = 8;

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
 * Recepción: el lector de QR "escribe" el código y pulsa Enter, o la
 * recepcionista escribe el DNI si el socio olvidó su QR. El campo queda
 * siempre enfocado para escanear un socio tras otro sin tocar el mouse.
 */
export function CheckInPage() {
  const { selectedBranch, selectedBranchId } = useSelectedBranch();
  const checkIn = useCheckIn();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [history, setHistory] = useState<CheckInOutcome[]>([]);
  const last = history[0] ?? null;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function record(outcome: Omit<CheckInOutcome, "key" | "at">) {
    const entry = { ...outcome, key: crypto.randomUUID(), at: new Date() };
    setHistory((prev) => [entry, ...prev].slice(0, HISTORY_SIZE));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = code.trim();
    if (!value || checkIn.isPending) return;
    setCode("");

    try {
      const { message, data } = await checkIn.mutateAsync(value);
      record({ code: value, status: data.status, message, data });
    } catch (err) {
      record({
        code: value,
        status: "error",
        message:
          err instanceof ApiError
            ? err.isNetworkError
              ? "No se pudo conectar con el servidor. Vuelve a intentarlo."
              : err.message
            : "No se pudo registrar la entrada.",
        data: null,
      });
    } finally {
      inputRef.current?.focus();
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
        <label htmlFor="check-in-code" className="text-sm font-medium">
          Escanea el QR del socio o escribe su DNI
        </label>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-0 flex-1">
            <ScanLine className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              id="check-in-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="MBR-… o 12345678"
              autoComplete="off"
              spellCheck={false}
              disabled={!selectedBranchId}
              className="h-12 pl-11 text-base"
            />
          </div>
          <Button
            type="submit"
            className="h-12 px-6"
            disabled={!selectedBranchId || !code.trim() || checkIn.isPending}
          >
            {checkIn.isPending ? "Verificando…" : "Registrar entrada"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {selectedBranchId
            ? code.trim() && isDni(code.trim())
              ? "Se buscará por DNI."
              : "Con un lector USB basta con escanear: el código se envía solo."
            : "Selecciona una sede en la barra superior para registrar entradas."}
        </p>
      </form>

      {last ? <OutcomeCard outcome={last} /> : <EmptyState />}

      {history.length > 1 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-muted-foreground">Intentos anteriores</h2>
          <ul className="flex flex-col divide-y rounded-xl border bg-card">
            {history.slice(1).map((entry) => {
              const tone = toneOf(entry.status);
              return (
                <li key={entry.key} className="flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="w-12 tabular-nums text-muted-foreground">
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
        </section>
      ) : null}
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
      className={cn("flex items-start gap-4 rounded-xl border p-5", TONE_STYLES[tone])}
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
          <p className="text-xs opacity-80">Código leído: {outcome.code}</p>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
      Aquí aparecerá el resultado de cada entrada: quién es, si puede pasar y
      cuántos días le quedan a su membresía.
    </div>
  );
}
