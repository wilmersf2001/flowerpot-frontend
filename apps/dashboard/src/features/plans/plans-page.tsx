"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  ResourceHeader,
  SearchInput,
  useDebouncedValue,
} from "@/features/_shared";
import type { PlanRow } from "./lib/plans.types";
import { usePlans } from "./lib/plans.hooks";
import { PlansTable } from "./components/plans-table";
import { PlanFormDialog } from "./components/plan-form-dialog";
import { PlanCredentialsDialog } from "./components/plan-credentials-dialog";
import { DeletePlanDialog } from "./components/delete-plan-dialog";

export function PlansPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  // El backend recibe este texto como `search` (nombre o identificador del plan).
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const plans = usePlans({ page, search: debouncedSearch });
  const meta = plans.data;

  // Diálogo de alta/edición: "new" para crear, un plan para editar, null cerrado.
  const [editing, setEditing] = useState<PlanRow | "new" | null>(null);
  // Plan recién creado: dispara el diálogo de resumen.
  const [created, setCreated] = useState<PlanRow | null>(null);
  const [toDelete, setToDelete] = useState<PlanRow | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Planes"
        description="Alta, baja y estado de cada plan del SaaS."
        action={
          <Button onClick={() => setEditing("new")}>
            <Plus className="size-4" />
            Nuevo plan
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChangeAction={handleSearch}
        placeholder="Buscar por identificador…"
      />

      {plans.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de planes.{" "}
          <button
            type="button"
            className="underline underline-offset-2"
            onClick={() => plans.refetch()}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <PlansTable
          rows={meta?.data ?? []}
          isLoading={plans.isPending}
          onEditAction={setEditing}
          onDeleteAction={setToDelete}
          emptyMessage={
            debouncedSearch
              ? "Ningún plan coincide con la búsqueda."
              : undefined
          }
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: plans.isFetching,
          }}
        />
      )}

      <PlanFormDialog
        open={editing !== null}
        plan={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
        onCreatedAction={setCreated}
      />
      <PlanCredentialsDialog
        result={created}
        onCloseAction={() => setCreated(null)}
      />
      <DeletePlanDialog
        plan={toDelete}
        onOpenChangeAction={(open) => {
          if (!open) setToDelete(null);
        }}
      />
    </div>
  );
}
