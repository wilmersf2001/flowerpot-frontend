import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { equipmentKeys } from "@/features/tenant/equipment";
import { equipmentMaintenancesApi } from "./equipment-maintenances.api";
import { equipmentMaintenanceKeys } from "./equipment-maintenances.keys";
import {
  CompleteEquipmentMaintenanceInput,
  CreateEquipmentMaintenanceInput,
  EquipmentMaintenanceListParams,
  UpdateEquipmentMaintenanceInput,
} from "./equipment-maintenances.types";

/** Lista paginada de mantenimientos, con filtros opcionales. */
export function useEquipmentMaintenances(params: EquipmentMaintenanceListParams = {}) {
  return useQuery({
    queryKey: equipmentMaintenanceKeys.list(params),
    queryFn: () => equipmentMaintenancesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/**
 * Crea un mantenimiento. Un correctivo pone el equipo en `en_mantenimiento`
 * de inmediato, así que también se invalida el listado de equipos.
 */
export function useCreateEquipmentMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEquipmentMaintenanceInput) => equipmentMaintenancesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
    },
  });
}

/** Solo válido si el mantenimiento está `programado`. */
export function useUpdateEquipmentMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEquipmentMaintenanceInput }) =>
      equipmentMaintenancesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all }),
  });
}

export function useDeleteEquipmentMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentMaintenancesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all }),
  });
}

export function useRestoreEquipmentMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentMaintenancesApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all }),
  });
}

/** `programado -> en_progreso`. Pone el equipo en `en_mantenimiento`. */
export function useStartEquipmentMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentMaintenancesApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
    },
  });
}

/** `en_progreso -> completado`. Devuelve el equipo a `operativo`. */
export function useCompleteEquipmentMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CompleteEquipmentMaintenanceInput }) =>
      equipmentMaintenancesApi.complete(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
    },
  });
}

/** `programado -> cancelado`. No modifica el estado del equipo. */
export function useCancelEquipmentMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentMaintenancesApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all }),
  });
}
