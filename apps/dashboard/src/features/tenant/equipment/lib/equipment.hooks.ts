import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { equipmentApi } from "./equipment.api";
import { equipmentKeys } from "./equipment.keys";
import { CreateEquipmentInput, EquipmentListParams, EquipmentRow, UpdateEquipmentInput } from "./equipment.types";

/** Lista paginada de equipos, con búsqueda y filtros (categoría, sede, estado) opcionales. */
export function useEquipmentList(params: EquipmentListParams = {}) {
  return useQuery({
    queryKey: equipmentKeys.list(params),
    queryFn: () => equipmentApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Detalle de un equipo (con categoría, sede e historial de mantenimientos). */
export function useEquipmentDetail(id: string | null) {
  return useQuery({
    queryKey: equipmentKeys.detail(id ?? ""),
    queryFn: () => equipmentApi.show(id as string),
    enabled: id !== null,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEquipmentInput) => equipmentApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentKeys.all }),
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEquipmentInput }) =>
      equipmentApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentKeys.all }),
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentKeys.all }),
  });
}

export function useRestoreEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentKeys.all }),
  });
}

/** Da de baja un equipo. Falla (toast) si tiene un mantenimiento abierto. */
export function useDecommissionEquipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipmentApi.decommission(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: equipmentKeys.all }),
  });
}

const toEquipmentOption = (equipment: EquipmentRow): ComboboxOption => ({
  value: equipment.id,
  label: equipment.name,
  hint: equipment.status === "dado_de_baja" ? "Dado de baja" : (equipment.serial_number ?? undefined),
});

/**
 * Opciones asíncronas de equipo (buscador por nombre, marca, modelo o serie)
 * para combobox. Se usa en el formulario de mantenimientos; el backend no
 * valida que el equipo esté dado de baja, así que se marca en el `hint` para
 * que el usuario no lo seleccione por error.
 */
export function useEquipmentOptions(enabled = true) {
  return useAsyncOptions<EquipmentRow>({
    queryKey: equipmentKeys.options,
    fetchPage: ({ search, page }) => equipmentApi.list({ search, page, perPage: 20 }),
    toOption: toEquipmentOption,
    enabled,
  });
}
