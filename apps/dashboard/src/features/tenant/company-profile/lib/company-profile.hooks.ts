import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyProfileApi } from "./company-profile.api";
import { companyProfileKeys } from "./company-profile.keys";
import type {
  CompanyImageType,
  UpdateCompanyProfileInput,
} from "./company-profile.types";

export function useCompanyProfile() {
  return useQuery({
    queryKey: companyProfileKeys.detail(),
    queryFn: companyProfileApi.show,
  });
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCompanyProfileInput) =>
      companyProfileApi.update(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: companyProfileKeys.all }),
  });
}

export function useUploadCompanyImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, file }: { type: CompanyImageType; file: File }) =>
      companyProfileApi.uploadImage(type, file),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: companyProfileKeys.all }),
  });
}

export function useDeleteCompanyImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type: CompanyImageType) => companyProfileApi.deleteImage(type),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: companyProfileKeys.all }),
  });
}

/** Genera el PDF de ejemplo (sin caché: depende del layout y de la marca guardada). */
export function usePreviewCompanyProfile() {
  return useMutation({
    mutationFn: (layout?: string) => companyProfileApi.preview(layout),
  });
}
