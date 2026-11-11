import { apiClient, unwrapEnvelope } from "@repo/api-client";
import { MANAGEMENT_ENDPOINT } from "./management.constants";
import type {
  CrmPanel,
  ExpiringMember,
  FinancialPanel,
  ManagementDashboard,
  ManagementParams,
  MembershipsPanel,
  OperationsPanel,
  Trend,
} from "./management.types";

async function get<T>(path: string, params: ManagementParams): Promise<T> {
  const { data } = await apiClient.get<unknown>(`${MANAGEMENT_ENDPOINT}${path}`, {
    params: { month: params.month, year: params.year },
  });
  return unwrapEnvelope<T>(data);
}

/**
 * El backend no siempre respeta el contrato: la proyección llega en la raíz y
 * `top_categories` puede llegar como una `Collection` de PHP serializada (un
 * objeto, no un array). Se normaliza aquí para que la UI vea siempre el tipo.
 */
function normalizeFinancial(raw: FinancialPanel): FinancialPanel {
  const legacy = (raw.revenue as { projection?: FinancialPanel["projection"] }).projection;
  const categories: unknown = raw.expenses?.top_categories;
  return {
    ...raw,
    projection: raw.projection ?? legacy ?? null,
    expenses: {
      ...raw.expenses,
      top_categories: Array.isArray(categories) ? categories : [],
      alert: raw.expenses?.alert
        ? { ...raw.expenses.alert, anomalies: raw.expenses.alert.anomalies ?? [] }
        : null,
    },
    revenue: {
      ...raw.revenue,
      alert: raw.revenue?.alert
        ? { ...raw.revenue.alert, suggestions: raw.revenue.alert.suggestions ?? [] }
        : null,
    },
  };
}

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) ? v : d);
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const trendOf = (n: number): Trend => (n > 0 ? "up" : n < 0 ? "down" : "stable");
const pctChange = (cur: number, prev: number) =>
  prev === 0 ? 0 : Math.round(((cur - prev) / prev) * 10000) / 100;

/**
 * Membresías: el backend manda otra forma que la del documento (`retention.rate`,
 * `active_members.count`, `history` como objeto…). Se mapea a `MembershipsPanel`
 * y lo que no viene se rellena con valores neutros.
 */
function normalizeMemberships(raw: Raw, params: ManagementParams): MembershipsPanel {
  const am = raw.active_members ?? {};
  const h = am.history;
  const current = num(am.current ?? am.count);
  const history: Array<{ month: string; count: number }> = Array.isArray(h)
    ? h
    : h
      ? [
          { month: "-3m", count: num(h.three_months_ago) },
          { month: "-2m", count: num(h.two_months_ago) },
          { month: "-1m", count: num(h.one_month_ago) },
          { month: "Actual", count: num(h.current, current) },
        ]
      : [];
  const previous = num(am.previous ?? (h && !Array.isArray(h) ? h.one_month_ago : undefined));
  const predicted = am.prediction?.in_3_months ?? am.projection?.three_months;

  const nm = raw.new_members ?? {};
  const nmChange = num(nm.change_percent);
  const ch = raw.churned_members ?? {};
  const ret = raw.retention_rate ?? raw.retention ?? {};
  const exp = raw.expiring_soon ?? {};
  const ltv = raw.lifetime_value ?? {};
  const cr = raw.churn_rate ?? {};

  return {
    period: raw.period ?? { month: params.month ?? 0, year: params.year ?? 0, month_name: "" },
    active_members: {
      current,
      previous,
      change_percent: num(am.change_percent, pctChange(current, previous)),
      trend: am.trend ?? trendOf(current - previous),
      prediction: {
        in_3_months: num(predicted, current),
        confidence: am.prediction?.confidence ?? "medium",
      },
      history,
    },
    new_members: {
      current: num(nm.current ?? nm.count),
      previous: num(nm.previous),
      change_percent: nmChange,
      trend: nm.trend ?? trendOf(nmChange),
      by_source: arr(nm.by_source),
      insight: nm.insight ?? "",
    },
    churned_members: {
      current: num(ch.current ?? ch.count),
      previous: num(ch.previous),
      change_percent: num(ch.change_percent),
      reasons: arr(ch.reasons),
      alert: ch.alert ?? null,
    },
    retention_rate: {
      current: num(ret.current ?? ret.rate),
      previous: num(ret.previous),
      industry_benchmark: ret.industry_benchmark ?? { min: 70, ideal: 75, excellent: 80 },
      status: ret.status ?? "good",
      message: ret.message ?? "",
    },
    expiring_soon: {
      next_7_days: num(exp.next_7_days),
      next_15_days: num(exp.next_15_days),
      next_30_days: num(exp.next_30_days),
      priority_list: arr<ExpiringMember>(exp.priority_list).map((m) => ({
        ...m,
        // El backend manda fracciones (y negativos el mismo día de vencimiento).
        days_until_expiry: Math.max(0, Math.ceil(num(m.days_until_expiry))),
      })),
      action: exp.action ?? "",
    },
    lifetime_value: {
      average_months: num(ltv.average_months ?? ltv.average_tenure_months),
      average_revenue: num(ltv.average_revenue ?? ltv.average_ltv),
      message: ltv.message ?? "",
    },
    churn_rate: {
      current: num(cr.current ?? cr.rate),
      previous: num(cr.previous),
      industry_benchmark: cr.industry_benchmark?.min != null
        ? cr.industry_benchmark
        : { min: 8, max: 10, your_position: "" },
      status: cr.status ?? "good",
      message: cr.message ?? cr.benchmark?.message ?? "",
    },
  };
}

const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

/**
 * Operación: `by_day_of_week` y `heat_map` llegan como objetos `{clave: número}`
 * (no como listas) y varios campos tienen otro nombre que en el documento.
 */
function normalizeOperations(raw: Raw, params: ManagementParams): OperationsPanel {
  const att = raw.attendance ?? {};
  const byDay: Raw = att.by_day_of_week ?? {};
  const byDayList = Array.isArray(byDay)
    ? byDay
    : Object.entries(byDay)
        .map(([day, v]) => ({ day, average: num(v) }))
        .sort((a, b) => WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day));

  const peak = raw.peak_hours ?? {};
  const count = num(peak.busiest_count ?? peak.peak_count);
  const rate = num(peak.occupancy_percent ?? peak.occupancy_rate);
  // El backend no manda el aforo; se deduce de conteo / tasa (conteo 60 con tasa 60% → 100).
  const capacity = num(peak.capacity, rate > 0 ? Math.round((count / rate) * 100) : 0);
  const heat: Raw = peak.heatmap ?? peak.heat_map ?? {};
  const heatList = Array.isArray(heat)
    ? heat
    : Object.entries(heat)
        .map(([hour, v]) => ({
          hour,
          count: num(v),
          occupancy: capacity > 0 ? Math.round((num(v) / capacity) * 1000) / 10 : 0,
        }))
        .sort((a, b) => a.hour.localeCompare(b.hour));
  const peakAlert =
    peak.alert ?? (typeof peak.insight === "string" && peak.insight
      ? { level: "info", message: peak.insight }
      : null);

  const co = raw.class_occupancy ?? {};
  const dm = raw.dormant_members ?? {};
  const eq = raw.equipment ?? {};
  const total = num(eq.total);
  const inMaint = num(eq.in_maintenance);
  const outSvc = num(eq.out_of_service);

  return {
    period: raw.period ?? { month: params.month ?? 0, year: params.year ?? 0, month_name: "" },
    attendance: {
      total_month: num(att.total_month ?? att.total),
      daily_average: num(att.daily_average ?? att.avg_daily),
      previous_daily_average: num(att.previous_daily_average ?? att.previous_avg_daily),
      change_percent: num(att.change_percent),
      trend: att.trend ?? "stable",
      by_day_of_week: byDayList,
    },
    peak_hours: {
      busiest_hour: peak.busiest_hour ?? peak.peak_hour ?? "—",
      busiest_count: count,
      capacity,
      occupancy_percent: rate,
      heatmap: heatList,
      alert: peakAlert,
    },
    class_occupancy: {
      average_percent: num(co.average_percent ?? co.avg_occupancy),
      total_classes: num(co.total_classes),
      total_attendees: num(co.total_attendees),
      total_capacity: num(co.total_capacity),
      top_classes: arr(co.top_classes),
    },
    dormant_members: {
      count: num(dm.count),
      inactive_days: num(dm.inactive_days, 15),
      list: arr(dm.list ?? dm.members),
      action: dm.action ?? null,
      insight: dm.insight ?? "",
    },
    equipment: {
      total,
      operational: num(eq.operational, Math.max(0, total - inMaint - outSvc)),
      in_maintenance: inMaint,
      out_of_service: outSvc,
      operational_rate: num(eq.operational_rate),
      upcoming_maintenance: arr(eq.upcoming_maintenance),
    },
  };
}

const optNum = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/**
 * CRM: el backend manda `total_leads`, `stages`, `conversion_rates.by_promotion`,
 * `by_source.by_source`, etc. No trae periodo anterior por etapa, costos por
 * adquisición ni ROI: esos valores quedan ausentes y la UI muestra "—".
 */
function normalizeCrm(raw: Raw, params: ManagementParams): CrmPanel {
  const f = raw.funnel ?? {};
  const rt = raw.response_time ?? raw.lead_response_time ?? {};
  const promo = raw.conversion_by_promo ?? raw.conversion_rates ?? {};
  const lost = raw.lost_reasons ?? {};
  const src = raw.by_source ?? {};

  const visited = num(f.visited?.count ?? f.visited);
  const converted = num(f.converted?.count ?? f.converted);
  const leads = num(f.leads?.count ?? f.total_leads);

  return {
    period: raw.period ?? { month: params.month ?? 0, year: params.year ?? 0, month_name: "" },
    funnel: {
      leads: { count: leads, previous: f.leads?.previous, change_percent: f.leads?.change_percent },
      visited: {
        count: visited,
        previous: f.visited?.previous,
        change_percent: f.visited?.change_percent,
        conversion_from_leads: num(f.visited?.conversion_from_leads ?? f.visit_rate),
      },
      converted: {
        count: converted,
        previous: f.converted?.previous,
        change_percent: f.converted?.change_percent,
        conversion_from_visited: num(f.converted?.conversion_from_visited ?? f.conversion_rate),
        conversion_from_leads: num(f.converted?.conversion_from_leads ?? f.overall_conversion),
      },
      alert: f.alert ?? null,
    },
    conversion_by_promo: {
      with_promo: (promo.with_promo ?? arr<Raw>(promo.by_promotion).map((p) => ({
        promo_code: p.promo,
        leads: num(p.total_leads),
        converted: num(p.converted),
        conversion_rate: num(p.conversion_rate),
      }))) as CrmPanel["conversion_by_promo"]["with_promo"],
      without_promo: promo.without_promo ?? null,
      insight: promo.insight ?? "",
    },
    response_time: {
      average_hours: num(rt.average_hours ?? rt.avg_hours),
      average_minutes: num(rt.average_minutes ?? rt.avg_minutes),
      target_hours: num(rt.target_hours, 2),
      status: rt.status ?? "good",
      benchmark_message: rt.benchmark_message ?? rt.insight ?? "",
      distribution: arr(rt.distribution),
    },
    lost_reasons: {
      total_lost: num(lost.total_lost),
      top_reasons: arr(lost.top_reasons ?? lost.reasons),
      action: lost.action ?? "",
    },
    by_source: {
      sources: arr<Raw>(src.sources ?? src.by_source).map((x) => ({
        source: x.source,
        leads: num(x.leads ?? x.total_leads),
        converted: num(x.converted),
        conversion_rate: num(x.conversion_rate),
        cost_per_lead: optNum(x.cost_per_lead),
        cost_per_acquisition: optNum(x.cost_per_acquisition),
        roi: optNum(x.roi),
      })),
      recommendation: src.recommendation ?? "",
    },
  };
}

export const managementApi = {
  full: (p: ManagementParams = {}) => get<ManagementDashboard>("", p),
  financial: async (p: ManagementParams = {}) =>
    normalizeFinancial(await get<FinancialPanel>("/financial", p)),
  memberships: async (p: ManagementParams = {}) =>
    normalizeMemberships(await get<Raw>("/memberships", p), p),
  operations: async (p: ManagementParams = {}) =>
    normalizeOperations(await get<Raw>("/operations", p), p),
  crm: async (p: ManagementParams = {}) => normalizeCrm(await get<Raw>("/crm", p), p),
};
