import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
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

/** El backend manda `is_active` con un tipo inconsistente ("true"/true/1). */
function toProductCategoryRow(raw: Record<string, unknown>): ProductCategoryRow {
  return {
    id: String(raw.id),
    name: String(raw.name ?? ""),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(
  params: ProductCategoryListParams = {},
): Promise<Paginated<ProductCategoryRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(PRODUCT_CATEGORIES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? PRODUCT_CATEGORIES_PER_PAGE,
      search: search ? search : undefined,
      is_active: params.isActive,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toProductCategoryRow) };
}

async function create(input: CreateProductCategoryInput): Promise<ProductCategoryRow> {
  const { data } = await apiClient.post<unknown>(PRODUCT_CATEGORIES_ENDPOINT, input);
  return toProductCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(
  id: string,
  input: UpdateProductCategoryInput,
): Promise<ProductCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PRODUCT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toProductCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${PRODUCT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura una categoría eliminada (soft-delete). */
async function restore(id: string): Promise<ProductCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PRODUCT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toProductCategoryRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const productCategoriesApi = { list, create, update, remove, restore };
