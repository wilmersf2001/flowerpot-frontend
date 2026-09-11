"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import {
  ResourceHeader,
  SearchInput,
  useDebouncedValue,
} from "@/features/_shared";
import type { MembershipPlanRow } from "./lib/membership-plans.types";
import { useMembershipPlans } from "./lib/membership-plans.hooks";
import { MembershipPlansTable } from "./components/membership-plans-table";
import { MembershipPlanFormDialog } from "./components/membership-plan-form-dialog";

export function MembershipPlansPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const plans = useMembershipPlans({ page, search: debouncedSearch });
  const meta = plans.data;

  // Diálogo de alta/edición: "new" para crear, un plan para editar, null cerrado.
  const [editing, setEditing] = useState<MembershipPlanRow | "new" | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Planes de membresía"
        description="Precios y duración de cada plan que se ofrece a los miembros."
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
        placeholder="Buscar por nombre…"
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
        <MembershipPlansTable
          rows={meta?.data ?? []}
          isLoading={plans.isPending}
          onEditAction={setEditing}
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

      <MembershipPlanFormDialog
        open={editing !== null}
        plan={editing === "new" ? null : editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}
