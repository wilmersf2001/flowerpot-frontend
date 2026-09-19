import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { SALES_ENDPOINT, SALES_PER_PAGE } from "./sales.constants";
import {
  CreateSaleInput,
  SaleBranchRef,
  SaleItemRow,
  SaleListParams,
  SaleMemberRef,
  SaleRow,
  SaleStaffRef,
  VoidSaleInput,
} from "./sales.types";

function toBranchRef(raw: unknown): SaleBranchRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return { id: String(r.id), name: String(r.name ?? "") };
}

function toMemberRef(raw: unknown): SaleMemberRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const firstName = String(r.first_name ?? "");
  const lastName = String(r.last_name ?? "");
  return {
    id: String(r.id),
    first_name: firstName,
    last_name: lastName,
    full_name: String(r.full_name ?? `${firstName} ${lastName}`.trim()),
  };
}

function toStaffRef(raw: unknown): SaleStaffRef | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id),
    first_name: String(r.first_name ?? ""),
    last_name: String(r.last_name ?? ""),
  };
}

function toItemRow(raw: unknown): SaleItemRow {
  const r = (raw ?? {}) as Record<string, unknown>;
  const product = r.product as Record<string, unknown> | null | undefined;
  return {
    id: String(r.id),
    product_id: String(r.product_id),
    product: product
      ? { id: String(product.id), name: String(product.name ?? ""), sku: String(product.sku ?? "") }
      : null,
    quantity: Number(r.quantity ?? 0),
    unit_price: Number(r.unit_price ?? 0),
    subtotal: Number(r.subtotal ?? 0),
  };
}

function toSaleRow(raw: Record<string, unknown>): SaleRow {
  return {
    id: String(raw.id),
    payment_method: (raw.payment_method as SaleRow["payment_method"]) ?? "efectivo",
    payment_reference: raw.payment_reference == null ? null : String(raw.payment_reference),
    subtotal: Number(raw.subtotal ?? 0),
    total: Number(raw.total ?? 0),
    status: (raw.status as SaleRow["status"]) ?? "completed",
    branch_id: String(raw.branch_id),
    branch: toBranchRef(raw.branch),
    member_id: raw.member_id == null ? null : String(raw.member_id),
    member: toMemberRef(raw.member),
    staff_id: raw.staff_id == null ? null : String(raw.staff_id),
    staff: toStaffRef(raw.staff),
    items: Array.isArray(raw.items) ? raw.items.map(toItemRow) : [],
    voided_at: raw.voided_at == null ? null : String(raw.voided_at),
    void_reason: raw.void_reason == null ? null : String(raw.void_reason),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
  };
}

/**
 * El backend ordena ascendente si no se envía `sort_by`/`sort_order`, así que
 * este `list` siempre pide lo más reciente primero por `created_at`.
 */
async function list(params: SaleListParams = {}): Promise<Paginated<SaleRow>> {
  const { data } = await apiClient.get<unknown>(SALES_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? SALES_PER_PAGE,
      branch_id: params.branchId || undefined,
      member_id: params.memberId || undefined,
      staff_id: params.staffId || undefined,
      payment_method: params.paymentMethod || undefined,
      status: params.status || undefined,
      date_from: params.dateFrom || undefined,
      date_to: params.dateTo || undefined,
      sort_by: "created_at",
      sort_order: "desc",
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toSaleRow) };
}

async function show(id: string): Promise<SaleRow> {
  const { data } = await apiClient.get<unknown>(`${SALES_ENDPOINT}/${encodeURIComponent(id)}`);
  return toSaleRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/**
 * Verifica stock, crea la venta, descuenta stock y registra el ingreso en la
 * caja abierta de la sede (si hay una abierta; si no, la venta igual se crea
 * sin avisar).
 */
async function create(input: CreateSaleInput): Promise<SaleRow> {
  const { data } = await apiClient.post<unknown>(SALES_ENDPOINT, input);
  return toSaleRow(unwrapEnvelope<Record<string, unknown>>(data));
}

/** Solo válido si la venta está `completed`. Repone stock y revierte el ingreso en caja. Irreversible. */
async function voidSale(id: string, input: VoidSaleInput): Promise<SaleRow> {
  const { data } = await apiClient.patch<unknown>(
    `${SALES_ENDPOINT}/${encodeURIComponent(id)}/void`,
    input,
  );
  return toSaleRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const salesApi = { list, show, create, voidSale };
