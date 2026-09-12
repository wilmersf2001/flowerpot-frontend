import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Paginated } from "@repo/types";
import type { ComboboxOption } from "@repo/ui/combobox";
import { useSelectedBranch } from "@/components/branch";
import { useAsyncOptions } from "@/features/_shared/use-async-options";
import { membersApi } from "./members.api";
import { memberKeys } from "./members.keys";
import { CreateMemberInput, MemberListParams, MemberRow, UpdateMemberInput } from "./members.types";

/**
 * Lista paginada de socios, con búsqueda opcional (`search`), filtrada por la
 * sede activa del switcher global — la página no la pasa, se toma sola.
 *
 * Deshabilitada mientras `selectedBranchId` es `null` (branches del usuario
 * todavía cargando): así se evita mandar el listado sin filtro de sede y que
 * el usuario vea, aunque sea un instante, socios de otra sede.
 */
export function useMembers(params: MemberListParams = {}) {
  const { selectedBranchId } = useSelectedBranch();
  const listParams: MemberListParams = { ...params, branchId: selectedBranchId };
  return useQuery({
    queryKey: memberKeys.list(listParams),
    queryFn: () => membersApi.list(listParams),
    placeholderData: keepPreviousData,
    enabled: selectedBranchId != null,
  });
}

/** Crea un socio en la sede activa del switcher global. */
export function useCreateMember() {
  const queryClient = useQueryClient();
  const { selectedBranchId } = useSelectedBranch();
  return useMutation({
    mutationFn: (input: CreateMemberInput) =>
      membersApi.create({
        ...input,
        branch_id: selectedBranchId ? Number(selectedBranchId) : null,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.all }),
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMemberInput }) =>
      membersApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.all }),
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => membersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.all }),
  });
}

export function useRestoreMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => membersApi.restore(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: memberKeys.all }),
  });
}

/**
 * Activa/desactiva un socio al vuelo (el `Switch` de la tabla), con
 * actualización optimista: la fila cambia de estado en el acto y se revierte
 * si el backend falla. No hay endpoint dedicado; se usa el `update` general
 * enviando solo `is_active`.
 */
export function useToggleMemberActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (member: MemberRow) =>
      membersApi.update(member.id, { is_active: !member.is_active }),
    onMutate: async (member: MemberRow) => {
      await queryClient.cancelQueries({ queryKey: memberKeys.lists() });
      const snapshots = queryClient.getQueriesData<Paginated<MemberRow>>({
        queryKey: memberKeys.lists(),
      });
      for (const [key, page] of snapshots) {
        if (!page) continue;
        queryClient.setQueryData<Paginated<MemberRow>>(key, {
          ...page,
          data: page.data.map((row) =>
            row.id === member.id ? { ...row, is_active: !row.is_active } : row,
          ),
        });
      }
      return { snapshots };
    },
    onError: (_err, _member, context) => {
      for (const [key, page] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, page);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: memberKeys.all }),
  });
}

const toMemberOption = (member: MemberRow): ComboboxOption => ({
  value: member.id,
  label: member.full_name || `${member.first_name} ${member.last_name}`.trim(),
  hint: member.dni || undefined,
});

/** Opciones asíncronas de socio (buscador por nombre/DNI) para combobox. */
export function useMemberOptions(enabled = true) {
  return useAsyncOptions<MemberRow>({
    queryKey: memberKeys.options,
    fetchPage: ({ search, page }) => membersApi.list({ search, page, perPage: 20 }),
    toOption: toMemberOption,
    enabled,
  });
}
