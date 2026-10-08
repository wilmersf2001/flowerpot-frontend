import { apiClient, unwrapEnvelope } from "@repo/api-client";
import { fetchPdf } from "@/features/_shared/pdf";
import { COMPANY_PROFILE_ENDPOINT } from "./company-profile.constants";
import type {
  CompanyImageType,
  CompanyProfile,
  UpdateCompanyProfileInput,
} from "./company-profile.types";

const imageUrl = (type: CompanyImageType) =>
  `${COMPANY_PROFILE_ENDPOINT}/images/${encodeURIComponent(type)}`;

async function show(): Promise<CompanyProfile> {
  const { data } = await apiClient.get<unknown>(COMPANY_PROFILE_ENDPOINT);
  return unwrapEnvelope<CompanyProfile>(data);
}

async function update(
  input: UpdateCompanyProfileInput,
): Promise<CompanyProfile> {
  const { data } = await apiClient.patch<unknown>(
    COMPANY_PROFILE_ENDPOINT,
    input,
  );
  return unwrapEnvelope<CompanyProfile>(data);
}

/** Sube (o reemplaza) una imagen de marca. Multipart, campo `image`. */
async function uploadImage(
  type: CompanyImageType,
  file: File,
): Promise<CompanyProfile> {
  const body = new FormData();
  body.append("image", file);
  const { data } = await apiClient.post<unknown>(imageUrl(type), body);
  return unwrapEnvelope<CompanyProfile>(data);
}

async function deleteImage(type: CompanyImageType): Promise<CompanyProfile> {
  const { data } = await apiClient.delete<unknown>(imageUrl(type));
  return unwrapEnvelope<CompanyProfile>(data);
}

/** PDF de ejemplo con la marca guardada. `layout` permite probar otro formato. */
async function preview(layout?: string): Promise<Blob> {
  const { blob } = await fetchPdf(`${COMPANY_PROFILE_ENDPOINT}/preview`, {
    layout,
  });
  return blob;
}

export const companyProfileApi = {
  show,
  update,
  uploadImage,
  deleteImage,
  preview,
};
