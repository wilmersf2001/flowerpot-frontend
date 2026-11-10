import type { BaseListParams } from "@/features/_shared/list-params";

export type DeviceListParams = BaseListParams;

/** `PATCH /devices/{device}` (`UpdateDeviceRequest`). Serial y modelo los define el SaaS. */
export interface UpdateDeviceInput {
  branch_id?: number;
  name?: string;
  is_active?: boolean;
}

export interface DeviceRow {
  id: number;
  branch_id: number | null;
  branch?: { id: number; name: string };
  name: string | null;
  serial_number: string;
  model: string | null;
  ip_address: string | null;
  is_active: boolean;
  /** Asignado por el SaaS pero el gimnasio aún no eligió sede. */
  is_pending: boolean;
  is_online: boolean;
  last_seen_at: string | null;
  firmware: string | null;
  created_at: string | null;
  updated_at: string | null;
}
