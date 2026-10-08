import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
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

async function list(
  params: ProductCategoryListParams = {},
): Promise<Paginated<ProductCategoryRow>> {
  const { data } = await apiClient.get<unknown>(PRODUCT_CATEGORIES_ENDPOINT, {
    params: buildListParams(params, PRODUCT_CATEGORIES_PER_PAGE),
  });
  return unwrapPaginated<ProductCategoryRow>(data);
}

async function create(
  input: CreateProductCategoryInput,
): Promise<ProductCategoryRow> {
  const { data } = await apiClient.post<unknown>(
    PRODUCT_CATEGORIES_ENDPOINT,
    input,
  );
  return unwrapEnvelope<ProductCategoryRow>(data);
}

async function update(
  id: number,
  input: UpdateProductCategoryInput,
): Promise<ProductCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PRODUCT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<ProductCategoryRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(
    `${PRODUCT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}`,
  );
}

/** Restaura una categoría eliminada (soft-delete). */
async function restore(id: number): Promise<ProductCategoryRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PRODUCT_CATEGORIES_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return unwrapEnvelope<ProductCategoryRow>(data);
}

export const productCategoriesApi = { list, create, update, remove, restore };
