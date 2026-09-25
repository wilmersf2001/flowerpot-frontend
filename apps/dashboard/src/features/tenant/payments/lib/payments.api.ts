import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { PAYMENTS_ENDPOINT, PAYMENTS_PER_PAGE } from "./payments.constants";
import {
  CreateInstallmentInput,
  CreatePaymentInput,
  PaymentListParams,
  PaymentRow,
  UpdatePaymentInput,
} from "./payments.types";

async function list(
  params: PaymentListParams = {},
): Promise<Paginated<PaymentRow>> {
  const { data } = await apiClient.get<unknown>(PAYMENTS_ENDPOINT, {
    params: buildListParams(params, PAYMENTS_PER_PAGE),
  });
  return unwrapPaginated<PaymentRow>(data);
}

async function create(input: CreatePaymentInput): Promise<PaymentRow> {
  const { data } = await apiClient.post<unknown>(PAYMENTS_ENDPOINT, input);
  return unwrapEnvelope<PaymentRow>(data);
}

async function update(
  id: number,
  input: UpdatePaymentInput,
): Promise<PaymentRow> {
  const { data } = await apiClient.patch<unknown>(
    `${PAYMENTS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<PaymentRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${PAYMENTS_ENDPOINT}/${encodeURIComponent(id)}`);
}

async function storeInstallment(
  id: number,
  input: CreateInstallmentInput,
): Promise<PaymentRow> {
  const { data } = await apiClient.post<unknown>(
    `${PAYMENTS_ENDPOINT}/${encodeURIComponent(id)}/installments`,
    input,
  );
  return unwrapEnvelope<PaymentRow>(data);
}

async function refund(id: number): Promise<PaymentRow> {
  const { data } = await apiClient.post<unknown>(
    `${PAYMENTS_ENDPOINT}/${encodeURIComponent(id)}/refund`,
  );
  return unwrapEnvelope<PaymentRow>(data);
}

export const paymentsApi = {
  list,
  create,
  update,
  remove,
  storeInstallment,
  refund,
};
