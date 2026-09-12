"use client";

import { useState } from "react";
import { Lock, Plus, Unlock } from "lucide-react";
import { Button } from "@repo/ui/button";
import { ResourceHeader } from "@/features/_shared";
import {
  useCurrentCashMovements,
  useCurrentCashRegister,
  useCurrentCashRegisterSummary,
} from "../lib/cash-register.hooks";
import { CashRegisterSummaryCard } from "./cash-register-summary-card";
import { CashMovementsTable } from "./cash-movements-table";
import { OpenCashRegisterDialog } from "./open-cash-register-dialog";
import { CloseCashRegisterDialog } from "./close-cash-register-dialog";
import { CashMovementFormDialog } from "./cash-movement-form-dialog";
import { VoidCashMovementDialog } from "./void-cash-movement-dialog";
import type { CashMovementRow, CashRegisterRow } from "../lib/cash-register.types";

/** Pestaña "Caja actual": sin caja abierta ofrece abrirla; con caja, resumen + movimientos. */
export function CurrentCashRegisterSection() {
  const [page, setPage] = useState(1);
  const register = useCurrentCashRegister();
  const summary = useCurrentCashRegisterSummary(register.data != null);
  const movements = useCurrentCashMovements({ page }, register.data != null);

  const [opening, setOpening] = useState(false);
  const [closing, setClosing] = useState<CashRegisterRow | null>(null);
  const [creatingMovement, setCreatingMovement] = useState(false);
  const [voiding, setVoiding] = useState<CashMovementRow | null>(null);

  if (register.isPending) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Cargando caja…</p>;
  }

  if (register.data == null) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm text-muted-foreground">
          No hay una caja abierta para esta sede. Ábrela para empezar a registrar movimientos.
        </p>
        <Button onClick={() => setOpening(true)}>
          <Unlock className="size-4" />
          Abrir caja
        </Button>
        <OpenCashRegisterDialog open={opening} onOpenChangeAction={setOpening} />
      </div>
    );
  }

  const meta = movements.data;

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Caja actual"
        description="Movimientos de la caja abierta de la sede activa."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreatingMovement(true)}>
              <Plus className="size-4" />
              Nuevo movimiento
            </Button>
            <Button variant="destructive" onClick={() => setClosing(register.data)}>
              <Lock className="size-4" />
              Cerrar caja
            </Button>
          </div>
        }
      />

      <CashRegisterSummaryCard
        register={register.data}
        summary={summary.data}
        isLoading={summary.isPending}
      />

      <CashMovementsTable
        rows={meta?.data ?? []}
        isLoading={movements.isPending}
        onVoidAction={setVoiding}
        pagination={{
          page: meta?.current_page ?? page,
          lastPage: meta?.last_page ?? 1,
          total: meta?.total ?? 0,
          from: meta?.from ?? null,
          to: meta?.to ?? null,
          onPageChangeAction: setPage,
          isFetching: movements.isFetching,
        }}
      />

      <CloseCashRegisterDialog
        register={closing}
        onOpenChangeAction={(open) => {
          if (!open) setClosing(null);
        }}
      />
      <CashMovementFormDialog open={creatingMovement} onOpenChangeAction={setCreatingMovement} />
      <VoidCashMovementDialog
        movement={voiding}
        onOpenChangeAction={(open) => {
          if (!open) setVoiding(null);
        }}
      />
    </div>
  );
}
