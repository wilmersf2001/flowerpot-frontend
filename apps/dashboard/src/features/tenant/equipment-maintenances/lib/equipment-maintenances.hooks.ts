import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelectedBranch } from "@/components/branch";
import { equipmentKeys } from "@/features/tenant/equipment";
import { equipmentMaintenancesApi } from "./equipment-maintenances.api";
import { equipmentMaintenanceKeys } from "./equipment-maintenances.keys";
import {
  CompleteEquipmentMaintenanceInput,
  CreateEquipmentMaintenanceInput,
  EquipmentMaintenanceListParams,
  UpdateEquipmentMaintenanceInput,
} from "./equipment-maintenances.types";

/** Key cruda de caja (evita acoplar con el módulo `cash-register`); completar/cancelar mueve caja. */
const CASH_REGISTER_KEY = ["cash-register"] as const;

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
    mutationFn: ({ id, input }: { id: number; input: UpdateEquipmentMaintenanceInput }) =>
      equipmentMaintenancesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all }),
  });
}

export function useDeleteEquipmentMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equipmentMaintenancesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all }),
  });
}

export function useRestoreEquipmentMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equipmentMaintenancesApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all }),
  });
}

/** `programado -> en_progreso`. Pone el equipo en `en_mantenimiento`. */
export function useStartEquipmentMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equipmentMaintenancesApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
    },
  });
}

/** `en_progreso -> completado`. Devuelve el equipo a `operativo`. */
export function useCompleteEquipmentMaintenance() {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useSelectedBranch();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CompleteEquipmentMaintenanceInput }) =>
      equipmentMaintenancesApi.complete(id, {
        ...input,
        branch_id: selectedBranchId ? Number(selectedBranchId) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all });
      queryClient.invalidateQueries({ queryKey: equipmentKeys.all });
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEY });
    },
  });
}

/**
 * `programado -> cancelado` o `completado -> cancelado` (revierte el movimiento
 * de caja). Un `en_progreso` no se puede cancelar.
 */
export function useCancelEquipmentMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => equipmentMaintenancesApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: equipmentMaintenanceKeys.all });
      queryClient.invalidateQueries({ queryKey: CASH_REGISTER_KEY });
    },
  });
}
