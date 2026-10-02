import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";

export interface AttendanceRow {
  id: string;
  member_id: string;
  membership_id: string | null;
  checked_in_at: string;
  source: string;
  notes: string;
  created_at: string;
  member_name?: string;
  member_dni?: string;
  branch_name?: string;
  device_name?: string;
  membership_ends_at?: string;
}

export interface AttendanceListParams extends BaseListParams {
  /** Sede activa (switcher global). `useAttendances` la inyecta; no la pasa la página. */
  branchId?: string | null;
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type AttendanceFilters = ListFilters<AttendanceListParams>;

/** Cuerpo de `POST /attendances` (`StoreAttendanceRequest`). Registro manual. */
export interface CreateAttendanceInput {
  member_id: number;
  /** Sede activa al momento de registrar (`useCreateAttendance` la inyecta). */
  branch_id: number;
  notes?: string | null;
}
