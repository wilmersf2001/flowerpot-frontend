"use client";

import { useState } from "react";
import { FileSpreadsheet, Plus } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/tabs";
import { ResourceHeader, SearchInput, useDebouncedValue } from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import { ConvertLeadDialog } from "./components/convert-lead-dialog";
import { DeleteLeadDialog } from "./components/delete-lead-dialog";
import { ImportLeadsDialog } from "./components/import-leads-dialog";
import { LeadFormDialog } from "./components/lead-form-dialog";
import { LeadsTable } from "./components/leads-table";
import {
  ACQUISITION_SOURCES,
  LEADS_CREATE_PERMISSION,
  LEADS_IMPORT_PERMISSION,
  LEAD_SOURCE_LABELS,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from "./lib/leads.constants";
import { useLeads } from "./lib/leads.hooks";
import type { LeadListParams, LeadOrigin, LeadRow, LeadSource, LeadStatus } from "./lib/leads.types";

const STATUS_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los estados" },
  ...LEAD_STATUSES.map((status) => ({ value: status, label: LEAD_STATUS_LABELS[status] })),
];

const SOURCE_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Todos los canales" },
  ...ACQUISITION_SOURCES.map((source) => ({ value: source, label: LEAD_SOURCE_LABELS[source] })),
];

/** Leads en dos bandejas: captación (aún no pagan) y visitantes (pagaron una visita). */
export function LeadsPage() {
  const hasPermission = useHasPermission();
  const [importing, setImporting] = useState(false);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <ResourceHeader
        title="Leads"
        description="Personas que aún no son socias: captación y visitantes que pagaron una entrada."
        action={
          <div className="flex items-center gap-2">
            {hasPermission(LEADS_IMPORT_PERMISSION) ? (
              <Button variant="outline" onClick={() => setImporting(true)}>
                <FileSpreadsheet className="size-4" />
                Importar Excel
              </Button>
            ) : null}
            {hasPermission(LEADS_CREATE_PERMISSION) ? (
              <Button onClick={() => setCreating(true)}>
                <Plus className="size-4" />
                Nuevo lead
              </Button>
            ) : null}
          </div>
        }
      />

      <Tabs defaultValue="acquisition" className="flex flex-col gap-6">
        <TabsList className="w-fit">
          <TabsTrigger value="acquisition">Captación</TabsTrigger>
          <TabsTrigger value="walk_in">Visitantes</TabsTrigger>
        </TabsList>
        <TabsContent value="acquisition">
          <LeadsInbox origin="acquisition" />
        </TabsContent>
        <TabsContent value="walk_in">
          <LeadsInbox origin="walk_in" />
        </TabsContent>
      </Tabs>

      <LeadFormDialog open={creating} onOpenChangeAction={setCreating} />
      <ImportLeadsDialog open={importing} onOpenChangeAction={setImporting} />
    </div>
  );
}

function LeadsInbox({ origin }: { origin: LeadOrigin }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<LeadStatus | "">("");
  const [source, setSource] = useState<LeadSource | "">("");
  const [onlyConsented, setOnlyConsented] = useState(false);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const params: LeadListParams = {
    page,
    search: debouncedSearch,
    origin,
    status,
    source: origin === "acquisition" ? source : "",
    contact_consent: onlyConsented ? "true" : "",
    sort_by: "created_at",
    sort_order: "desc",
  };
  const leads = useLeads(params);
  const meta = leads.data;

  const [editing, setEditing] = useState<LeadRow | null>(null);
  const [deleting, setDeleting] = useState<LeadRow | null>(null);
  const [converting, setConverting] = useState<LeadRow | null>(null);

  const hasFilters = Boolean(debouncedSearch || status || source || onlyConsented);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChangeAction={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Buscar por nombre, correo, teléfono o DNI…"
        />
        <Combobox
          value={status}
          onValueChange={(value) => {
            setStatus(value as LeadStatus | "");
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          className="w-44"
          placeholder="Estado"
        />
        {origin === "acquisition" ? (
          <Combobox
            value={source}
            onValueChange={(value) => {
              setSource(value as LeadSource | "");
              setPage(1);
            }}
            options={SOURCE_OPTIONS}
            className="w-44"
            placeholder="Canal"
          />
        ) : null}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={onlyConsented}
            onChange={(e) => {
              setOnlyConsented(e.target.checked);
              setPage(1);
            }}
          />
          Solo con consentimiento
        </label>
      </div>

      {leads.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar la lista de leads.{" "}
          <button type="button" className="underline underline-offset-2" onClick={() => leads.refetch()}>
            Reintentar
          </button>
        </div>
      ) : (
        <LeadsTable
          origin={origin}
          rows={meta?.data ?? []}
          isLoading={leads.isPending}
          onEditAction={setEditing}
          onDeleteAction={setDeleting}
          onConvertAction={setConverting}
          emptyMessage={hasFilters ? "Ningún lead coincide con los filtros." : undefined}
          pagination={{
            page: meta?.current_page ?? page,
            lastPage: meta?.last_page ?? 1,
            total: meta?.total ?? 0,
            from: meta?.from ?? null,
            to: meta?.to ?? null,
            onPageChangeAction: setPage,
            isFetching: leads.isFetching,
          }}
        />
      )}

      <LeadFormDialog
        open={editing !== null}
        lead={editing}
        onOpenChangeAction={(open) => {
          if (!open) setEditing(null);
        }}
      />
      <ConvertLeadDialog
        lead={converting}
        onOpenChangeAction={(open) => {
          if (!open) setConverting(null);
        }}
      />
      <DeleteLeadDialog
        lead={deleting}
        onOpenChangeAction={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}
