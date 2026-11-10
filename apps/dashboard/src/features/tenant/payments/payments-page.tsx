"use client";

import { useState } from "react";
import { AlertTriangle, Plus, Wallet } from "lucide-react";
import { useCurrentCashRegister } from "@/features/tenant/cash-register";
import { Button } from "@repo/ui/button";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import type { PaymentRow } from "./lib/payments.types";
import { usePayments } from "./lib/payments.hooks";
import { PaymentsTable } from "./components/payments-table";
import { PaymentFormDialog } from "./components/payment-form-dialog";
import { PaymentNotesDialog } from "./components/payment-notes-dialog";
import { AddInstallmentDialog } from "./components/add-installment-dialog";
import { RefundPaymentDialog } from "./components/refund-payment-dialog";
import { DeletePaymentDialog } from "./components/delete-payment-dialog";

/** Pantalla de pagos: lista + búsqueda + paginación + alta manual + abonos + reembolso + borrado. */
export function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const currentRegister = useCurrentCashRegister();
  const payments = usePayments({ page, search: debouncedSearch });
  const meta = payments.data;

  const [creating, setCreating] = useState(false);
  const [editingNotes, setEditingNotes] = useState<PaymentRow | null>(null);
  const [addingInstallment, setAddingInstallment] = useState<PaymentRow | null>(null);
  const [refunding, setRefunding] = useState<PaymentRow | null>(null);
  const [deleting, setDeleting] = useState<PaymentRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Pagos"
        description="Cobros de membresías y otros conceptos."
        action={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Registrar pago
          </Button>
        }
      />

      {!currentRegister.isPending && !currentRegister.isError ? (
        currentRegister.data == null ? (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4 shrink-0" />
            No hay una caja abierta en esta sede: los pagos en efectivo no se sumarán a caja.
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            <Wallet className="size-4 shrink-0" />
            Hay una caja abierta: los pagos en efectivo se sumarán a caja.
          </div>
        )
      ) : null}

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por socio…"
      />

      {payments.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de pagos.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => payments.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <PaymentsTable
          rows={meta?.data ?? []}
          isLoading={payments.isPending}
          onEditNotesAction={setEditingNotes}
          onAddInstallmentAction={setAddingInstallment}
          onRefundAction={setRefunding}
          onDeleteAction={setDeleting}
          emptyMessage={
            debouncedSearch ? "Ningún pago coincide con la búsqueda." : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: payments.isFetching,
          }}
        />
      )}

      <PaymentFormDialog open={creating} onOpenChangeAction={setCreating} />
      <PaymentNotesDialog
        payment={editingNotes}
        onOpenChangeAction={(open) => {
          if (!open) setEditingNotes(null);
        }}
      />
      <AddInstallmentDialog
        payment={addingInstallment}
        onOpenChangeAction={(open) => {
          if (!open) setAddingInstallment(null);
        }}
      />
      <RefundPaymentDialog
        payment={refunding}
        onOpenChangeAction={(open) => {
          if (!open) setRefunding(null);
        }}
      />
      <DeletePaymentDialog
        payment={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
