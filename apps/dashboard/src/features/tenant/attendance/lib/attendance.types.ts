import type {
  BaseListParams,
  ListFilters,
} from "@/features/_shared/list-params";

export interface AttendanceRow {
  id: number;
  member_id: number;
  member_name?: string;
  branch_name?: string;
  membership_id: number | null;
  checked_in_at: string;
  source: string;
  notes: string | null;
  created_at: string;
  member?: { full_name: string; dni: string };
  branch?: { name: string };
  device?: { name: string } | null;
  membership?: { ends_at: string } | null;
}

export interface AttendanceListParams extends BaseListParams {
  /** Sede activa (switcher global). `useAttendances` la inyecta; no la pasa la página. */
  branch_id?: string | null;
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
