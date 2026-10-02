import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface UpdateGymSettingsInput {
  culqi_enabled?: boolean;
  culqi_public_key?: string;
  culqi_secret_key?: string;
  culqi_fee_rate?: number;
  timezone?: string;
  currency?: string;
}

export type GymSettingsListParams = BaseListParams;

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type GymSettingsFilters = ListFilters<GymSettingsListParams>;

export interface GymSettingsRow {
  id: string;
  tenant_id: string;
  culqi_enabled: boolean;
  culqi_public_key: string;
  culqi_secret_key: string;
  culqi_fee_rate: number;
  timezone: string;
  currency: string;
  created_at: string;
  updated_at: string;
}
