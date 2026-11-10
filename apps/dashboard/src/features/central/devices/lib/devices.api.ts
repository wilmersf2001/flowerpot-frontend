import {
  apiClient,
  unwrapEnvelope,
  unwrapPaginated,
  type Paginated,
} from "@repo/api-client";
import { buildListParams } from "@/features/_shared/list-params";
import { DEVICES_ENDPOINT, DEVICES_PER_PAGE } from "./devices.constants";
import type {
  CreateDeviceInput,
  DeviceListParams,
  DeviceRow,
  UpdateDeviceInput,
} from "./devices.types";

const itemUrl = (id: DeviceRow["id"]) =>
  `${DEVICES_ENDPOINT}/${encodeURIComponent(String(id))}`;

async function list(
  params: DeviceListParams = {},
): Promise<Paginated<DeviceRow>> {
  const { data } = await apiClient.get<unknown>(DEVICES_ENDPOINT, {
    params: buildListParams(params, DEVICES_PER_PAGE),
  });
  return unwrapPaginated<DeviceRow>(data);
}

async function create(input: CreateDeviceInput): Promise<DeviceRow> {
  const { data } = await apiClient.post<unknown>(DEVICES_ENDPOINT, input);
  return unwrapEnvelope<DeviceRow>(data);
}

async function update(
  id: DeviceRow["id"],
  input: UpdateDeviceInput,
): Promise<DeviceRow> {
  const { data } = await apiClient.patch<unknown>(itemUrl(id), input);
  return unwrapEnvelope<DeviceRow>(data);
}

async function remove(id: DeviceRow["id"]): Promise<void> {
  await apiClient.delete(itemUrl(id));
}

export const devicesApi = { list, create, update, remove };
