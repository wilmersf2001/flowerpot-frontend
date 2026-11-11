"use client";

import { formatDate, formatMoney } from "@/features/_shared/format";
import { useOperationsPanel } from "../lib/management.hooks";
import { occupancyStyle } from "../lib/management.constants";
import type { ManagementParams } from "../lib/management.types";
import {
  AlertBanner,
  BarList,
  ContactActions,
  Empty,
  Insight,
  KpiCard,
  KpiGrid,
  PanelState,
  ProgressBar,
  Section,
  pct,
} from "./primitives";

export function OperationsPanelView({ params }: { params: ManagementParams }) {
  const { data, isPending, error } = useOperationsPanel(params);
  return (
    <PanelState isPending={isPending} error={error}>
      {data ? <Body data={data} /> : null}
    </PanelState>
  );
}

const LEGEND = [10, 40, 60, 80, 95];

function Body({ data }: { data: NonNullable<ReturnType<typeof useOperationsPanel>["data"]> }) {
  const { attendance, peak_hours: peak, class_occupancy: cls, dormant_members: dormant, equipment } = data;

  return (
    <div className="flex flex-col gap-4">
      {peak.alert ? (
        <AlertBanner level={peak.alert.level} title="Aforo" message={peak.alert.message} />
      ) : null}

      <KpiGrid>
        <KpiCard
          label="Asistencia del mes"
          value={String(attendance.total_month)}
          trend={attendance.trend}
          changePercent={attendance.change_percent}
          hint={`prom. ${attendance.daily_average}/día`}
        />
        <KpiCard
          label="Hora más concurrida"
          value={peak.busiest_hour}
          hint={`${peak.busiest_count} personas (${pct(peak.occupancy_percent, 0)})`}
        />
        <KpiCard
          label="Ocupación de clases"
          value={pct(cls.average_percent)}
          hint={`${cls.total_attendees}/${cls.total_capacity} cupos`}
        />
        <KpiCard
          label="Equipos operativos"
          value={pct(equipment.operational_rate, 0)}
          hint={`${equipment.operational}/${equipment.total}`}
        />
      </KpiGrid>

      <Section title="Mapa de calor por hora">
        {peak.heatmap.length === 0 ? <Empty /> : null}
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
          {peak.heatmap.map((s) => {
            const st = occupancyStyle(s.occupancy);
            return (
              <div
                key={s.hour}
                className={`flex flex-col items-center rounded-md p-2 text-xs ${st.bg}`}
                title={`${s.hour}: ${s.occupancy}% (${st.label})`}
              >
                <span className="font-medium">{s.hour}</span>
                <span className="tabular-nums">{pct(s.occupancy, 0)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {LEGEND.map((l) => {
            const st = occupancyStyle(l);
            return (
              <span key={l} className="flex items-center gap-1.5">
                <span className={`size-3 rounded-sm ${st.bg.split(" ")[0]}`} />
                {st.label}
              </span>
            );
          })}
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Asistencia por día de la semana">
          <BarList
            items={attendance.by_day_of_week.map((d) => ({
              label: d.day,
              value: d.average,
              display:
                d.percent_of_capacity != null
                  ? `${d.average} · ${pct(d.percent_of_capacity, 0)} aforo`
                  : String(d.average),
            }))}
          />
        </Section>
        <Section title="Clases con mayor ocupación">
          <ul className="flex flex-col gap-3">
            {cls.top_classes.map((c) => (
              <li key={c.class_id} className="text-sm">
                <div className="mb-1 flex justify-between gap-2">
                  <span className="font-medium">
                    {c.name} <span className="font-normal text-muted-foreground">· {c.instructor}</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {c.avg_attendees}/{c.capacity}
                    {c.waitlist_avg > 0 ? ` · ${c.waitlist_avg} en espera` : ""}
                  </span>
                </div>
                <ProgressBar
                  value={c.avg_occupancy}
                  color={c.avg_occupancy >= 90 ? "bg-red-500" : c.avg_occupancy >= 70 ? "bg-amber-500" : "bg-emerald-500"}
                />
                {c.suggestion ? (
                  <p className="mt-1 text-xs text-muted-foreground">💡 {c.suggestion}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      {dormant.count > 0 ? (
        <Section title={`Miembros dormidos (${dormant.count}, inactivos > ${dormant.inactive_days} días)`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-1.5 pr-3">Socio</th>
                  <th className="pr-3">Última asistencia</th>
                  <th className="pr-3">Inactivo</th>
                  <th className="pr-3">Plan vence</th>
                  <th className="pr-3">Pagado total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {dormant.list.map((m) => (
                  <tr key={m.member_id} className="border-t">
                    <td className="py-2 pr-3 font-medium">{m.name}</td>
                    <td className="pr-3">{formatDate(m.last_attendance)}</td>
                    <td className="pr-3 tabular-nums">{m.days_inactive} días</td>
                    <td className="pr-3">{formatDate(m.plan_expires_at)}</td>
                    <td className="pr-3 tabular-nums">{formatMoney(m.total_paid_lifetime)}</td>
                    <td>
                      <ContactActions phone={m.phone} email={m.email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Insight>{dormant.insight}</Insight>
          {dormant.action ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Plantilla sugerida: «{dormant.action.template}»
            </p>
          ) : null}
        </Section>
      ) : null}

      {equipment.upcoming_maintenance.length > 0 ? (
        <Section title="Mantenimiento próximo">
          <ul className="flex flex-col gap-3">
            {equipment.upcoming_maintenance.map((e) => (
              <li key={e.equipment_id} className="text-sm">
                <div className="mb-1 flex justify-between gap-2">
                  <span className="font-medium">
                    {e.name} <span className="font-normal text-muted-foreground">· {e.type}</span>
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {e.hours_used}/{e.maintenance_threshold} h · ~{e.estimated_days_until_maintenance} días
                  </span>
                </div>
                <ProgressBar
                  value={(e.hours_used / e.maintenance_threshold) * 100}
                  color="bg-amber-500"
                />
                <p className="mt-1 text-xs text-muted-foreground">{e.alert}</p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}
