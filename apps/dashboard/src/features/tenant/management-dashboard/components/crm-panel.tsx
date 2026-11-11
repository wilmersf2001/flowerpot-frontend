"use client";

import { formatMoney } from "@/features/_shared/format";
import { useCrmPanel } from "../lib/management.hooks";
import { HEALTH_STATUS_MAP } from "../lib/management.constants";
import type { ManagementParams } from "../lib/management.types";
import {
  AlertBanner,
  BarList,
  Insight,
  KpiCard,
  KpiGrid,
  PanelState,
  Section,
  pct,
} from "./primitives";

export function CrmPanelView({ params }: { params: ManagementParams }) {
  const { data, isPending, error } = useCrmPanel(params);
  return (
    <PanelState isPending={isPending} error={error}>
      {data ? <Body data={data} /> : null}
    </PanelState>
  );
}

function trendOf(change: number | undefined): "up" | "down" | "stable" {
  return change == null || change === 0 ? "stable" : change > 0 ? "up" : "down";
}

function Body({ data }: { data: NonNullable<ReturnType<typeof useCrmPanel>["data"]> }) {
  const { funnel, conversion_by_promo: promo, response_time: rt, lost_reasons: lost, by_source: src } = data;

  const stages = [
    { label: "Leads", value: funnel.leads.count, color: "bg-sky-500", conv: null as number | null },
    { label: "Visitaron", value: funnel.visited.count, color: "bg-amber-500", conv: funnel.visited.conversion_from_leads },
    { label: "Convertidos", value: funnel.converted.count, color: "bg-emerald-500", conv: funnel.converted.conversion_from_visited },
  ];
  const top = Math.max(stages[0]!.value, 1);

  return (
    <div className="flex flex-col gap-4">
      {funnel.alert ? (
        <AlertBanner level={funnel.alert.level} title="Conversión" message={funnel.alert.message} />
      ) : null}

      <KpiGrid>
        <KpiCard label="Leads" value={String(funnel.leads.count)} trend={trendOf(funnel.leads.change_percent)} changePercent={funnel.leads.change_percent} hint={funnel.leads.change_percent != null ? "vs mes anterior" : undefined} />
        <KpiCard label="Visitas" value={String(funnel.visited.count)} trend={trendOf(funnel.visited.change_percent)} changePercent={funnel.visited.change_percent} hint={funnel.visited.change_percent != null ? "vs mes anterior" : `${pct(funnel.visited.conversion_from_leads, 0)} de leads`} />
        <KpiCard label="Convertidos" value={String(funnel.converted.count)} trend={trendOf(funnel.converted.change_percent)} changePercent={funnel.converted.change_percent} hint={`${pct(funnel.converted.conversion_from_leads, 0)} de leads`} />
        <KpiCard label="Tiempo de respuesta" value={`${rt.average_hours} h`} status={rt.status} statusMap={HEALTH_STATUS_MAP} hint={`meta ${rt.target_hours} h`} />
      </KpiGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Embudo de conversión">
          <div className="flex flex-col items-center gap-2">
            {stages.map((s) => (
              <div
                key={s.label}
                className={`flex min-w-24 flex-col items-center rounded-md py-2 text-white ${s.color}`}
                style={{ width: `${Math.max((s.value / top) * 100, 20)}%` }}
              >
                <span className="text-xs">{s.label}</span>
                <span className="font-semibold tabular-nums">
                  {s.value}
                  {s.conv != null ? ` · ${pct(s.conv, 0)}` : ""}
                </span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Conversión por tiempo de respuesta">
          <BarList
            barClass="bg-violet-500"
            items={rt.distribution.map((d) => ({
              label: d.range,
              value: d.conversion_rate,
              display: `${pct(d.conversion_rate, 0)} · ${d.count} leads`,
            }))}
          />
          <Insight>{rt.benchmark_message}</Insight>
        </Section>
      </div>

      <Section title="Rendimiento por fuente">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-1.5 pr-3">Fuente</th>
                <th className="pr-3">Leads</th>
                <th className="pr-3">Convertidos</th>
                <th className="pr-3">Conversión</th>
                <th className="pr-3">Costo/lead</th>
                <th className="pr-3">Costo/adquisición</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              {src.sources.map((s) => (
                <tr key={s.source} className="border-t">
                  <td className="py-2 pr-3 font-medium">{s.source}</td>
                  <td className="pr-3 tabular-nums">{s.leads}</td>
                  <td className="pr-3 tabular-nums">{s.converted}</td>
                  <td className="pr-3 tabular-nums">{pct(s.conversion_rate, 0)}</td>
                  <td className="pr-3 tabular-nums">{s.cost_per_lead != null ? formatMoney(s.cost_per_lead) : "—"}</td>
                  <td className="pr-3 tabular-nums">{s.cost_per_acquisition != null ? formatMoney(s.cost_per_acquisition) : "—"}</td>
                  <td className="tabular-nums">{pct(s.roi, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Insight>{src.recommendation}</Insight>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Promociones">
          <ul className="flex flex-col gap-2 text-sm">
            {promo.with_promo.map((p) => (
              <li key={p.promo_code} className="flex justify-between gap-2">
                <span className="font-medium">{p.promo_code}</span>
                <span className="tabular-nums text-muted-foreground">
                  {pct(p.conversion_rate, 0)} · {p.converted}/{p.leads}{p.revenue_generated != null ? ` · ${formatMoney(p.revenue_generated)}` : ""}
                </span>
              </li>
            ))}
            {promo.without_promo ? (
            <li className="flex justify-between gap-2 border-t pt-2">
              <span>Sin promoción</span>
              <span className="tabular-nums text-muted-foreground">
                {pct(promo.without_promo.conversion_rate, 0)} · {promo.without_promo.converted}/{promo.without_promo.leads}
              </span>
            </li>
            ) : null}
          </ul>
          <Insight>{promo.insight}</Insight>
        </Section>
        <Section title={`Razones de pérdida (${lost.total_lost})`}>
          <BarList
            barClass="bg-red-500"
            items={lost.top_reasons.map((r) => ({
              label: r.reason,
              value: r.count,
              display: `${r.count} · ${pct(r.percent, 0)}`,
            }))}
          />
          <Insight>{lost.action}</Insight>
        </Section>
      </div>
    </div>
  );
}
