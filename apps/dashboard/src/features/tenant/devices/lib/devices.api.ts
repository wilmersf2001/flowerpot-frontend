import { apiClient, unwrapEnvelope, unwrapPaginated } from "@repo/api-client";
import type { Paginated } from "@repo/types";
import { buildListParams } from "@/features/_shared/list-params";
import { DEVICES_ENDPOINT, DEVICES_PER_PAGE } from "./devices.constants";
import type { DeviceListParams, DeviceRow, UpdateDeviceInput } from "./devices.types";

async function list(params: DeviceListParams = {}): Promise<Paginated<DeviceRow>> {
  const { data } = await apiClient.get<unknown>(DEVICES_ENDPOINT, {
    params: buildListParams(params, DEVICES_PER_PAGE),
  });
  return unwrapPaginated<DeviceRow>(data);
}

async function update(id: number, input: UpdateDeviceInput): Promise<DeviceRow> {
  const { data } = await apiClient.patch<unknown>(
    `${DEVICES_ENDPOINT}/${encodeURIComponent(id)}`,
    input,
  );
  return unwrapEnvelope<DeviceRow>(data);
}

export const devicesApi = { list, update };
