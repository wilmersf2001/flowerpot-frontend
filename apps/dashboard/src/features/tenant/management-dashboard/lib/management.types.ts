export type Trend = "up" | "down" | "stable";
export type AlertLevel = "success" | "info" | "warning" | "danger";
export type RiskLevel = "low" | "medium" | "high";
export type HealthStatus = "critical" | "warning" | "healthy" | "good" | "excellent";
export type Confidence = "low" | "medium" | "high";

export interface ManagementParams {
  month?: number;
  year?: number;
}

export interface Period {
  month: number;
  year: number;
  month_name: string;
  days_elapsed?: number;
  days_in_month?: number;
}

export interface PanelAlert {
  level: AlertLevel;
  message: string;
}

// ── Financiero ──────────────────────────────────────────────────────────────
export interface Suggestion {
  type: "memberships" | "store" | "day_passes" | "classes";
  title: string;
  impact: string;
  avg_value?: number;
}
export interface RevenueAlert extends PanelAlert {
  gap: number;
  suggestions: Suggestion[];
}
export interface Revenue {
  current: number;
  previous: number;
  change_percent: number;
  trend: Trend;
  target: number;
  target_progress: number;
  alert: RevenueAlert | null;
  breakdown: {
    memberships: number;
    classes: number;
    store: number;
    day_passes: number;
    maintenance: number;
  };
}
export interface Anomaly {
  category: string;
  amount: number;
  previous_amount: number;
  deviation: string;
  is_anomaly: boolean;
}
export interface ExpenseCategory {
  name: string;
  amount: number;
  percent: number;
  change_vs_previous: number;
}
export interface Expenses {
  current: number;
  previous: number;
  change_percent: number;
  trend: Trend;
  alert: (PanelAlert & { anomalies: Anomaly[] }) | null;
  top_categories: ExpenseCategory[];
}
export interface Margin {
  net: number;
  percent: number;
  previous_percent: number;
  change_percent: number;
  status: HealthStatus;
  benchmark: {
    industry_average: number;
    your_position: "below_average" | "average" | "above_average";
  };
}
export interface CashRegisterInfo {
  status: "open" | "closed";
  balance: number;
  opened_at?: string | null;
  opened_by?: string | null;
}
export interface PriorityContact {
  member_id: number;
  name: string;
  phone: string;
  email: string;
  amount: number;
  days_overdue: number;
  membership_value: number;
  total_lifetime_paid: number;
  risk_score: RiskLevel;
  suggested_action: string;
}
export interface Projection {
  end_of_month: number;
  confidence: Confidence;
  based_on: string;
}
export interface FinancialPanel {
  period: Period;
  /** El backend la manda en la raíz (el doc la ubicaba dentro de `revenue`). */
  projection: Projection | null;
  revenue: Revenue;
  expenses: Expenses;
  margin: Margin;
  cash_register: CashRegisterInfo;
  accounts_receivable: {
    total: number;
    overdue: number;
    members_count: number;
    priority_contacts: PriorityContact[];
  };
}

// ── Membresías ──────────────────────────────────────────────────────────────
export interface ExpiringMember {
  member_id: number;
  name: string;
  phone?: string;
  email?: string;
  plan_name?: string;
  expires_at: string;
  days_until_expiry: number;
  attendance_last_30_days?: number;
  avg_attendance_per_month?: number;
  renewal_probability: number;
  risk: RiskLevel;
  suggested_action?: string;
}
export interface MembershipsPanel {
  period: Period;
  active_members: {
    current: number;
    previous: number;
    change_percent: number;
    trend: Trend;
    prediction: { in_3_months: number; confidence: Confidence };
    history: Array<{ month: string; count: number }>;
  };
  new_members: {
    current: number;
    previous: number;
    change_percent: number;
    trend: Trend;
    by_source: Array<{ source: string; count: number; percent: number }>;
    insight: string;
  };
  churned_members: {
    current: number;
    previous: number;
    change_percent: number;
    reasons: Array<{ reason: string; count: number; percent: number }>;
    alert: (PanelAlert & { detected_pattern?: string }) | null;
  };
  retention_rate: {
    current: number;
    previous: number;
    industry_benchmark: { min: number; ideal: number; excellent: number };
    status: HealthStatus;
    message: string;
  };
  expiring_soon: {
    next_7_days: number;
    next_15_days: number;
    next_30_days: number;
    priority_list: ExpiringMember[];
    action: string;
  };
  lifetime_value: { average_months: number; average_revenue: number; message: string };
  churn_rate: {
    current: number;
    previous: number;
    industry_benchmark: { min: number; max: number; your_position: string };
    status: HealthStatus;
    message: string;
  };
}

// ── Operacional ─────────────────────────────────────────────────────────────
export interface TopClass {
  class_id: number;
  name: string;
  instructor: string;
  avg_occupancy: number;
  capacity: number;
  avg_attendees: number;
  waitlist_avg: number;
  suggestion: string | null;
}
export interface DormantMember {
  member_id: number;
  name: string;
  phone: string;
  email: string;
  last_attendance: string;
  days_inactive: number;
  plan_expires_at: string;
  total_paid_lifetime: number;
}
export interface UpcomingMaintenance {
  equipment_id: number;
  name: string;
  type: string;
  hours_used: number;
  maintenance_threshold: number;
  estimated_days_until_maintenance: number;
  alert: string;
}
export interface OperationsPanel {
  period: Period;
  attendance: {
    total_month: number;
    daily_average: number;
    previous_daily_average: number;
    change_percent: number;
    trend: Trend;
    by_day_of_week: Array<{ day: string; average: number; percent_of_capacity?: number }>;
  };
  peak_hours: {
    busiest_hour: string;
    busiest_count: number;
    capacity: number;
    occupancy_percent: number;
    heatmap: Array<{ hour: string; count: number; occupancy: number }>;
    alert: (PanelAlert & { threshold_exceeded?: number }) | null;
  };
  class_occupancy: {
    average_percent: number;
    total_classes: number;
    total_attendees: number;
    total_capacity: number;
    top_classes: TopClass[];
  };
  dormant_members: {
    count: number;
    inactive_days: number;
    list: DormantMember[];
    action: { type: string; title: string; template: string; affected_members: number } | null;
    insight: string;
  };
  equipment: {
    total: number;
    operational: number;
    in_maintenance: number;
    out_of_service: number;
    operational_rate: number;
    upcoming_maintenance: UpcomingMaintenance[];
  };
}

// ── CRM ─────────────────────────────────────────────────────────────────────
export interface FunnelStage {
  count: number;
  previous?: number;
  change_percent?: number;
}
export interface CrmPanel {
  period: Period;
  funnel: {
    leads: FunnelStage;
    visited: FunnelStage & { conversion_from_leads: number };
    converted: FunnelStage & { conversion_from_leads: number; conversion_from_visited: number };
    alert: (PanelAlert & { previous_conversion?: number; change?: string }) | null;
  };
  conversion_by_promo: {
    with_promo: Array<{
      promo_code: string;
      leads: number;
      converted: number;
      conversion_rate: number;
      revenue_generated?: number;
    }>;
    without_promo: { leads: number; converted: number; conversion_rate: number } | null;
    insight: string;
  };
  response_time: {
    average_hours: number;
    average_minutes: number;
    target_hours: number;
    status: HealthStatus;
    benchmark_message: string;
    distribution: Array<{ range: string; count: number; conversion_rate: number }>;
  };
  lost_reasons: {
    total_lost: number;
    top_reasons: Array<{ reason: string; count: number; percent: number }>;
    action: string;
  };
  by_source: {
    sources: Array<{
      source: string;
      leads: number;
      converted: number;
      conversion_rate: number;
      cost_per_lead?: number | null;
      cost_per_acquisition?: number | null;
      roi?: number | null;
    }>;
    recommendation: string;
  };
}

export interface ManagementDashboard {
  financial: FinancialPanel;
  memberships: MembershipsPanel;
  operations: OperationsPanel;
  crm: CrmPanel;
}
