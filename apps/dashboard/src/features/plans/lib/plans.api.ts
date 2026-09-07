import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import { Paginated } from "@repo/types";
import { PLANS_ENDPOINT, PLANS_PER_PAGE } from "./plans.constants";
import {
  CreatePlanInput,
  PlanListParams,
  PlanRow,
  UpdatePlanInput,
} from "./plans.types";

async function list(params: PlanListParams = {}): Promise<Paginated<PlanRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(PLANS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? PLANS_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  return unwrapPaginated<PlanRow>(data);
}

async function create(input: CreatePlanInput): Promise<PlanRow> {
  const { data } = await apiClient.post<unknown>(PLANS_ENDPOINT, input);
  return unwrapEnvelope<PlanRow>(data);
}

async function update(
  id: string,
  input: UpdatePlanInput,
): Promise<PlanRow> {
  const { data } = await apiClient.put<unknown>(
    `${PLANS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<PlanRow>(data);
}

async function remove(id: string): Promise<void> {
  await apiClient.delete(`${PLANS_ENDPOINT}/${encodeURIComponent(id)}`);
}

export const plansApi = { list, create, update, remove };
