import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { PRODUCTS_ENDPOINT, PRODUCTS_PER_PAGE } from "./products.constants";
import {
  CreateProductInput,
  ProductCategoryRef,
  ProductListParams,
  ProductRow,
  ProductStock,
  UpdateProductInput,
} from "./products.types";

function toProductCategoryRef(raw: unknown): ProductCategoryRef | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  return {
    id: String(c.id),
    name: String(c.name ?? ""),
    is_active: c.is_active === true || c.is_active === "true" || c.is_active === 1,
  };
}

function toProductStocks(raw: unknown): ProductStock[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const s = item as Record<string, unknown>;
    return {
      branch_id: String(s.branch_id),
      branch_name: String(s.branch_name ?? ""),
      quantity: Number(s.quantity ?? 0),
    };
  });
}

/**
 * El `store` no devuelve `category` ni `stocks` (solo `product_category_id`);
 * `index`/`show`/`update` sí. `is_active` llega con tipo inconsistente
 * ("true"/true/1) y `cost` en `0` cuando nunca se definió.
 */
function toProductRow(raw: Record<string, unknown>): ProductRow {
  return {
    id: String(raw.id),
    product_category_id: raw.product_category_id == null ? null : String(raw.product_category_id),
    category: toProductCategoryRef(raw.category),
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    sku: String(raw.sku ?? ""),
    sale_price: Number(raw.sale_price ?? 0),
    cost: Number(raw.cost ?? 0),
    is_active: raw.is_active === true || raw.is_active === "true" || raw.is_active === 1,
    stocks: toProductStocks(raw.stocks),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    deleted_at: raw.deleted_at == null ? null : String(raw.deleted_at),
  };
}

async function list(params: ProductListParams = {}): Promise<Paginated<ProductRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(PRODUCTS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? PRODUCTS_PER_PAGE,
      search: search ? search : undefined,
      product_category_id: params.categoryId || undefined,
      is_active: params.isActive,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toProductRow) };
}

async function create(input: CreateProductInput): Promise<ProductRow> {
  const { data } = await apiClient.post<unknown>(PRODUCTS_ENDPOINT, input);
  return toProductRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdateProductInput): Promise<ProductRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PRODUCTS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toProductRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${PRODUCTS_ENDPOINT}/${encodeURIComponent(id)}`);
}

/** Restaura un producto eliminado (soft-delete). */
async function restore(id: string): Promise<ProductRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PRODUCTS_ENDPOINT}/${encodeURIComponent(id)}/restore`,
  );
  return toProductRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const productsApi = { list, create, update, remove, restore };
