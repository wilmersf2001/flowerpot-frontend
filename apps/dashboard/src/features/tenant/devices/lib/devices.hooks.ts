import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import { devicesApi } from "./devices.api";
import { deviceKeys } from "./devices.keys";
import type { DeviceListParams, DeviceRow, UpdateDeviceInput } from "./devices.types";

export function useDevices(params: DeviceListParams = {}) {
  return useQuery({
    queryKey: deviceKeys.list(params),
    queryFn: () => devicesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateDeviceInput }) =>
      devicesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deviceKeys.all }),
  });
}

/**
 * Activa/desactiva un lector al vuelo (el `Switch` de la tabla), con
 * actualización optimista: se revierte si el backend falla.
 */
export function useToggleDeviceActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      devicesApi.update(id, { is_active: isActive }),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: deviceKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<DeviceRow>>({
        queryKey: deviceKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<DeviceRow>>(key, {
          ...page,
          data: page.data.map((d) => (d.id === id ? { ...d, is_active: isActive } : d)),
        });
      }
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: deviceKeys.all }),
  });
}
