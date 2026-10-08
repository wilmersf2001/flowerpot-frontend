/** Fábrica de query-keys de React Query para el perfil de empresa. */
export const companyProfileKeys = {
  all: ["company-profile"] as const,
  detail: () => [...companyProfileKeys.all, "detail"] as const,
};
