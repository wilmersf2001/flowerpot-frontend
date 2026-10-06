import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  SUBSCRIPTIONS_ENDPOINT,
  SUBSCRIPTIONS_PER_PAGE,
} from "./subscriptions.constants";
import {
  CreateSubscriptionInput,
  RenewSubscriptionInput,
  SubscriptionListParams,
  SubscriptionRow,
  UpdateSubscriptionInput,
} from "./subscriptions.types";

async function list(
  params: SubscriptionListParams = {},
): Promise<Paginated<SubscriptionRow>> {
  const { data } = await apiClient.get<unknown>(SUBSCRIPTIONS_ENDPOINT, {
    params: buildListParams(params, SUBSCRIPTIONS_PER_PAGE),
  });
  return unwrapPaginated<SubscriptionRow>(data);
}

async function create(
  input: CreateSubscriptionInput,
): Promise<SubscriptionRow> {
  const { data } = await apiClient.post<unknown>(SUBSCRIPTIONS_ENDPOINT, input);
  return unwrapEnvelope<SubscriptionRow>(data);
}

async function update(
  id: string,
  input: UpdateSubscriptionInput,
): Promise<SubscriptionRow> {
  const { data } = await apiClient.put<unknown>(
    `${SUBSCRIPTIONS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<SubscriptionRow>(data);
}

async function renew(
  id: string,
  input: RenewSubscriptionInput,
): Promise<SubscriptionRow> {
  const { data } = await apiClient.post<unknown>(
    `${SUBSCRIPTIONS_ENDPOINT}/${encodeURIComponent(id)}/renew`,
    input,
  );
  return unwrapEnvelope<SubscriptionRow>(data);
}

export const subscriptionsApi = { list, create, update, renew };
