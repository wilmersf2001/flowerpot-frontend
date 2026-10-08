import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { SUPPLIERS_ENDPOINT, SUPPLIERS_PER_PAGE } from "./suppliers.constants";
import {
  CreateSupplierInput,
  SupplierListParams,
  SupplierRow,
  UpdateSupplierInput,
} from "./suppliers.types";

async function list(
  params: SupplierListParams = {},
): Promise<Paginated<SupplierRow>> {
  const { data } = await apiClient.get<unknown>(SUPPLIERS_ENDPOINT, {
    params: buildListParams(params, SUPPLIERS_PER_PAGE),
  });
  return unwrapPaginated<SupplierRow>(data);
}

async function create(input: CreateSupplierInput): Promise<SupplierRow> {
  const { data } = await apiClient.post<unknown>(SUPPLIERS_ENDPOINT, input);
  return unwrapEnvelope<SupplierRow>(data);
}

async function update(
  id: number,
  input: UpdateSupplierInput,
): Promise<SupplierRow> {
  const { data } = await apiClient.patch<unknown>(
    `${SUPPLIERS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<SupplierRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${SUPPLIERS_ENDPOINT}/${encodeURIComponent(id)}`);
}

export const suppliersApi = { list, create, update, remove };
