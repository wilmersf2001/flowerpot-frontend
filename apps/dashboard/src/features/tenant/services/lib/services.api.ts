import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import type { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { SERVICES_ENDPOINT, SERVICES_PER_PAGE } from "./services.constants";
import type {
  CreateServiceInput,
  ServiceListParams,
  ServiceRow,
  UpdateServiceInput,
} from "./services.types";

async function list(params: ServiceListParams = {}): Promise<Paginated<ServiceRow>> {
  const { data } = await apiClient.get<unknown>(SERVICES_ENDPOINT, {
    params: buildListParams(params, SERVICES_PER_PAGE),
  });
  return unwrapPaginated<ServiceRow>(data);
}

async function create(input: CreateServiceInput): Promise<ServiceRow> {
  const { data } = await apiClient.post<unknown>(SERVICES_ENDPOINT, input);
  return unwrapEnvelope<ServiceRow>(data);
}

async function update(id: number, input: UpdateServiceInput): Promise<ServiceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${SERVICES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<ServiceRow>(data);
}

async function remove(id: number): Promise<void> {
  await apiClient.delete(`${SERVICES_ENDPOINT}/${encodeURIComponent(id)}`);
}

export const servicesApi = { list, create, update, remove };
