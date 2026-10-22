import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { memberKeys } from "@/features/tenant/members";
import { leadsApi } from "./leads.api";
import { leadKeys } from "./leads.keys";
import type { ConvertLeadInput, CreateLeadInput, LeadListParams, UpdateLeadInput } from "./leads.types";

export { useBranchOptions } from "@/features/tenant/branches";

export function useLeads(params: LeadListParams = {}) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => leadsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateLeads() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: leadKeys.all });
}

export function useCreateLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (input: CreateLeadInput) => leadsApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateLeadInput }) => leadsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: (id: number) => leadsApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useAdvanceLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({ mutationFn: (id: number) => leadsApi.advance(id), onSuccess: invalidate });
}

export function useLoseLead() {
  const invalidate = useInvalidateLeads();
  return useMutation({ mutationFn: (id: number) => leadsApi.lose(id), onSuccess: invalidate });
}

/** Convertir en socio crea un `Member`: refresca también el módulo de socios. */
export function useConvertLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ConvertLeadInput }) => leadsApi.convert(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadKeys.all });
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
    },
  });
}

export function useImportLeads() {
  const invalidate = useInvalidateLeads();
  return useMutation({
    mutationFn: ({ file, branchId }: { file: File; branchId?: number }) => leadsApi.importFile(file, branchId),
    onSuccess: invalidate,
  });
}
