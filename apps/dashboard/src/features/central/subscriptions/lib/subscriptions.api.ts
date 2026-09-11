import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import {
  SUBSCRIPTIONS_ENDPOINT,
  SUBSCRIPTIONS_PER_PAGE,
} from "./subscriptions.constants";
import {
  CreateSubscriptionInput,
  SubscriptionListParams,
  SubscriptionRow,
  UpdateSubscriptionInput,
} from "./subscriptions.types";

async function list(
  params: SubscriptionListParams = {},
): Promise<Paginated<SubscriptionRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(SUBSCRIPTIONS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? SUBSCRIPTIONS_PER_PAGE,
      search: search ? search : undefined,
    },
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

export const subscriptionsApi = { list, create, update };
