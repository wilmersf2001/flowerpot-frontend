import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";
import type { LEAD_INTERESTS, LEAD_SOURCES, LEAD_STATUSES } from "./leads.constants";

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];
export type LeadInterest = (typeof LEAD_INTERESTS)[number];
export type LeadOrigin = "acquisition" | "walk_in";

export interface LeadTransition {
  value: LeadStatus;
  label: string;
}

/** Fila de `GET /leads` — `LeadResource`. */
export interface LeadRow {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  dni: string | null;
  birth_date: string | null;
  contact_consent: boolean | null;
  contact_consent_at: string | null;
  /** Solo vienen en el listado. */
  visits_count?: number;
  last_visit_on?: string | null;
  source: LeadSource;
  source_detail: string | null;
  origin: LeadOrigin;
  status: LeadStatus;
  interest: LeadInterest | null;
  notes: string | null;
  contacted_at: string | null;
  converted_at: string | null;
  is_active: boolean;
  member_id?: number | null;
  branch?: { id: number; name: string } | null;
  allowed_transitions: LeadTransition[];
  created_at: string;
  updated_at: string;
}

export interface LeadListParams extends BaseListParams {
  origin?: LeadOrigin;
  source?: LeadSource | "";
  source_detail?: string;
  status?: LeadStatus | "";
  interest?: LeadInterest | "";
  /** `"true"` = solo quienes aceptaron ser contactados. */
  contact_consent?: "true" | "";
  sort_by?: "id" | "created_at" | "updated_at";
  sort_order?: "asc" | "desc";
}

export type LeadFilters = ListFilters<LeadListParams>;

/** Cuerpo de `POST /leads`. */
export interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string | null;
  dni?: string | null;
  birth_date?: string | null;
  contact_consent?: boolean | null;
  source?: LeadSource;
  source_detail?: string | null;
  interest?: LeadInterest | null;
  notes?: string | null;
  branch_id?: number | null;
}

/** Cuerpo de `PATCH /leads/{id}` (`status` y `source` no se cambian aquí). */
export type UpdateLeadInput = Omit<Partial<CreateLeadInput>, "source">;

/** Cuerpo de `POST /leads/{id}/convert`. */
export interface ConvertLeadInput {
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  email?: string | null;
  birth_date?: string | null;
  branch_id?: number | null;
}

export type ImportIssueStatus = "error" | "duplicate" | "already_member";

export interface ImportIssue {
  /** Número real de fila en Excel. */
  row: number;
  status: ImportIssueStatus;
  reasons: string[];
  values: Record<string, string | null>;
  lead_id?: number;
  member_id?: number;
}

export interface ImportLeadsResult {
  summary: {
    rows_read: number;
    created: number;
    duplicates: number;
    already_members: number;
    errors: number;
  };
  issues: ImportIssue[];
}
