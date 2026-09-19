import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { SUPPLIERS_ENDPOINT, SUPPLIERS_PER_PAGE } from "./suppliers.constants";
import {
  CreateSupplierInput,
  SupplierListParams,
  SupplierRow,
  UpdateSupplierInput,
} from "./suppliers.types";

/** El backend manda `is_active` con un tipo inconsistente ("true"/true/1). */
function toSupplierRow(raw: Record<string, unknown>): SupplierRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    ruc: raw.ruc == null ? null : String(raw.ruc),
    phone: raw.phone == null ? null : String(raw.phone),
    email: raw.email == null ? null : String(raw.email),
    address: raw.address == null ? null : String(raw.address),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}

async function list(params: SupplierListParams = {}): Promise<Paginated<SupplierRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(SUPPLIERS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? SUPPLIERS_PER_PAGE,
      search: search ? search : undefined,
      is_active: params.isActive,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toSupplierRow) };
}

async function create(input: CreateSupplierInput): Promise<SupplierRow> {
  const { data } = await apiClient.post<unknown>(SUPPLIERS_ENDPOINT, input);
  return toSupplierRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdateSupplierInput): Promise<SupplierRow> {
  const { data } = await apiClient.patch<unknown>(
    `${SUPPLIERS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toSupplierRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${SUPPLIERS_ENDPOINT}/${encodeURIComponent(id)}`);
}

export const suppliersApi = { list, create, update, remove };
