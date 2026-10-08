import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { SALES_ENDPOINT, SALES_PER_PAGE } from "./sales.constants";
import {
  CreateSaleInput,
  SaleListParams,
  SaleRow,
  VoidSaleInput,
} from "./sales.types";

/**
 * El backend ordena ascendente si no se envía `sort_by`/`sort_order`, así que
 * este `list` siempre pide lo más reciente primero por `created_at`.
 */
async function list(params: SaleListParams = {}): Promise<Paginated<SaleRow>> {
  const { data } = await apiClient.get<unknown>(SALES_ENDPOINT, {
    params: {
      ...buildListParams(params, SALES_PER_PAGE),
      sort_by: "created_at",
      sort_order: "desc",
    },
  });
  return unwrapPaginated<SaleRow>(data);
}

async function show(id: number): Promise<SaleRow> {
  const { data } = await apiClient.get<unknown>(
    `${SALES_ENDPOINT}/${encodeURIComponent(id)}`,
  );
  return unwrapEnvelope<SaleRow>(data);
}

/**
 * Verifica stock, crea la venta, descuenta stock y registra el ingreso en la
 * caja abierta de la sede (si hay una abierta; si no, la venta igual se crea
 * sin avisar).
 */
async function create(input: CreateSaleInput): Promise<SaleRow> {
  const { data } = await apiClient.post<unknown>(SALES_ENDPOINT, input);
  return unwrapEnvelope<SaleRow>(data);
}

/** Solo válido si la venta está `completed`. Repone stock y revierte el ingreso en caja. Irreversible. */
async function voidSale(id: number, input: VoidSaleInput): Promise<SaleRow> {
  const { data } = await apiClient.patch<unknown>(
    `${SALES_ENDPOINT}/${encodeURIComponent(id)}/void`,
    input,
  );
  return unwrapEnvelope<SaleRow>(data);
}

export const salesApi = { list, show, create, voidSale };
