import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

/** `1` = conectados; `0` = desconectados o que nunca se conectaron; `""` = todos. */
export type DeviceOnlineFilter = "" | "1" | "0";

export interface DeviceListParams extends BaseListParams {
  /** Solo los lectores asignados a este gimnasio. */
  tenant_id?: string;
  online?: DeviceOnlineFilter;
}

/** Filtros extra del list (todo salvo paginación/búsqueda). */
export type DeviceFilters = ListFilters<DeviceListParams>;

export interface CreateDeviceInput {
  serial_number: string;
  tenant_id: string;
  model?: string;
  notes?: string;
}

/** `PATCH /admin/devices/{id}`: el serial no se puede cambiar. */
export interface UpdateDeviceInput {
  tenant_id?: string;
  model?: string | null;
  notes?: string | null;
}

export interface DeviceRow {
  id: number | string;
  serial_number: string;
  tenant_id: string;
  model: string | null;
  notes: string | null;
  is_online: boolean;
  last_seen_at: string | null;
  firmware: string | null;
  reported_ip: string | null;
  created_at: string | null;
  updated_at: string | null;
}
