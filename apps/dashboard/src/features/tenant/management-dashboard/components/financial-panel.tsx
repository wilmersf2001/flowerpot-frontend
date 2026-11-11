"use client";

import { DonutChart } from "@/components/charts";
import { formatDateTime, formatMoney } from "@/features/_shared/format";
import { StatusBadge } from "@/features/_shared";
import { useFinancialPanel } from "../lib/management.hooks";
import { HEALTH_STATUS_MAP, RISK_MAP } from "../lib/management.constants";
import type { ManagementParams } from "../lib/management.types";
import {
  AlertBanner,
  BarList,
  ContactActions,
  KpiCard,
  KpiGrid,
  PanelState,
  ProgressBar,
  Section,
  pct,
} from "./primitives";

const BREAKDOWN_LABELS = {
  memberships: "Membresías",
  classes: "Clases",
  store: "Tienda",
  day_passes: "Pases diarios",
  maintenance: "Mantenimiento",
} as const;

export function FinancialPanelView({ params }: { params: ManagementParams }) {
  const { data, isPending, error } = useFinancialPanel(params);
  return (
    <PanelState isPending={isPending} error={error}>
      {data ? <Body data={data} /> : null}
    </PanelState>
  );
}

function Body({ data }: { data: NonNullable<ReturnType<typeof useFinancialPanel>["data"]> }) {
  const { revenue, expenses, margin, cash_register: cash, accounts_receivable: ar } = data;
  const progressColor = revenue.target_progress >= 100 ? "bg-emerald-500" : "bg-amber-500";

  return (
    <div className="flex flex-col gap-4">
      {revenue.alert ? (
        <AlertBanner level={revenue.alert.level} title="Ingresos" message={revenue.alert.message}>
          <p className="mt-2 text-xs">
            Brecha a cubrir: <strong>{formatMoney(revenue.alert.gap)}</strong>
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {revenue.alert.suggestions.map((s) => (
              <div key={s.type} className="rounded-lg border border-current/20 bg-background/60 p-2.5">
                <p className="text-sm font-medium">{s.title}</p>
                <p className="text-xs opacity-80">{s.impact}</p>
              </div>
            ))}
          </div>
        </AlertBanner>
      ) : null}
      {expenses.alert ? (
        <AlertBanner level={expenses.alert.level} title="Gastos" message={expenses.alert.message} />
      ) : null}

      <KpiGrid>
        <KpiCard
          label="Ingresos del mes"
          value={formatMoney(revenue.current)}
          trend={revenue.trend}
          changePercent={revenue.change_percent}
          hint="vs mes anterior"
        />
        <KpiCard
          label="Gastos del mes"
          value={formatMoney(expenses.current)}
          trend={expenses.trend}
          changePercent={expenses.change_percent}
          inverse
          hint="vs mes anterior"
        />
        <KpiCard
          label="Margen neto"
          value={`${formatMoney(margin.net)} (${pct(margin.percent)})`}
          status={margin.status}
          statusMap={HEALTH_STATUS_MAP}
          hint={`Industria ${margin.benchmark.industry_average}%`}
        />
        <KpiCard
          label={cash.status === "open" ? "Caja abierta" : "Caja cerrada"}
          value={formatMoney(cash.balance)}
          hint={cash.opened_by ? `${cash.opened_by} · ${formatDateTime(cash.opened_at)}` : undefined}
        />
      </KpiGrid>

      <Section title="Progreso hacia la meta">
        <ProgressBar value={revenue.target_progress} color={progressColor} />
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm">
          <span>{pct(revenue.target_progress)} de la meta</span>
          <span className="tabular-nums text-muted-foreground">
            {formatMoney(revenue.current)} / {formatMoney(revenue.target)}
          </span>
        </div>
        {data.projection ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Proyección a fin de mes: {formatMoney(data.projection.end_of_month)} (confianza{" "}
            {data.projection.confidence})
          </p>
        ) : null}
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Desglose de ingresos">
          <DonutChart
            ariaLabel="Desglose de ingresos"
            formatValue={formatMoney}
            data={Object.entries(revenue.breakdown).map(([k, v]) => ({
              name: BREAKDOWN_LABELS[k as keyof typeof BREAKDOWN_LABELS] ?? k,
              value: v,
            }))}
          />
        </Section>
        <Section title="Principales categorías de gasto">
          <BarList
            barClass="bg-red-500"
            format={formatMoney}
            items={expenses.top_categories.map((c) => ({
              label: c.name,
              value: c.amount,
              display: `${formatMoney(c.amount)} · ${pct(c.percent, 0)}`,
              color: expenses.alert?.anomalies.some((a) => a.category === c.name && a.is_anomaly)
                ? "bg-red-500"
                : "bg-slate-400",
            }))}
          />
        </Section>
      </div>

      {ar.overdue > 0 ? (
        <Section title={`Cuentas por cobrar — vencido ${formatMoney(ar.overdue)} de ${formatMoney(ar.total)} (${ar.members_count} socios)`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-3">Socio</th>
                  <th className="pr-3">Monto</th>
                  <th className="pr-3">Días vencido</th>
                  <th className="pr-3">Riesgo</th>
                  <th className="pr-3">Acción sugerida</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {ar.priority_contacts.map((c) => (
                  <tr key={c.member_id} className="border-t">
                    <td className="py-2 pr-3 font-medium">{c.name}</td>
                    <td className="pr-3 tabular-nums">{formatMoney(c.amount)}</td>
                    <td className="pr-3 tabular-nums">{c.days_overdue}</td>
                    <td className="pr-3">
                      <StatusBadge value={c.risk_score} map={RISK_MAP} />
                    </td>
                    <td className="pr-3 text-muted-foreground">{c.suggested_action}</td>
                    <td>
                      <ContactActions phone={c.phone} email={c.email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}
    </div>
  );
}
