import type { COMPANY_IMAGE_TYPES } from "./company-profile.constants";

export type CompanyImageType = (typeof COMPANY_IMAGE_TYPES)[number];

export interface DocumentLayoutOption {
  key: string;
  label: string;
}

/** `CompanyProfileResource`. Las imágenes llegan como data URI (o `null`). */
export interface CompanyProfile {
  id: number;
  legal_name: string | null;
  trade_name: string | null;
  ruc: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  legal_rep_name: string | null;
  legal_rep_dni: string | null;
  primary_color: string;
  secondary_color: string;
  document_layout: string;
  images: Record<CompanyImageType, string | null>;
  available_layouts: DocumentLayoutOption[];
  updated_at: string | null;
}

/** Cuerpo de `PATCH /company-profile` (`UpdateCompanyProfileRequest`). */
export interface UpdateCompanyProfileInput {
  legal_name?: string | null;
  trade_name?: string | null;
  ruc?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  legal_rep_name?: string | null;
  legal_rep_dni?: string | null;
  primary_color?: string;
  secondary_color?: string;
  document_layout?: string;
}
