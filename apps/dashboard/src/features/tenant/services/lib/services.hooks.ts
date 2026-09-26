import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { servicesApi } from "./services.api";
import { SERVICE_TYPE_LABELS } from "./services.constants";
import { serviceKeys } from "./services.keys";
import type {
  CreateServiceInput,
  ServiceFilters,
  ServiceListParams,
  ServiceRow,
  UpdateServiceInput,
} from "./services.types";

/** Lista paginada de servicios, con búsqueda opcional (`search`). */
export function useServices(params: ServiceListParams = {}) {
  return useQuery({
    queryKey: serviceKeys.list(params),
    queryFn: () => servicesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Fila de servicio -> opción de combobox (nombre + tipo como texto secundario). */
const toServiceOption = (service: ServiceRow): ComboboxOption => ({
  value: String(service.id),
  label: service.name,
  hint: SERVICE_TYPE_LABELS[service.type],
});

/** Opciones de servicio para el multi-select del formulario de planes (catálogo acotado, una sola página). */
export function useServiceOptions(enabled = true, filters: ServiceFilters = {}) {
  return useAsyncOptions<ServiceRow>({
    queryKey: (search) => serviceKeys.options(search, filters),
    fetchPage: ({ search, page }) =>
      servicesApi.list({ search, page, perPage: 100, ...filters }),
    toOption: toServiceOption,
    enabled,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceInput) => servicesApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateServiceInput }) =>
      servicesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => servicesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

/**
 * Activa/desactiva un servicio al vuelo (el `Switch` de la tabla): `PATCH` con
 * solo `is_active`, con actualización optimista y reversa si falla.
 */
export function useToggleServiceActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      servicesApi.update(id, { is_active: isActive }),
    onMutate: async ({ id, isActive }) => {
      await queryClient.cancelQueries({ queryKey: serviceKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<ServiceRow>>({
        queryKey: serviceKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<ServiceRow>>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === id ? { ...row, is_active: isActive } : row,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}
