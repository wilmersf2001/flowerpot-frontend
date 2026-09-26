import type { BaseListParams, ListFilters } from "@/features/_shared/list-params";
import type { ServiceType } from "./services.constants";

/** Fila de `GET /services` (`ServiceResource`). */
export interface ServiceRow {
  id: number;
  name: string;
  type: ServiceType;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceListParams extends BaseListParams {
  is_active?: "1" | "0";
  type?: ServiceType;
}

/** Filtros extra del list (todo salvo paginación/búsqueda), para los combobox. */
export type ServiceFilters = ListFilters<ServiceListParams>;

/** Cuerpo de `POST /services` (`StoreServiceRequest`). */
export interface CreateServiceInput {
  name: string;
  type: ServiceType;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number | null;
}

/** Cuerpo de `PATCH /services/{id}` (`UpdateServiceRequest`). */
export interface UpdateServiceInput {
  name?: string;
  type?: ServiceType;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number | null;
}
