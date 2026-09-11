import { Paginated } from "@repo/types";
import {
  GymSettingsListParams,
  GymSettingsRow,
  UpdateGymSettingsInput,
} from "./gym-settings.types";
import {
  GYM_SETTINGS_ENDPOINT,
  GYM_SETTINGS_PER_PAGE,
} from "./gym-settings.constants";
import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";

async function list(
  params: GymSettingsListParams = {},
): Promise<Paginated<GymSettingsRow>> {
  const search = params.search?.trim();
  const { data } = await apiClient.get<unknown>(GYM_SETTINGS_ENDPOINT, {
    params: {
      page: params.page ?? 1,
      per_page: params.perPage ?? GYM_SETTINGS_PER_PAGE,
      search: search ? search : undefined,
    },
  });
  return unwrapPaginated<GymSettingsRow>(data);
}

async function update(
  id: string,
  input: UpdateGymSettingsInput,
): Promise<GymSettingsRow> {
  const { data } = await apiClient.put<unknown>(
    `${GYM_SETTINGS_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<GymSettingsRow>(data);
}

export const gymSettingsApi = { list, update };
