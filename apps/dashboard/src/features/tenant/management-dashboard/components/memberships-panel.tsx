"use client";

import { LineChart } from "@/components/charts";
import { formatDate, formatMoney } from "@/features/_shared/format";
import { StatusBadge } from "@/features/_shared";
import { useMembershipsPanel } from "../lib/management.hooks";
import { HEALTH_STATUS_MAP, RISK_MAP } from "../lib/management.constants";
import type { ManagementParams } from "../lib/management.types";
import {
  AlertBanner,
  BarList,
  ContactActions,
  Insight,
  KpiCard,
  KpiGrid,
  PanelState,
  ProgressBar,
  Section,
  pct,
} from "./primitives";

export function MembershipsPanelView({ params }: { params: ManagementParams }) {
  const { data, isPending, error } = useMembershipsPanel(params);
  return (
    <PanelState isPending={isPending} error={error}>
      {data ? <Body data={data} /> : null}
    </PanelState>
  );
}

function Body({ data }: { data: NonNullable<ReturnType<typeof useMembershipsPanel>["data"]> }) {
  const { active_members: active, new_members: nu, churned_members: churn } = data;
  const exp = data.expiring_soon;
  const evolution = buildEvolution(active.history, active.prediction.in_3_months);

  return (
    <div className="flex flex-col gap-4">
      {churn.alert ? (
        <AlertBanner level={churn.alert.level} title="Bajas" message={churn.alert.message} />
      ) : null}

      <KpiGrid>
        <KpiCard
          label="Miembros activos"
          value={String(active.current)}
          trend={active.trend}
          changePercent={active.change_percent}
          hint="vs mes anterior"
        />
        <KpiCard
          label="Nuevas inscripciones"
          value={String(nu.current)}
          trend={nu.trend}
          changePercent={nu.change_percent}
          hint="vs mes anterior"
        />
        <KpiCard
          label="Retención"
          value={pct(data.retention_rate.current)}
          status={data.retention_rate.status}
          statusMap={HEALTH_STATUS_MAP}
          hint={`Industria ${data.retention_rate.industry_benchmark.min}–${data.retention_rate.industry_benchmark.ideal}%`}
        />
        <KpiCard
          label="Churn"
          value={pct(data.churn_rate.current)}
          status={data.churn_rate.status}
          statusMap={HEALTH_STATUS_MAP}
          hint={`Industria ${data.churn_rate.industry_benchmark.min}–${data.churn_rate.industry_benchmark.max}%`}
        />
      </KpiGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Evolución de miembros activos">
          <LineChart
            ariaLabel="Evolución de miembros activos"
            xKey="label"
            series={[
              { key: "actual", label: "Miembros activos" },
              { key: "forecast", label: "Predicción", dashed: true },
            ]}
            data={evolution}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Línea punteada: predicción a 3 meses (confianza {active.prediction.confidence}).
          </p>
        </Section>
        <Section title="Fuentes de nuevos miembros">
          <BarList
            items={nu.by_source.map((s) => ({
              label: s.source,
              value: s.count,
              display: `${s.count} · ${pct(s.percent, 0)}`,
            }))}
          />
          <Insight>{nu.insight}</Insight>
        </Section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title={`Motivos de baja (${churn.current})`}>
          <BarList
            barClass="bg-red-500"
            items={churn.reasons.map((r) => ({
              label: r.reason,
              value: r.count,
              display: `${r.count} · ${pct(r.percent, 0)}`,
            }))}
          />
        </Section>
        <Section title="Valor de vida (LTV)">
          <p className="text-2xl font-semibold tabular-nums">
            {formatMoney(data.lifetime_value.average_revenue)}
          </p>
          <p className="text-sm text-muted-foreground">{data.lifetime_value.message}</p>
        </Section>
      </div>

      <Section title="Vencimientos próximos">
        <div className="mb-3 flex flex-wrap gap-4 text-sm">
          <span>7 días: <strong>{exp.next_7_days}</strong></span>
          <span>15 días: <strong>{exp.next_15_days}</strong></span>
          <span>30 días: <strong>{exp.next_30_days}</strong></span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-1.5 pr-3">Miembro</th>
                <th className="pr-3">Plan</th>
                <th className="pr-3">Vence</th>
                <th className="pr-3">Asistencia 30d</th>
                <th className="pr-3">Renovación</th>
                <th className="pr-3">Riesgo</th>
                <th className="pr-3">Acción sugerida</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {exp.priority_list.map((m) => (
                <tr key={m.member_id} className="border-t">
                  <td className="py-2 pr-3 font-medium">{m.name}</td>
                  <td className="pr-3">{m.plan_name ?? "—"}</td>
                  <td className="pr-3">
                    {formatDate(m.expires_at)}
                    <span className="block text-xs text-muted-foreground">
                      {m.days_until_expiry === 0 ? "hoy" : `en ${m.days_until_expiry} días`}
                    </span>
                  </td>
                  <td className="pr-3 tabular-nums">
                    {m.attendance_last_30_days ?? "—"}
                    {m.avg_attendance_per_month != null ? (
                      <span className="block text-xs text-muted-foreground">
                        prom. {m.avg_attendance_per_month}
                      </span>
                    ) : null}
                  </td>
                  <td className="w-28 pr-3">
                    <ProgressBar
                      value={m.renewal_probability}
                      color={m.renewal_probability >= 70 ? "bg-emerald-500" : m.renewal_probability >= 50 ? "bg-amber-500" : "bg-red-500"}
                    />
                    <span className="text-xs tabular-nums">{m.renewal_probability}%</span>
                  </td>
                  <td className="pr-3">
                    <StatusBadge value={m.risk} map={RISK_MAP} />
                  </td>
                  <td className="pr-3 text-muted-foreground">{m.suggested_action ?? ""}</td>
                  <td>
                    <ContactActions phone={m.phone} email={m.email} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Insight>{exp.action}</Insight>
      </Section>
    </div>
  );
}

/**
 * Serie real + tramo punteado de predicción. El último punto real también
 * inicia la serie `forecast` para que la línea punteada salga de él.
 */
function buildEvolution(history: Array<{ month: string; count: number }>, predicted: number) {
  const rows: Array<{ label: string; actual: number | null; forecast: number | null }> =
    history.map((h) => ({ label: h.month.slice(0, 3), actual: h.count, forecast: null }));
  const last = rows[rows.length - 1];
  if (last) last.forecast = last.actual;
  rows.push({ label: "+3m", actual: null, forecast: predicted });
  return rows;
}
