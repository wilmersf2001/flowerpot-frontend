import type {
  BaseListParams,
  ListFilters,
} from "@/features/_shared/list-params";

export interface StaffBranch {
  id: number;
  name: string;
}

export interface StaffRow {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  email: string;
  salary: string;
  hire_date: string | null;
  is_active: boolean;
  /** Relaciones: solo vienen si el backend las cargó (`whenLoaded`). */
  job_position?: { id: number; name: string };
  branches?: StaffBranch[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface StaffListParams extends BaseListParams {
  /** Sede activa (switcher global). `useMembers` la inyecta; no la pasa la página. */
  branch_id?: string | null;
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type StaffFilters = ListFilters<StaffListParams>;

/** Cuerpo de `POST /staff` (`StoreStaffRequest`). */
export interface CreateStaffInput {
  job_position_id: number;
  first_name: string;
  last_name: string;
  dni: string;
  phone?: string | null;
  email?: string | null;
  salary?: number | null;
  hire_date: string;
  is_active?: boolean;
  branch_ids?: number[];
}

/** Cuerpo de `PATCH /staff/{staff}` (`UpdateStaffRequest`). */
export interface UpdateStaffInput {
  job_position_id?: number;
  first_name?: string;
  last_name?: string;
  dni?: string;
  phone?: string | null;
  email?: string | null;
  salary?: number | null;
  hire_date?: string;
  is_active?: boolean;
  branch_ids?: number[];
}
