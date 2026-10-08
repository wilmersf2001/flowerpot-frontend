import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { toBoolean } from "@/features/_shared/format";
import { SUPPLIERS_ENDPOINT, SUPPLIERS_PER_PAGE } from "./suppliers.constants";
import {
  CreateSupplierInput,
  SupplierListParams,
  SupplierRow,
  UpdateSupplierInput,
} from "./suppliers.types";

function toSupplierRow(raw: Record<string, unknown>): SupplierRow {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    ruc: raw.ruc == null ? null : String(raw.ruc),
    phone: raw.phone == null ? null : String(raw.phone),
    email: raw.email == null ? null : String(raw.email),
    address: raw.address == null ? null : String(raw.address),
    is_active: toBoolean(raw.is_active),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}

async function list(params: SupplierListParams = {}): Promise<Paginated<SupplierRow>> {
  const { data } = await apiClient.get<unknown>(SUPPLIERS_ENDPOINT, {
    params: buildListParams(params, SUPPLIERS_PER_PAGE),
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toSupplierRow) };
}

async function create(input: CreateSupplierInput): Promise<SupplierRow> {
  const { data } = await apiClient.post<unknown>(SUPPLIERS_ENDPOINT, input);
  return toSupplierRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: number, input: UpdateSupplierInput): Promise<SupplierRow> {
  const { data } = await apiClient.patch<unknown>(
    `${SUPPLIERS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toSupplierRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${SUPPLIERS_ENDPOINT}/${encodeURIComponent(id)}`);
}

export const suppliersApi = { list, create, update, remove };
