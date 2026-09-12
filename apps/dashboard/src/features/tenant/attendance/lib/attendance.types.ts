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

export interface AttendanceListParams {
  page?: number;
  perPage?: number;
  search?: string;
  /** Sede activa (switcher global). `useAttendances` la inyecta; no la pasa la página. */
  branchId?: string | null;
}

/** Cuerpo de `POST /attendances` (`StoreAttendanceRequest`). Registro manual. */
export interface CreateAttendanceInput {
  member_id: number;
  /** Sede activa al momento de registrar (`useCreateAttendance` la inyecta). */
  branch_id: number;
  notes?: string | null;
}
