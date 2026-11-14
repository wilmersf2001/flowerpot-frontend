import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import type { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import {
  PROMOTIONS_ENDPOINT,
  PROMOTIONS_PER_PAGE,
} from "./promotions.constants";
import type {
  PromotionInput,
  PromotionListParams,
  PromotionRow,
} from "./promotions.types";

const url = (id: string) => `${PROMOTIONS_ENDPOINT}/${encodeURIComponent(id)}`;

async function list(
  params: PromotionListParams = {},
): Promise<Paginated<PromotionRow>> {
  const { data } = await apiClient.get<unknown>(PROMOTIONS_ENDPOINT, {
    params: buildListParams(params, PROMOTIONS_PER_PAGE),
  });
  return unwrapPaginated<PromotionRow>(data);
}

async function create(input: PromotionInput): Promise<PromotionRow> {
  const { data } = await apiClient.post<unknown>(PROMOTIONS_ENDPOINT, input);
  return unwrapEnvelope<PromotionRow>(data);
}

async function update(
  id: string,
  input: Partial<PromotionInput>,
): Promise<PromotionRow> {
  const { data } = await apiClient.put<unknown>(url(id), input);
  return unwrapEnvelope<PromotionRow>(data);
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(url(id));
}

export const promotionsApi = { list, create, update, remove };
