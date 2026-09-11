import { z } from "zod";
import { boundedText, optionalText } from "@/features/_shared/form-schema";
import type { BranchRow, CreateBranchInput, UpdateBranchInput } from "./branches.types";

export const branchFormSchema = z.object({
  name: boundedText("El nombre", { max: 120 }),
  address: optionalText(255),
  phone: optionalText(30),
  timezone: optionalText(60),
});

export type BranchForm = z.infer<typeof branchFormSchema>;

export const branchFormDefaults: BranchForm = {
  name: "",
  address: "",
  phone: "",
  timezone: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const BRANCH_FORM_FIELDS = [
  "name",
  "address",
  "phone",
  "timezone",
] as const satisfies readonly (keyof BranchForm)[];

/** Prellena el formulario con los datos de una sede existente (modo edición). */
export function branchToForm(branch: BranchRow): BranchForm {
  return {
    name: branch.name,
    address: branch.address,
    phone: branch.phone,
    timezone: branch.timezone,
  };
}

/** Convierte el formulario validado al cuerpo de `POST /branches`. */
export function toCreateBranchInput(form: BranchForm): CreateBranchInput {
  return {
    name: form.name,
    address: form.address || null,
    phone: form.phone || null,
    timezone: form.timezone || null,
  };
}

/** Convierte el formulario validado al cuerpo de `PATCH /branches/{branch}`. */
export function toUpdateBranchInput(form: BranchForm): UpdateBranchInput {
  return {
    name: form.name,
    address: form.address || null,
    phone: form.phone || null,
    timezone: form.timezone || null,
  };
}
