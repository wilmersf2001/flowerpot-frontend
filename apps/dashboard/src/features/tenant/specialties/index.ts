export { SpecialtiesPage } from "./specialties-page";

export {
  useSpecialties,
  useSpecialtyOptions,
  useCreateSpecialty,
  useUpdateSpecialty,
  useDeleteSpecialty,
  useRestoreSpecialty,
  useToggleSpecialtyActive,
} from "./lib/specialties.hooks";
export { specialtiesApi } from "./lib/specialties.api";
export type {
  SpecialtyRow,
  SpecialtyListParams,
  CreateSpecialtyInput,
  UpdateSpecialtyInput,
} from "./lib/specialties.types";
