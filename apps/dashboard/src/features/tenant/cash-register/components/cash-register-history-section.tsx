"use client";

import { useState } from "react";
import { ResourceHeader } from "@/features/_shared";
import { useCashRegisterHistory } from "../lib/cash-register.hooks";
import { CashRegistersHistoryTable } from "./cash-registers-history-table";
import { CashRegisterDetailDialog } from "./cash-register-detail-dialog";
import type { CashRegisterRow } from "../lib/cash-register.types";

/** Pestaña "Historial": cajas abiertas y cerradas de la sede activa. */
export function CashRegisterHistorySection() {
  const [page, setPage] = useState(1);
  const history = useCashRegisterHistory({ page });
  const meta = history.data;

  const [viewing, setViewing] = useState<CashRegisterRow | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Historial de cajas"
        description="Aperturas y cierres de caja de la sede activa."
      />

      {history.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar el historial de cajas.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => history.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <CashRegistersHistoryTable
          rows={meta?.data ?? []}
          isLoading={history.isPending}
          onViewAction={setViewing}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: history.isFetching,
          }}
        />
      )}

      <CashRegisterDetailDialog
        register={viewing}
        onOpenChangeAction={(open) => {
          if (!open) setViewing(null);
        }}
      />
    </div>
  );
}
