import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { PAYMENTS_ENDPOINT, PAYMENTS_PER_PAGE } from "./payments.constants";
import {
  CreateInstallmentInput,
  CreatePaymentInput,
  PaymentListParams,
  PaymentRow,
  UpdatePaymentInput,
} from "./payments.types";

/** El backend manda varios campos numéricos/anidados con forma inconsistente. */
function toPaymentRow(raw: Record<string, unknown>): PaymentRow {
  const member = raw.member as Record<string, unknown> | undefined;
  const membership = raw.membership as Record<string, unknown> | undefined;
  return {
    id: String(raw.id),
    membership_id: String(raw.membership_id),
    member_id: String(raw.member_id),
    amount: Number(raw.amount ?? 0),
    amount_paid: Number(raw.amount_paid ?? 0),
    gateway_fee: Number(raw.gateway_fee ?? 0),
    balance_due: Number(raw.balance_due ?? 0),
    net_amount: Number(raw.net_amount ?? 0),
    gateway: String(raw.gateway ?? ""),
    status: String(raw.status ?? ""),
    gateway_transaction_id: raw.gateway_transaction_id
      ? String(raw.gateway_transaction_id)
      : undefined,
    gateway_status: raw.gateway_status ? String(raw.gateway_status) : undefined,
    notes: String(raw.notes ?? ""),
    paid_at: raw.paid_at == null ? null : String(raw.paid_at),
    created_at: String(raw.created_at ?? ""),
    updated_at: String(raw.updated_at ?? ""),
    member_name: member ? String(member.full_name ?? "") : undefined,
    member_dni: member ? String(member.dni ?? "") : undefined,
    plan_name: membership ? String(membership.plan_name ?? "") : undefined,
  };
}

async function list(params: PaymentListParams = {}): Promise<Paginated<PaymentRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(PAYMENTS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? PAYMENTS_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  const page = unwrapPaginated<Record<string, unknown>>(data);
  return { ...page, data: page.data.map(toPaymentRow) };
}

async function create(input: CreatePaymentInput): Promise<PaymentRow> {
  const { data } = await apiClient.post<unknown>(PAYMENTS_ENDPOINT, input);
  return toPaymentRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function update(id: string, input: UpdatePaymentInput): Promise<PaymentRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PAYMENTS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return toPaymentRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${PAYMENTS_ENDPOINT}/${encodeURIComponent(id)}`);
}

async function storeInstallment(
  id: string,
  input: CreateInstallmentInput,
): Promise<PaymentRow> {
  const { data } = await apiClient.post<unknown>(
    `${PAYMENTS_ENDPOINT}/${encodeURIComponent(id)}/installments`,
    input,
  );
  return toPaymentRow(unwrapEnvelope<Record<string, unknown>>(data));
}

async function refund(id: string): Promise<PaymentRow> {
  const { data } = await apiClient.post<unknown>(
    `${PAYMENTS_ENDPOINT}/${encodeURIComponent(id)}/refund`,
  );
  return toPaymentRow(unwrapEnvelope<Record<string, unknown>>(data));
}

export const paymentsApi = { list, create, update, remove, storeInstallment, refund };
