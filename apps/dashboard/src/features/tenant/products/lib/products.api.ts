import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { PRODUCTS_ENDPOINT, PRODUCTS_PER_PAGE } from "./products.constants";
import {
  CreateProductInput,
  ProductListParams,
  ProductRow,
  UpdateProductInput,
} from "./products.types";

async function list(
  params: ProductListParams = {},
): Promise<Paginated<ProductRow>> {
  const { data } = await apiClient.get<unknown>(PRODUCTS_ENDPOINT, {
    params: buildListParams(params, PRODUCTS_PER_PAGE),
  });
  return unwrapPaginated<ProductRow>(data);
}

async function create(input: CreateProductInput): Promise<ProductRow> {
  const { data } = await apiClient.post<unknown>(PRODUCTS_ENDPOINT, input);
  return unwrapEnvelope<ProductRow>(data);
}

async function update(
  id: number,
  input: UpdateProductInput,
): Promise<ProductRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PRODUCTS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<ProductRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${PRODUCTS_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un producto eliminado (soft-delete). */
async function restore(id: number): Promise<ProductRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PRODUCTS_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<ProductRow>(data);
}

export const productsApi = { list, create, update, remove, restore };
