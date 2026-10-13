import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { devicesApi } from "./devices.api";
import { deviceKeys } from "./devices.keys";
import type {
  CreateDeviceInput,
  DeviceListParams,
  DeviceRow,
  UpdateDeviceInput,
} from "./devices.types";

/** Lista paginada de lectores, con búsqueda y filtros (`tenant_id`, `online`). */
export function useDevices(params: DeviceListParams = {}, enabled = true) {
  return useQuery({
    queryKey: deviceKeys.list(params),
    queryFn: () => devicesApi.list(params),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDeviceInput) => devicesApi.create(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: deviceKeys.all }),
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: DeviceRow["id"];
      input: UpdateDeviceInput;
    }) => devicesApi.update(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: deviceKeys.all }),
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: DeviceRow["id"]) => devicesApi.remove(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: deviceKeys.all }),
  });
}
