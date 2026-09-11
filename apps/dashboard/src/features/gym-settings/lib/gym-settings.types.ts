export interface UpdateGymSettingsInput {
  culqi_enabled?: boolean;
  culqi_public_key?: string;
  culqi_secret_key?: string;
  culqi_fee_rate?: number;
  timezone?: string;
  currency?: string;
}

export interface GymSettingsListParams {
  page?: number;
  perPage?: number;
  search?: string;
}

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
