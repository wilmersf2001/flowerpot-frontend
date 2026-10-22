"use client";

import { useState } from "react";
import { MessageCircle, Phone, UserCheck } from "lucide-react";
import { Combobox, type ComboboxOption } from "@repo/ui/combobox";
import { Input } from "@repo/ui/input";
import {
  DataTable,
  EM_DASH,
  Field,
  RowActions,
  StatusBadge,
  formatDate,
  formatMoney,
  type Column,
  type StatusMap,
} from "@/features/_shared";
import { localDateOffset } from "@/features/_shared/format";
import { useHasPermission } from "@/features/tenant/auth";
import { ConvertLeadDialog, LEADS_CONVERT_PERMISSION, type LeadRow } from "@/features/tenant/leads";
import { VISIT_TYPES, VISIT_TYPE_LABELS } from "../lib/walk-in-visits.constants";
import { useVisitorsReport } from "../lib/walk-in-visits.hooks";
import type { VisitType, VisitorsReportPerson } from "../lib/walk-in-visits.types";

const TYPE_OPTIONS: ComboboxOption[] = [
  { value: "", label: "Pase y clases" },
  ...VISIT_TYPES.map((type) => ({ value: type, label: VISIT_TYPE_LABELS[type] })),
];

const CONSENT_MAP: StatusMap = {
  true: { label: "Acepta", tone: "success" },
  false: { label: "No contactar", tone: "danger" },
  null: { label: "—", tone: "neutral" },
};

/** Para `wa.me` solo valen dígitos; un número local de 9 cifras lleva el prefijo de Perú. */
function whatsappUrl(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.length === 9 ? `51${digits}` : digits}`;
}

/** Lead mínimo para precargar el diálogo de conversión desde el reporte. */
function toLeadRow(item: VisitorsReportPerson): LeadRow {
  return {
    id: item.person.id,
    name: item.person.name,
    phone: item.person.phone ?? "",
    dni: item.person.dni,
    email: null,
    birth_date: null,
    contact_consent: item.person.contact_consent,
    contact_consent_at: null,
    source: "walk_in",
    source_detail: null,
    origin: "walk_in",
    status: item.person.status as LeadRow["status"],
    interest: null,
    notes: null,
    contacted_at: null,
    converted_at: null,
    is_active: true,
    allowed_transitions: [],
    created_at: "",
    updated_at: "",
  };
}

/** Reporte de visitantes: a quién escribirle para ofrecerle una membresía. */
export function VisitorsReport() {
  const hasPermission = useHasPermission();
  const [dateFrom, setDateFrom] = useState(() => localDateOffset(-30));
  const [dateTo, setDateTo] = useState(() => localDateOffset(0));
  const [type, setType] = useState<VisitType | "">("");
  const [minVisits, setMinVisits] = useState("1");
  const [onlyConsented, setOnlyConsented] = useState(false);
  const [excludeConverted, setExcludeConverted] = useState(true);
  const [page, setPage] = useState(1);
  const [converting, setConverting] = useState<LeadRow | null>(null);

  const report = useVisitorsReport({
    page,
    date_from: dateFrom,
    date_to: dateTo,
    type,
    min_visits: minVisits,
    only_consented: onlyConsented ? "true" : "",
    exclude_converted: excludeConverted ? "true" : "",
  });
  const data = report.data;
  const summary = data?.summary;

  function reset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const columns: Column<VisitorsReportPerson>[] = [
    {
      key: "person",
      header: "Visitante",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.person.name}</span>
          <span className="text-xs text-muted-foreground">
            {row.person_type === "member" ? "Ex socio" : "Lead"} · {row.person.phone || EM_DASH}
          </span>
        </div>
      ),
    },
    {
      key: "visits",
      header: "Visitas",
      cell: (row) => <span className="tabular-nums">{row.visits_count}</span>,
    },
    {
      key: "paid",
      header: "Pagado",
      cell: (row) => <span className="tabular-nums">{formatMoney(row.total_paid)}</span>,
    },
    {
      key: "period",
      header: "Primera / última",
      cell: (row) => (
        <span className="text-muted-foreground">
          {formatDate(row.first_visit)} – {formatDate(row.last_visit)}
        </span>
      ),
    },
    {
      key: "consent",
      header: "Contacto",
      cell: (row) => <StatusBadge value={String(row.person.contact_consent)} map={CONSENT_MAP} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Desde" htmlFor="report-date-from">
          <Input
            id="report-date-from"
            type="date"
            value={dateFrom}
            max={dateTo}
            onChange={(e) => reset(setDateFrom)(e.target.value)}
          />
        </Field>
        <Field label="Hasta" htmlFor="report-date-to">
          <Input
            id="report-date-to"
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={(e) => reset(setDateTo)(e.target.value)}
          />
        </Field>
        <Field label="Tipo" htmlFor="report-type">
          <Combobox
            id="report-type"
            value={type}
            onValueChange={(value) => reset(setType)(value as VisitType | "")}
            options={TYPE_OPTIONS}
            className="w-44"
          />
        </Field>
        <Field label="Mín. visitas" htmlFor="report-min-visits">
          <Input
            id="report-min-visits"
            type="number"
            min={1}
            className="w-24"
            value={minVisits}
            onChange={(e) => reset(setMinVisits)(e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={onlyConsented}
            onChange={(e) => reset(setOnlyConsented)(e.target.checked)}
          />
          Solo con consentimiento
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={excludeConverted}
            onChange={(e) => reset(setExcludeConverted)(e.target.checked)}
          />
          Ocultar ya socios
        </label>
      </div>

      {summary ? (
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Visitas", String(summary.total_visits)],
            ["Recaudado", formatMoney(summary.total_amount)],
            ["Personas distintas", String(summary.unique_people)],
            ["Pase / clase", `${summary.day_pass_visits} / ${summary.class_visits}`],
            ["Anónimas", `${summary.anonymous_visits} · ${formatMoney(summary.anonymous_amount)}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border p-4">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {report.isError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudo cargar el reporte.{" "}
          <button type="button" className="underline underline-offset-2" onClick={() => report.refetch()}>
            Reintentar
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={(data?.people.data ?? []).map((item) => ({ ...item, id: `${item.person_type}-${item.person.id}` }))}
          isLoading={report.isPending}
          emptyMessage="Nadie cumple los filtros en este periodo."
          pagination={{
            page: data?.people.current_page ?? page,
            lastPage: data?.people.last_page ?? 1,
            total: data?.people.total ?? 0,
            from: data?.people.from ?? null,
            to: data?.people.to ?? null,
            onPageChangeAction: setPage,
            isFetching: report.isFetching,
          }}
          rowActions={(row) => (
            <RowActions
              label={`Contactar a ${row.person.name}`}
              actions={[
                Boolean(row.person.phone) && {
                  label: "WhatsApp",
                  icon: MessageCircle,
                  onSelect: () => window.open(whatsappUrl(row.person.phone!), "_blank", "noopener"),
                },
                Boolean(row.person.phone) && {
                  label: "Llamar",
                  icon: Phone,
                  onSelect: () => {
                    window.location.href = `tel:${row.person.phone!.replace(/\s/g, "")}`;
                  },
                },
                row.person_type === "lead" &&
                  hasPermission(LEADS_CONVERT_PERMISSION) && {
                    label: "Convertir en socio",
                    icon: UserCheck,
                    onSelect: () => setConverting(toLeadRow(row)),
                  },
              ]}
            />
          )}
        />
      )}

      <ConvertLeadDialog
        lead={converting}
        onOpenChangeAction={(open) => {
          if (!open) setConverting(null);
        }}
      />
    </div>
  );
}
