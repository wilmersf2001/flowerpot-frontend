"use client";

import { useState } from "react";
import { Ticket } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import { DayPassDialog } from "./components/day-pass-dialog";
import { RefundVisitDialog } from "./components/refund-visit-dialog";
import { VisitorsReport } from "./components/visitors-report";
import { VisitsTable } from "./components/visits-table";
import {
  DAY_PASS_CHARGE_PERMISSION,
  VISITS_REGISTER_ANONYMOUS_PERMISSION,
  VISIT_TYPES,
  VISIT_TYPE_LABELS,
} from "./lib/walk-in-visits.constants";
import { useWalkInVisits } from "./lib/walk-in-visits.hooks";
import type { VisitType, WalkInVisitRow } from "./lib/walk-in-visits.types";

const TYPE_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los tipos" },
  ...VISIT_TYPES.map((type) => ({ value: type, label: VISIT_TYPE_LABELS[type] })),
];

/** Visitas pagadas sin membresía: libro, reporte comercial y cobro de pase de día. */
export function WalkInVisitsPage() {
  const hasPermission = useHasPermission();
  const [charging, setCharging] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Visitas"
        description="Pases de día y clases sueltas de quienes no son socios, y a quién ofrecerle una membresía."
        action={
          hasPermission(DAY_PASS_CHARGE_PERMISSION) ? (
            <Button onClick={() => setCharging(true)}>
              <Ticket className="size-4" />
              Cobrar pase de día
            </Button>
          ) : null
        }
      />

      <Tabs defaultValue="ledger" className="flex flex-col gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="ledger">Libro de visitas</TabsTrigger>
          <TabsTrigger value="report">Reporte de visitantes</TabsTrigger>
        </TabsList>
        <TabsContent value="ledger">
          <VisitsLedger />
        </TabsContent>
        <TabsContent value="report">
          <VisitorsReport />
        </TabsContent>
      </Tabs>

      <DayPassDialog
        open={charging}
        canChargeAnonymous={hasPermission(VISITS_REGISTER_ANONYMOUS_PERMISSION)}
        onOpenChangeAction={setCharging}
      />
    </div>
  );
}

function VisitsLedger() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [type, setType] = useState<VisitType | "">("");
  const [includeRefunded, setIncludeRefunded] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const visits = useWalkInVisits({
    page,
    search: debouncedSearch,
    type,
    include_refunded: includeRefunded ? "true" : "",
  });
  const meta = visits.data;
  const [refunding, setRefunding] = useState<WalkInVisitRow | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChangeAction={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por nombre, teléfono o DNI…"
        />
        <Combobox
          value={type}
          onValueChange={(value) => {
            setType(value as VisitType | "");
            setPage(1);
          }}
          options={TYPE_OPTIONS}
          className="w-44"
          placeholder="Tipo"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={includeRefunded}
            onChange={(e) => {
              setIncludeRefunded(e.target.checked);
              setPage(1);
            }}
          />
          Incluir devueltas
        </label>
      </div>

      {visits.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar el libro de visitas.{" "}
          <button type="button" className="underline underline-offset-2" onClick={() => visits.refetch()}>
            Reintentar
          </button>
        </div>
      ) : (
        <VisitsTable
          rows={meta?.data ?? []}
          isLoading={visits.isPending}
          onRefundAction={setRefunding}
          emptyMessage={debouncedSearch || type ? "Ninguna visita coincide con la búsqueda." : undefined}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: visits.isFetching,
          }}
        />
      )}

      <RefundVisitDialog
        visit={refunding}
        onOpenChangeAction={(open) => {
          if (!open) setRefunding(null);
        }}
      />
    </div>
  );
}
