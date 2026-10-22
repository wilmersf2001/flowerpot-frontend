"use client";

import { ArrowRight, Pencil, Trash2, UserCheck, UserX } from "lucide-react";
import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import {
  DataTable,
  EM_DASH,
  RowActions,
  StatusBadge,
  formatDate,
  type Column,
  type DataTablePagination,
  type StatusMap,
} from "@/features/_shared";
import { useHasPermission } from "@/features/tenant/auth";
import {
  LEADS_CONVERT_PERMISSION,
  LEADS_DELETE_PERMISSION,
  LEADS_EDIT_PERMISSION,
  LEADS_FOLLOWUP_PERMISSION,
  LEAD_INTEREST_LABELS,
  LEAD_SOURCE_LABELS,
} from "../lib/leads.constants";
import { useAdvanceLead, useLoseLead } from "../lib/leads.hooks";
import type { LeadOrigin, LeadRow } from "../lib/leads.types";

export const LEAD_STATUS_MAP: StatusMap = {
  new: { label: "Nuevo", tone: "info" },
  contacted: { label: "Contactado", tone: "warning" },
  interested: { label: "Interesado", tone: "warning" },
  converted: { label: "Convertido", tone: "success" },
  lost: { label: "Perdido", tone: "danger" },
};

const CONSENT_MAP: StatusMap = {
  true: { label: "Acepta", tone: "success" },
  false: { label: "No contactar", tone: "danger" },
  null: { label: "Sin preguntar", tone: "neutral" },
};

const baseColumns: Column<LeadRow>[] = [
  {
    key: "name",
    header: "Lead",
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.name}</span>
        <span className="text-xs text-muted-foreground">{row.dni || EM_DASH}</span>
      </div>
    ),
  },
  {
    key: "contact",
    header: "Contacto",
    cell: (row) => (
      <div className="flex flex-col">
        <span>{row.phone}</span>
        <span className="text-xs text-muted-foreground">{row.email || EM_DASH}</span>
      </div>
    ),
  },
  {
    key: "consent",
    header: "Contacto permitido",
    cell: (row) => <StatusBadge value={String(row.contact_consent)} map={CONSENT_MAP} />,
  },
];

function originColumns(origin: LeadOrigin): Column<LeadRow>[] {
  if (origin === "walk_in") {
    return [
      {
        key: "visits_count",
        header: "Visitas",
        cell: (row) => <span className="tabular-nums">{row.visits_count ?? 0}</span>,
      },
      {
        key: "last_visit_on",
        header: "Última visita",
        cell: (row) => (
          <span className="text-muted-foreground">
            {row.last_visit_on ? formatDate(row.last_visit_on) : EM_DASH}
          </span>
        ),
      },
    ];
  }
  return [
    {
      key: "source",
      header: "Origen",
      cell: (row) => (
        <div className="flex flex-col">
          <span>{row.source_detail || LEAD_SOURCE_LABELS[row.source]}</span>
          <span className="text-xs text-muted-foreground">{LEAD_SOURCE_LABELS[row.source]}</span>
        </div>
      ),
    },
    {
      key: "interest",
      header: "Interés",
      cell: (row) => (
        <span className="text-muted-foreground">
          {row.interest ? LEAD_INTEREST_LABELS[row.interest] : EM_DASH}
        </span>
      ),
    },
  ];
}

const statusColumn: Column<LeadRow> = {
  key: "status",
  header: "Estado",
  cell: (row) => <StatusBadge value={row.status} map={LEAD_STATUS_MAP} />,
};

export function LeadsTable({
  origin,
  rows,
  isLoading,
  onEditAction,
  onDeleteAction,
  onConvertAction,
  pagination,
  emptyMessage = "Aún no hay leads en esta bandeja.",
}: {
  origin: LeadOrigin;
  rows: LeadRow[];
  isLoading: boolean;
  onEditAction: (lead: LeadRow) => void;
  onDeleteAction: (lead: LeadRow) => void;
  onConvertAction: (lead: LeadRow) => void;
  pagination?: DataTablePagination;
  emptyMessage?: string;
}) {
  const hasPermission = useHasPermission();
  const advanceLead = useAdvanceLead();
  const loseLead = useLoseLead();

  const columns = [...baseColumns, ...originColumns(origin), statusColumn];

  function run(
    promise: Promise<unknown>,
    lead: LeadRow,
    success: string,
    fallback: string,
  ) {
    promise
      .then(() => toast.success(success.replace("{name}", lead.name)))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : fallback));
  }

  return (
    <DataTable
      columns={columns}
      rows={rows}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      pagination={pagination}
      rowActions={(row) => {
        const next = row.allowed_transitions.find((t) => t.value !== "lost" && t.value !== "converted");
        const canLose = row.allowed_transitions.some((t) => t.value === "lost");
        const isOpen = row.status !== "converted" && row.status !== "lost";
        return (
          <RowActions
            label={`Acciones de ${row.name}`}
            actions={[
              hasPermission(LEADS_EDIT_PERMISSION) && {
                label: "Editar",
                icon: Pencil,
                onSelect: () => onEditAction(row),
              },
              hasPermission(LEADS_FOLLOWUP_PERMISSION) &&
                next && {
                  label: `Marcar ${next.label.toLowerCase()}`,
                  icon: ArrowRight,
                  disabled: advanceLead.isPending,
                  onSelect: () =>
                    run(
                      advanceLead.mutateAsync(row.id),
                      row,
                      `"{name}" marcado como ${next.label.toLowerCase()}.`,
                      "No se pudo avanzar el lead.",
                    ),
                },
              hasPermission(LEADS_FOLLOWUP_PERMISSION) &&
                canLose && {
                  label: "Marcar perdido",
                  icon: UserX,
                  disabled: loseLead.isPending,
                  onSelect: () =>
                    run(
                      loseLead.mutateAsync(row.id),
                      row,
                      `"{name}" marcado como perdido.`,
                      "No se pudo marcar el lead como perdido.",
                    ),
                },
              hasPermission(LEADS_CONVERT_PERMISSION) &&
                isOpen && {
                  label: "Convertir en socio",
                  icon: UserCheck,
                  onSelect: () => onConvertAction(row),
                },
              hasPermission(LEADS_DELETE_PERMISSION) && {
                label: "Eliminar",
                icon: Trash2,
                variant: "destructive",
                separatorBefore: true,
                onSelect: () => onDeleteAction(row),
              },
            ]}
          />
        );
      }}
    />
  );
}
