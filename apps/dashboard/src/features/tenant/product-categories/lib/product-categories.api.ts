import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { toBoolean } from "@/features/_shared/format";
import {
  PRODUCT_CATEGORIES_ENDPOINT,
  PRODUCT_CATEGORIES_PER_PAGE,
} from "./product-categories.constants";
import {
  CreateProductCategoryInput,
  ProductCategoryListParams,
  ProductCategoryRow,
  UpdateProductCategoryInput,
} from "./product-categories.types";

function toProductCategoryRow(raw: Record<string, unknown>): ProductCategoryRow {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    is_active: toBoolean(raw.is_active),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(
  params: ProductCategoryListParams = {},
): Promise<Paginated<ProductCategoryRow>> {
  const { data } = await apiClient.get<unknown>(PRODUCT_CATEGORIES_ENDPOINT, {
    params: buildListParams(params, PRODUCT_CATEGORIES_PER_PAGE),
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toProductCategoryRow) };
}

async function create(input: CreateProductCategoryInput): Promise<ProductCategoryRow> {
  const { data } = await apiClient.post<unknown>(PRODUCT_CATEGORIES_ENDPOINT, input);
  return toProductCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(
  id: number,
  input: UpdateProductCategoryInput,
): Promise<ProductCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PRODUCT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toProductCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${PRODUCT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura una categoría eliminada (soft-delete). */
async function restore(id: number): Promise<ProductCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PRODUCT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toProductCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const productCategoriesApi = { list, create, update, remove, restore };
